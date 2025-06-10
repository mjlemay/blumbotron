import { useState, useEffect } from 'react';
import Input from './input';
import SelectChip from './selectChip';
import { toTitleCase } from '../lib/formatting';
import { DataItem, GameDataItem, RosterDataItem, ScoreDataItem } from '../lib/types';
import { PlusCircledIcon } from '@radix-ui/react-icons';
import { usePlayerStore } from '../stores/playersStore';
import { useRosterStore } from '../stores/rostersStore';
import { useScoreStore } from '../stores/scoresStore';
import { z } from 'zod';

type ComponentProps = {
  children?: React.ReactNode;
  gameData: GameDataItem | null;
};

type FormData = {
  units: string;
  amount: number | string;
  player: string | undefined;
  game: string | undefined;
};

function UpdateScore(props: ComponentProps): JSX.Element {
  const { gameData } = props;
  const { data } = gameData ? gameData : {};
  const { snowflake, roster } = gameData ? gameData : {};
  const units: string = data ? JSON.parse(data).units[0] : 'Score';
  const { players, fetchPlayers } = usePlayerStore();
  const { rosters } = useRosterStore();
  const { createScore, error } = useScoreStore();
  const [formErrors, setFormErrors] = useState('');
  const [form, setForm] = useState({
    units,
    amount: '',
    player: '',
    game: snowflake,
  });

  const allowList = roster
    ? rosters.find((rosterItem: RosterDataItem) => rosterItem.snowflake === roster)?.allow
    : null;
  const usedPlayers = allowList
    ? players?.filter((player: DataItem) => allowList?.includes(player?.snowflake || ''))
    : players;

  const resetForm = () => {
    setForm({
      units,
      amount: '',
      player: '',
      game: snowflake,
    });
  };
  const createNewScore = async (formData: FormData) => {
    const formSchema = z.object({
      units: z.string().min(1, 'Please add an amount to update'),
      amount: z.coerce.number().min(1, 'Please add an amount to update'),
      player: z.string().min(18, 'Please select a player'),
      game: z.string().min(18, 'Please select a game'),
    });

    try {
      formSchema.parse(formData);
      const createdScore = await createScore(formData as unknown as ScoreDataItem);
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
        setFormErrors('Failed to process player');
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

  const handleSelectFormChange = (value: string) => {
    const clonedForm = JSON.parse(JSON.stringify(form));
    clonedForm.player = value;
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
        <h3 className="text-lg font-medium border-b border-slate-600 pb-1 w-full text-center">{`Update Player ${toTitleCase(units)}`}</h3>
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
