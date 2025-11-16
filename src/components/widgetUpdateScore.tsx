import { useState, useEffect } from 'react';
import Input from './input';
import SelectChip from './selectChip';
import { toTitleCase } from '../lib/formatting';
import { DataItem, GameDataItem, RosterDataItem, ScoreDataItem, UnitItem } from '../lib/types';
import { PlusCircledIcon } from '@radix-ui/react-icons';
import { usePlayerStore } from '../stores/playersStore';
import { useRosterStore } from '../stores/rostersStore';
import { useScoreStore } from '../stores/scoresStore';
import { z } from 'zod';

type ComponentProps = {
  gameData: GameDataItem | null;
};

type FormData = {
  unit_id: number;
  unit_type: string;
  datum: number | string;
  player: string | undefined;
  game: string | undefined;
};

function UpdateScore(props: ComponentProps): JSX.Element {
  const { gameData } = props;
  const { data, snowflake, roster } = gameData || {};

  // Get the actual unit objects from mechanics, not just the filtered unit names
  const units = data?.mechanics?.units || [];
  const firstUnitId = units.length > 0 ? units[0].id : 0;
  const { players, fetchPlayers } = usePlayerStore();
  const { rosters } = useRosterStore(); 
  const { createScore, error } = useScoreStore();
  const [formErrors, setFormErrors] = useState<string>('');
  const [form, setForm] = useState({
    unit_id: firstUnitId,
    amount: '',
    player: '',
    game: snowflake,
  });

  const allowList = roster
    ? rosters.find((rosterItem: RosterDataItem) => rosterItem.snowflake === roster)?.allow
    : null;
  const usedPlayers = allowList && allowList.length > 0
    ? players?.filter((player: DataItem) => allowList?.includes(player?.snowflake || ''))
    : players;

  const resetForm = () => {
    setForm({
      unit_id: firstUnitId,
      amount: '',
      player: '',
      game: snowflake,
    });
  };
  const createNewScore = async (formData: typeof form) => {
  const formSchema = z.object({
    unit_id: z.number(),
    unit_type: z.string().min(1, 'Unit type is required'),
    datum: z.union([z.number(), z.string().min(1, 'Amount is required')]),
    player: z.string().min(1, 'Player is required').optional(),
    game: z.string().min(1, 'Game ID is required').optional(),
  });    
    try {
      // Find the selected unit to get its ID
      const selectedUnit = gameData?.data?.mechanics?.units?.find(
        (u: UnitItem) => u.id === formData.unit_id
      );

      if (!selectedUnit) {
        throw new Error('Selected unit not found');
      }

      // Transform the form data to match the new schema
      const scoreData: FormData = {
        unit_id: selectedUnit.id,
        unit_type: selectedUnit.type,
        datum: typeof formData.amount === 'string' ? Number(formData.amount) : Number(formData.amount),
        player: formData.player,
        game: formData.game,
      };

      formSchema.parse(scoreData);
      const createdScore = await createScore(scoreData as unknown as ScoreDataItem);
      // If we get here and there's no error in the store, creation was successful
      if (!error && createdScore) {
        resetForm();
        return true;
      }
      throw new Error(error || 'Failed to create score');
    } catch (err) {
      console.error('Error in createNewScore:', err);
      if (err instanceof z.ZodError) {
        setFormErrors(err.errors[0].message);
      } else {
        // Handle other errors (like creation/editing failure)
        setFormErrors(err instanceof Error ? err.message : 'Failed to process score');
      }
      return false;
    }
  };

  const handleFormChange = (Event: React.ChangeEvent<HTMLInputElement>) => {
    const eventTarget = Event?.target;
    const clonedForm = JSON.parse(JSON.stringify(form));
    const formKey = eventTarget?.name;
    const formValue = eventTarget?.value;
    clonedForm[`${formKey}`] = formValue;
    setForm(clonedForm);
  };

  const handleSelectFormChange = (value: string, fieldName: string = 'player') => {
    const clonedForm = JSON.parse(JSON.stringify(form));
    if (fieldName === 'unit_id') {
      clonedForm.unit_id = Number(value);
    } else {
      clonedForm[fieldName] = value;
    }
    setForm(clonedForm);
  };
  const handleFormFocus = (Event: React.FocusEvent<HTMLInputElement>) => {
    const eventTarget = Event?.target;
    const clonedForm = JSON.parse(JSON.stringify(form));
    const formKey = eventTarget?.name;
    clonedForm[`${formKey}`] = '';
    setForm(clonedForm);
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  return (
    <div className=" bg-slate-700 rounded-lg p-2 shadow-sm">
      <div className="flex flex-col items-center justify-start p-2 pt-0">
        <h3 className="text-lg font-medium pb-1 w-full text-center">
          {`Update Player ${units.length > 0 ? toTitleCase(units[0].name) : 'Score'}`}
        </h3>
        <SelectChip
          moreClasses="min-w-full rounded-md min-h-[44px]"
          selections={
            units
              ? units.map((item: UnitItem) => ({
                  label: item.name,
                  key: item.id,
                  value: String(item.id),
                  data: { snowflake: item.id },
                }))
              : []
          }
          noAvatar={true}
          defaultValue={String(form.unit_id)}
          selectPlaceholder="Select Unit"
          handleSelect={(value) => handleSelectFormChange(value, 'unit_id')}
        />
        <Input
          name="amount"
          value={form.amount}
          align="right"
          placeholder="0"
          changeHandler={handleFormChange}
          focusHandler={handleFormFocus}
        />
        <SelectChip
          moreClasses="min-w-full rounded-md mb-3 min-h-[44px]"
          selections={
            players
              ? usedPlayers.map((item: DataItem) => ({
                  label: item.name,
                  key: item.snowflake,
                  value: item.snowflake,
                  data: { snowflake: item.snowflake },
                }))
              : []
          }
          defaultValue={form.player}
          selectPlaceholder="Select Player"
          handleSelect={(value) => handleSelectFormChange(value)}
        />
        <button
          className="
                        flex select-none
                        items-center
                        justify-center
                        cursor-pointer
                        rounded
                        shadow-sm
                        p-2
                        w-full
                        text-lg
                        gap-1.5
                        font-medium
                        bg-sky-700
                        hover:bg-sky-600/80
                        active:bg-sky-600/90
                        disabled:bg-sky-600/50
                        disabled:cursor-not-allowed
                        transition-colors
                        duration-200
                        mt-2
                    "
          onClick={() => createNewScore(form)}
        >
          <PlusCircledIcon width="20" height="20" /> Add Score
        </button>
        {formErrors && (
          <p
            className="
                    text-red-500
                    bg-red-500/10
                    rounded-md
                    mt-2
                    p-1
                    w-full
                    text-center
                    "
          >
            {formErrors}
          </p>
        )}
      </div>
    </div>
  );
}

export default UpdateScore;
