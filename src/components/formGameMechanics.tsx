import { useImmer } from 'use-immer';
import Input from './input';
import SelectChip from './selectChip';
import { z } from 'zod';
import { useGameStore } from '../stores/gamesStore';
import { useExperienceStore } from '../stores/experienceStore';
import { useScoreStore } from '../stores/scoresStore';
import { GameDataItem, UnitItem } from '../lib/types';
import { getSelected } from '../lib/selectedStates';
import { generateSnowflake } from '../lib/snowflake';
import { Pencil1Icon, TrashIcon, LockClosedIcon } from '@radix-ui/react-icons';
import '@rc-component/color-picker/assets/index.css';
import * as Menubar from '@radix-ui/react-menubar';
import { defaultGame } from '../lib/defaults';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { useEffect } from 'react';

type FormGameMechanicsProps = {
  onSuccess?: () => void;
};
 
function FormGameMechanics(props: FormGameMechanicsProps) {
  const { onSuccess } = props;
  const { editGame,  loading, error } = useGameStore();
  const { setExpView, setExpModal, setExpSelected } = useExperienceStore();
  const { gameScores } = useScoreStore();
  const game = getSelected('games') as GameDataItem;

  // Function to calculate total scores for a specific unit type
  const calculateUnitTotal = (unitName: string) => {
    if (!game?.snowflake || !gameScores[game.snowflake]) {
      return 0;
    }
    
    const scores = gameScores[game.snowflake];
    return scores
      .filter(score => score.units === unitName)
      .reduce((total, score) => total + (score.amount || 0), 0);
  };

  // todo: refactor fullForm and gameData parsing logic
  let gameData: any = {};
  try {
    if (typeof game?.data === 'string') {
      gameData = JSON.parse(game.data);
    } else if (game?.data) {
      gameData = game.data;
    }
  } catch (error) {
    console.log('error in parsing game data:', error);
  }

  // Properly merge the form data, ensuring nested structure is preserved
  const fullForm = {
    ...defaultGame,
    ...game,
    data: {
      ...defaultGame.data,
      ...gameData
    }
  };
  const [form, setForm] = useImmer(fullForm || defaultGame);
  const [errors, setErrors] = useImmer({});
  const { name = '' } = game || {};

  // Ensure all units have IDs
  useEffect(() => {
    setForm(draft => {
      if (draft.data?.mechanics?.units) {
        draft.data.mechanics.units = draft.data.mechanics.units.map((unit: any) => ({
          ...unit,
          id: unit.id || Number(generateSnowflake())
        }));
      }
    });
  }, []);

  const handleSubmitClose = (
    view: string = 'home',
    modal: string = 'none',
    gameData?: GameDataItem
  ) => {
    const displayGameData: GameDataItem = gameData ? gameData : { name: '' };
    setExpView(view);
    setExpModal(modal);
    setExpSelected(gameData ? { game: displayGameData } : {});
    onSuccess?.();
  };

  const editGameData = async (formData: GameDataItem) => {
    console.log('editGameData called with:', {
      formData,
      unitsArray: formData.data?.mechanics?.units,
      gameId: game?.id,
      gameName: game?.name
    });
    
    let formSchema = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      data: z.object({
        mechanics: z.object({
          units: z.array(z.object({
            id: z.union([z.number(), z.bigint()]).optional(),
            name: z.string(),
            type: z.string(),
            data: z.record(z.unknown()).optional(),
          })).optional(),
        }).optional(),
      }).optional(),
    });
    try {
      formSchema.parse(formData);
      // Merge existing data with new changes
      const existingData = game?.data || {};
      const newMechanics = formData.data?.mechanics || {};
      const mergedData = {
        ...existingData,
        mechanics: newMechanics
      };
      
      console.log('Merged data:', {
        existingData,
        newMechanics,
        mergedData
      });
      
      // Ensure we're sending the correct data structure
      // Use the original game's ID to ensure we're updating the right record
      const updateData: GameDataItem = {
        id: game?.id || formData.id,
        snowflake: game?.snowflake || formData.snowflake,
        name: game?.name || formData.name,
        description: game?.description || formData.description,
        data: mergedData,
        roster: game?.roster || formData.roster
      };
      
      console.log('About to call editGame with:', updateData);
      
      await editGame(updateData);
      
      // If we get here and there's no error in the store, edit was successful
      if (!error) {
        console.log('Update successful, closing form...');
        handleSubmitClose('game', 'none', updateData);
        return true;
      } else {
        console.log('Store has error:', error);
        throw new Error(error || 'Failed to edit game');
      }
    } catch (error) {
      console.error('Error in editGameData:', {
        error,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : undefined,
        formData
      });

      if (error instanceof z.ZodError) {
        let newErrs: Record<string, string> = {};
        error .errors.map((errItem) => {
          const { path, message } = errItem;
          const key = path[0];
          newErrs[`${key}`] = message;
        });
        console.log('Validation errors:', newErrs);
        setErrors(newErrs);
      } else {
        // Handle other errors (like creation/editing failure)
        const errorMessage = error instanceof Error ? error.message : 'Failed to process game';
        console.log('Setting error:', errorMessage);
        setErrors({ name: errorMessage });
      }
      console.log('errors', errors);
      return false;
    }
  };


  return (
    <>
    <h2 className="text-3xl font-thin pb-2 flex flex-row items-center gap-2">
        {name} Mechanics
    </h2>
    <div className="flex flex-col items-center bg-slate-900 rounded-lg shadow-lg">
      <ScrollArea.Root className="w-full flex-1 min-h-0 rounded bg-slate-700/50 overflow-y-auto overflow-x-hidden">
        <ScrollArea.Viewport className="h-full w-full">
          <div className="px-5 py-[15px] min-h-[calc(100vh-250px)] max-h-[calc(100vh-250px)]">
            <div className="flex flex-row items-center justify-start">
              <div className="flex flex-col items-center justify-start text-lg font-medium rounded-lg max-w-lg">
                <div className="w-full pr-4 pl-4">
                  <Input name="id" value={form.id || -1} hidden changeHandler={() => {}} />
                  <Input
                    name="snowflake"
                    value={form.snowflake || 'BAD_ID'}
                    hidden
                    changeHandler={() => {}}
                  />
                  <Input
                    name="name"
                    value={form.name || ''}
                    hidden
                    changeHandler={() => {}}
                  />
                  <Input
                    name="description"
                    value={form.description || ''}
                    hidden
                    changeHandler={() => {}}
                  />
                  <Input
                    name="roster"
                    value={form.roster || ''}
                    hidden
                    changeHandler={() => {}}
                  />
                  <h3 className="text-xl font-bold border-b border-slate-600 p-2 pr-1 pl-1 w-full">
                    Units and Values
                  </h3>
                  
                  {/* Units Array Editor */}
                  <div className="w-full mt-4">
                    <div className="flex flex-row items-center justify-between mb-3">
                      <h4 className="text-lg font-medium text-slate-300">Game Units</h4>
                      <button
                        type="button"
                        onClick={() => {
                          setForm(draft => {
                            if (!draft.data) draft.data = {};
                            if (!draft.data.mechanics) draft.data.mechanics = {};
                            if (!draft.data.mechanics.units) draft.data.mechanics.units = [];
                            draft.data.mechanics.units.push({ 
                              name: '', 
                              type: 'score',
                              id: Number(generateSnowflake())
                            });
                          });
                        }}
                        className="flex select-none items-center justify-between cursor-pointer rounded px-3 py-2 text-lg gap-1.5 font-medium bg-sky-700 text-white hover:bg-sky-600"
                      >
                        <span>+</span> Add Unit
                      </button>
                    </div>
                    
                    {form.data?.mechanics?.units?.map((unit: UnitItem, index: number) => (
                      <div key={unit.id || `unit-${index}`} data-id={unit.id || `unit-${index}`} className="flex flex-row items-center gap-2 mb-2 p-3 bg-slate-600 rounded-md">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                          <input
                            type="text"
                            value={unit.name || ''}
                            onChange={(e) => {
                              setForm(draft => {
                                if (draft.data?.mechanics?.units?.[index]) {
                                  draft.data.mechanics.units[index].name = e.target.value.toLowerCase();
                                }
                              });
                            }}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Unit name (e.g., points, coins, lives)"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-slate-300 mb-1">
                            Type
                            {calculateUnitTotal(unit.name || '') > 0 && (
                              <LockClosedIcon className="ml-2 w-3 h-3 text-slate-400 inline" />
                            )}
                          </label>
                          <div className="flex items-center gap-2 p-1">
                            <SelectChip
                              key={`unit-type-${unit.id || index}-${unit.type || 'score'}`}
                              defaultValue={unit.type || 'score'}
                              handleSelect={(value) => {
                                // Only allow changes if there are no scores for this unit
                                const totalScores = calculateUnitTotal(unit.name || '');
                                if (totalScores === 0) {
                                  setForm(draft => {
                                    if (draft.data?.mechanics?.units?.[index]) {
                                      draft.data.mechanics.units[index].type = value;
                                    }
                                  });
                                }
                              }}
                              selections={[
                                { label: 'Score', value: 'score' },
                                { label: 'Flag', value: 'flag' },
                                { label: 'Time', value: 'time' }
                              ]}
                              selectPlaceholder="Select Type"
                              moreClasses={`flex-1 !h-[42px] !py-2 !px-3 ${calculateUnitTotal(unit.name || '') > 0 ? 'opacity-50 pointer-events-none' : ''}`}
                            />
                            <div className="flex flex-col items-end min-w-[50px]">
                              <span className="text-xs text-slate-400">Total</span>
                              <span className="text-sm font-bold text-slate-200">
                                {calculateUnitTotal(unit.name || '')}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => {
                            setForm(draft => {
                              if (draft.data?.mechanics?.units) {
                                draft.data.mechanics.units.splice(index, 1);
                              }
                            });
                          }}
                          disabled={form.data?.mechanics?.units?.length === 1}
                          className={`mt-6 flex select-none items-center justify-center cursor-pointer rounded px-3 py-2 text-lg font-medium ${
                            form.data?.mechanics?.units?.length === 1
                              ? 'bg-gray-500 cursor-not-allowed'
                              : 'bg-sky-700 hover:bg-sky-600 text-white'
                          }`}
                          title={form.data?.mechanics?.units?.length === 1 ? "Cannot remove the last unit" : "Remove unit"}
                        >
                          <TrashIcon width="20" height="20" />
                        </button>
                      </div>
                    ))}
                    
                    {(!form.data?.mechanics?.units || form.data.mechanics.units.length === 0) && (
                      <div className="text-slate-400 text-center py-6 border-2 border-dashed border-slate-600 rounded-md">
                        No units defined. Click "Add Unit" to create your first game unit.
                      </div>
                    )}
                  </div>



                </div>
              </div>
            </div>
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar
          className="flex touch-none select-none bg-gray-700/75 p-0.5 transition-colors duration-[160ms] ease-out data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col"
          orientation="vertical"
        >
          <ScrollArea.Thumb className="relative flex-1 bg-gray-500 rounded-[10px] before:absolute before:left-1/2 before:top-1/2 before:size-full before:min-h-11 before:min-w-11 before:-translate-x-1/2 before:-translate-y-1/2" />
        </ScrollArea.Scrollbar>
        <ScrollArea.Scrollbar
          className="flex touch-none select-none bg-blackA3 p-0.5 transition-colors duration-[160ms] ease-out hover:bg-blackA5 data-[orientation=horizontal]:h-2.5 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col"
          orientation="horizontal"
        >
          <ScrollArea.Thumb className="relative flex-1 rounded-[10px] bg-mauve10 before:absolute before:left-1/2 before:top-1/2 before:size-full before:min-h-[44px] before:min-w-[44px] before:-translate-x-1/2 before:-translate-y-1/2" />
        </ScrollArea.Scrollbar>
        <ScrollArea.Corner />
      </ScrollArea.Root>
      <Menubar.Root className="flex rounded-md p-2">
        <Menubar.Menu>
          {loading && <div>Loading...</div>}
          {error && <div>Error: {error}</div>}
          {!loading && !error && (
            <Menubar.Trigger
              className="flex select-none items-center justify-between cursor-pointer rounded px-3 py-2 text-lg gap-1.5 font-medium bg-sky-700"
              onClick={() => {
                editGameData(form);
              }}
            >
              <Pencil1Icon width="20" height="20" /> <span>Edit</span>
            </Menubar.Trigger>
          )}
        </Menubar.Menu>
      </Menubar.Root>
    </div>
    </>
  );
}

export default FormGameMechanics;
