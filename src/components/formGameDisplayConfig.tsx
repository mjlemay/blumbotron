import { useImmer } from 'use-immer';
import Input from './input';
import { z } from 'zod';
import { useGameStore } from '../stores/gamesStore';
import { useExperienceStore } from '../stores/experienceStore';
import { GameDataItem } from '../lib/types';
import { getSelected } from '../lib/selectedStates';
import { Pencil1Icon } from '@radix-ui/react-icons';
import '@rc-component/color-picker/assets/index.css';
import * as Menubar from '@radix-ui/react-menubar';
import { defaultGame } from '../lib/defaults';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { setNestedValue } from '../lib/helpers';

type FormGameDisplayConfigProps = {
  onSuccess?: () => void;
};
 
function FormGameDisplayConfig(props: FormGameDisplayConfigProps) {
  const { onSuccess } = props;
  const { editGame, loading, error } = useGameStore();
  const { setExpView, setExpModal, setExpSelected, experience } = useExperienceStore();
  const game = getSelected('games') as GameDataItem;
  const displayIndex = experience.subSelected as number || 0;

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


  const updateFormInput = (formKey: string, formValue: string) => {
    setForm(form => {
      setNestedValue(form, formKey, formValue);
    });
  };

  const handleFormChange = (Event: React.ChangeEvent<HTMLInputElement>) => {
    const eventTarget = Event?.target;
    const formKey = eventTarget?.name;
    const formValue = eventTarget?.value;
    updateFormInput(formKey, formValue);
  };

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
    
    let formSchema = z.object({
      name: z.string().min(3, 'Please supply a game name.'),
      description: z.string(),
      data: z.object({
        displays: z.array(z.object({
          title: z.string(),
          rows: z.union([z.string(), z.number()]).transform((val) => {
            if (typeof val === 'string') {
              const parsed = parseInt(val, 10);
              if (isNaN(parsed)) throw new Error('Must be a valid number');
              return parsed;
            }
            return val;
          }).refine((val) => val >= 1, 'Must be at least 1'),
        })),
      }),
    });
    try {
      formSchema.parse(formData);
      // Merge existing data with new changes
      const existingData = game?.data || {};
      const newDisplays = formData.data?.displays || [];
      const newMedia = formData.data?.media || {};
      const mergedData = {
        ...existingData,
        displays: newDisplays,
        media: newMedia
      };
      
      // Ensure we're sending the correct data structure
      // Use the original game's ID to ensure we're updating the right record
      const updateData: GameDataItem = {
        id: game?.id || formData.id,
        snowflake: game?.snowflake || formData.snowflake,
        name: formData.name,
        description: formData.description,
        data: mergedData,
        roster: formData.roster
      };
      
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
        {name} - Display {displayIndex + 1} Configuration
        {gameData?.displays?.[displayIndex]?.title && (
          <span className="text-slate-400 text-xl">({gameData.displays[displayIndex].title})</span>
        )}
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
                  <div className="flex flex-col items-start justify-between">
                    <h3 className="text-xl font-bold border-b border-slate-600 p-2 pr-1 pl-1 w-full">
                      Table Display Configuration
                    </h3>
                    <Input
                      name={`data.displays[${displayIndex}].title`}
                      label="Title"
                      value={form?.data?.displays?.[displayIndex]?.title || ''}
                      changeHandler={handleFormChange}
                    />
                    <Input
                      name={`data.displays[${displayIndex}].rows`}
                      label="Number of Rows"
                      value={form?.data?.displays?.[displayIndex]?.rows || ''}
                      changeHandler={handleFormChange}
                    />
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

export default FormGameDisplayConfig;
