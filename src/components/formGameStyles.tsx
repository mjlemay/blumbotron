import { useImmer } from 'use-immer';
import Input from './input';
import { z } from 'zod';
import { useGameStore } from '../stores/gamesStore';
import { useExperienceStore } from '../stores/experienceStore';
import { GameDataItem } from '../lib/types';
import { getSelected } from '../lib/selectedStates';
import { Pencil1Icon } from '@radix-ui/react-icons';
import '@rc-component/color-picker/assets/index.css';
import ButtonColorPicker from './buttonColorPicker';
import * as Menubar from '@radix-ui/react-menubar';
import { defaultGame } from '../lib/defaults';

type FormGameStylesProps = {
  onSuccess?: () => void;
};



const setNestedValue = (obj: any, keyString: string, value: any) => {
  const keys = keyString.split('.');
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key] || typeof current[key] !== 'object') {
          current[key] = {};
      }
      current = current[key];
  }
  current[keys[keys.length - 1]] = value;
  return obj;
}


function FormGameStyles(props: FormGameStylesProps) {
  const {  onSuccess } = props;
  const { editGame,  loading, error } = useGameStore();
  const { setExpView, setExpModal, setExpSelected } = useExperienceStore();
  const game = getSelected('games') as GameDataItem;
  
  interface GameData extends Record<string, unknown> {
    colors?: {
      background?: string;
    };
  }
  
  let gameData: GameData = {};
  try {
    if (typeof game?.data === 'string') {
      gameData = JSON.parse(game.data);
    } else if (game?.data) {
      gameData = game.data as GameData;
    }
  } catch (error) {
    gameData = {};
  }
  
  const fullForm = { ...game, data: gameData };
  const [form, setForm] = useImmer(fullForm || defaultGame);
  const [errors, setErrors] = useImmer({});

  const updateFormInput = (formKey: string, formValue: string) => {
    setForm(form => {
      setNestedValue(form, formKey, formValue);
    });
    console.log('form', form);
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

  const handleColorChange = (formKey: string, color: string) => {
    updateFormInput(formKey as string, color as string);
  };

  const getError = (field: string) => {
    return errors[field as keyof typeof errors] || '';
  };

  const editGameData = async (formData: GameDataItem) => {
    let formSchema = z.object({
      name: z.string().min(3, 'Please supply a game name.'),
      description: z.string(),
      data: z.object({
        colors: z.object({
          background: z.string(),
        }),
      }),
    });
    try {
      formSchema.parse(formData);
      await editGame(formData);
      // If we get here and there's no error in the store, edit was successful
      if (!error) {
        handleSubmitClose('game', 'none', formData);
        return true;
      }
      throw new Error(error || 'Failed to edit game');
    } catch (err) {
      if (err instanceof z.ZodError) {
        let newErrs: Record<string, string> = {};
        err.errors.map((errItem) => {
          const { path, message } = errItem;
          const key = path[0];
          newErrs[`${key}`] = message;
        });
        setErrors(newErrs);
      } else {
        // Handle other errors (like creation/editing failure)
        setErrors({ name: err instanceof Error ? err.message : 'Failed to process game' });
      }
      return false;
    }
  };


  return (
    <div
      className="
        flex
        flex-col
        items-center
        justify-start
        text-lg
        font-medium
        bg-slate-700
        rounded-lg
        p-2
        shadow-sm
        max-w-lg
      "
    >
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
        <div className="flex flex-row items-start justify-between">
        <Input
          name="data.colors.background"
          label="Background Color"
          value={form?.data?.colors?.background || '#000000'}
          changeHandler={handleFormChange}
          preview={
            <div className="rounded-lg w-11 h-11 ring-1 ring-slate-500/40" style={{ backgroundColor: form?.data?.colors?.background || '#000000' }}/>
          }
          actionButton={
            <ButtonColorPicker
              color={form?.data?.colors?.background || ''}
              setColor={(color: string) => handleColorChange('data.colors.background', color)}
            />
          }
        />
        </div>
      </div>
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
  );
}

export default FormGameStyles;
