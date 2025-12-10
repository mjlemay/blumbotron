import { useState, useEffect, useMemo } from 'react';
import Input from './input';
import SelectChip from './selectChip';
import { toTitleCase } from '../lib/formatting';
import { DataItem, GameDataItem, RosterDataItem, ScoreDataItem, UnitItem } from '../lib/types';
import { PlusCircledIcon } from '@radix-ui/react-icons';
import { usePlayerStore } from '../stores/playersStore';
import { useRosterStore } from '../stores/rostersStore';
import { useScoreStore } from '../stores/scoresStore';
import { z } from 'zod';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import IconRfid from './iconRfid';
import IconQr from './iconQr';
import { useRFIDNumber } from '../lib/useRFIDNumber';
import { createAvatar } from '@dicebear/core';
import { shapes } from '@dicebear/collection';
import { invoke } from '@tauri-apps/api/core';

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
  const [searchValue, setSearchValue] = useState<string>('');
  const [injected, setInjected] = useState<string>('');
  const rfidNumber = useRFIDNumber(injected !== '');
  const [avatarCache, setAvatarCache] = useState<Record<string, string>>({});
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

  const filteredPlayers = usedPlayers.filter(player => {
    if (!searchValue) return true;
    const searchLower = searchValue.toLowerCase();
    
    // Check name
    if (player.name.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Check id
    if (player.id?.toString().includes(searchValue)) {
      return true;
    }
    
    // Check snowflake
    if (player.snowflake?.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Check alternate IDs
    if (player.data && typeof player.data === 'object') {
      const alternateIds = player.data.alternateIds;
      if (alternateIds && typeof alternateIds === 'object') {
        const alternateIdsObj = alternateIds as Record<string, unknown>;
        for (const [key, value] of Object.entries(alternateIdsObj)) {
          if (key.toLowerCase().includes(searchLower) || 
              String(value).toLowerCase().includes(searchLower)) {
            return true;
          }
        }
      }
    }
    
    return false;
  });

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

  useEffect(() => {
    if (rfidNumber && injected === 'playerSearch') {
      setSearchValue(rfidNumber);
      setInjected('');
    }
  }, [rfidNumber, injected]);

  // Load avatars for filtered players
  useEffect(() => {
    const loadAvatars = async () => {
      for (const player of filteredPlayers) {
        const snowflake = player.snowflake || 'default';
        
        // Skip if already cached
        if (avatarCache[snowflake]) continue;
        
        const avatarImage = player.data && typeof player.data === 'object' 
          ? (player.data as any).avatarImage 
          : undefined;
        
        if (avatarImage) {
          try {
            let dataUrl: string;
            if (avatarImage.startsWith('data:')) {
              dataUrl = avatarImage;
            } else {
              dataUrl = await invoke('get_background_image_data', { fileName: avatarImage }) as string;
            }
            setAvatarCache(prev => ({ ...prev, [snowflake]: dataUrl }));
          } catch (error) {
            // Fall back to generated avatar
            const generatedAvatar = createAvatar(shapes, { size: 40, seed: snowflake }).toDataUri();
            setAvatarCache(prev => ({ ...prev, [snowflake]: generatedAvatar }));
          }
        } else {
          // Generate avatar
          const generatedAvatar = createAvatar(shapes, { size: 40, seed: snowflake }).toDataUri();
          setAvatarCache(prev => ({ ...prev, [snowflake]: generatedAvatar }));
        }
      }
    };
    
    loadAvatars();
  }, [filteredPlayers]);

  const handleRfidClick = () => {
    if (injected === 'playerSearch') {
      setInjected('');
      setSearchValue('');
      return;
    } else {
      setInjected('playerSearch');
    }
  };

  const selectedPlayer = useMemo(() => {
    return usedPlayers.find(p => p.snowflake === form.player);
  }, [form.player, usedPlayers]);

  const clearPlayerSelection = () => {
    handleSelectFormChange('', 'player');
    setSearchValue('');
  };

  return (
    <div className=" bg-slate-700 rounded-lg p-2 shadow-sm">
      <div className="flex flex-col items-center justify-start p-2 pt-0">
        <h3 className="text-lg font-medium pb-1 w-full text-center">
          {`Update Player ${units.length > 0 ? toTitleCase(units[0].name) : 'Score'}`}
        </h3>
        {!form.player ? (
          <>
            <div className="flex gap-2 items-center justify-center w-full">
              <Input
                name="playerSearch"
                value={searchValue}
                placeholder="Search players..."
                inline={true}
                injectable={injected === 'playerSearch'}
                changeHandler={(e: React.ChangeEvent<HTMLInputElement>) => setSearchValue(e.target.value)}
              />
              <button
                className="
                  flex select-none
                  items-center
                  justify-center
                  cursor-pointer
                  rounded
                  shadow-sm
                  h-[42px]
                  w-[42px]
                  bg-slate-800
                  hover:bg-slate-700
                  active:bg-slate-700/90
                  transition-colors
                  duration-200
                "
                onClick={handleRfidClick}
              >
                <IconRfid />
              </button>
              <button
                className="
                  flex select-none
                  items-center
                  justify-center
                  cursor-pointer
                  rounded
                  shadow-sm
                  h-[42px]
                  w-[42px]
                  bg-slate-800
                  hover:bg-slate-700
                  active:bg-slate-700/90
                  transition-colors
                  duration-200
                "
                onClick={handleRfidClick}
              >
                <IconQr />
              </button>
            </div>
            <ScrollArea.Root className="w-full max-h-48 rounded bg-slate-800/50 overflow-hidden mb-3">
          <ScrollArea.Viewport className="w-full h-full rounded">
            <div className="flex flex-col gap-1 p-1">
              {filteredPlayers.map((player: DataItem) => {
                const playerSnowflake = player.snowflake || 'default';
                const avatar = avatarCache[playerSnowflake] || createAvatar(shapes, { size: 40, seed: playerSnowflake }).toDataUri();
                
                return (
                  <button
                    key={player.snowflake}
                    onClick={() => {
                      handleSelectFormChange(player.snowflake || '', 'player');
                      setSearchValue('');
                    }}
                    className={`
                      text-left px-3 py-2 rounded transition-colors flex flex-row items-center gap-3
                      ${form.player === player.snowflake 
                        ? 'bg-sky-700 text-white' 
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}
                    `}
                  >
                    <img 
                      src={avatar} 
                      alt={`${player.name} avatar`} 
                      className="rounded-lg w-10 h-10 object-cover flex-shrink-0" 
                    />
                    <div className="flex-1">
                      <div className="font-medium">{player.name}</div>
                      {player.snowflake && (
                        <div className="text-xs text-slate-400">#{player.snowflake}</div>
                      )}
                    </div>
                  </button>
                );
              })}
              {filteredPlayers.length === 0 && (
                <div className="text-slate-400 text-center py-4">
                  No players found
                </div>
              )}
            </div>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar
            className="flex touch-none select-none bg-slate-700/75 p-0.5 transition-colors duration-[160ms] ease-out data-[orientation=vertical]:w-2.5"
            orientation="vertical"
          >
            <ScrollArea.Thumb className="relative flex-1 bg-slate-500 rounded-[10px]" />
          </ScrollArea.Scrollbar>
            </ScrollArea.Root>
          </>
        ) : (
          <button
            onClick={clearPlayerSelection}
            className="
              w-full mb-3 px-3 py-2 rounded bg-sky-700 hover:bg-sky-600
              transition-colors flex flex-row items-center gap-3
            "
          >
            {selectedPlayer && (
              <>
                <img 
                  src={avatarCache[selectedPlayer.snowflake || 'default'] || createAvatar(shapes, { size: 40, seed: selectedPlayer.snowflake || 'default' }).toDataUri()} 
                  alt={`${selectedPlayer.name} avatar`} 
                  className="rounded-lg w-10 h-10 object-cover flex-shrink-0" 
                />
                <div className="flex-1 text-left">
                  <div className="font-medium text-white">{selectedPlayer.name}</div>
                  {selectedPlayer.snowflake && (
                    <div className="text-xs text-slate-300">#{selectedPlayer.snowflake}</div>
                  )}
                </div>
              </>
            )}
          </button>
        )}
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
