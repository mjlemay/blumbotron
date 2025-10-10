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
import * as ScrollArea from '@radix-ui/react-scroll-area';

type FormGameStylesProps = {
  onSuccess?: () => void;
};

interface GameData extends Record<string, unknown> {
  colors?: {
    background?: string;
    text?: string;
    primary?: string;
    secondary?: string;
    tertiary?: string;
    tableHeader?: string;
    tableRow?: string;
    tableAlt?: string;
  };
  placement?: {
    paddingFrame?: {
      top?: string;
      left?: string;
      right?: string;
      bottom?: string;
    };
  };
}

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
  const { onSuccess } = props;
  const { editGame,  loading, error } = useGameStore();
  const { setExpView, setExpModal, setExpSelected } = useExperienceStore();
  const game = getSelected('games') as GameDataItem;
  const { name = '' } = game || {};

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
    console.log('formKey', formKey);
    console.log('formValue', formValue);
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

  const editGameData = async (formData: GameDataItem) => {
    
    let formSchema = z.object({
      name: z.string().min(3, 'Please supply a game name.'),
      description: z.string(),
      data: z.object({
        colors: z.object({
          background: z.string().optional(),
          text: z.string().optional(),
          primary: z.string().optional(),
          secondary: z.string().optional(),
          tertiary: z.string().optional(),
          tableHeader: z.string().optional(),
          tableRow: z.string().optional(),
          tableAlt: z.string().optional(),
        }).optional(),
        placement: z.object({
          paddingFrame: z.object({
            top: z.coerce.number().optional(),
            bottom: z.coerce.number().optional(),
            left: z.coerce.number().optional(),
            right: z.coerce.number().optional(),
          }).optional(),
        }).optional(),
      })
    });
    try {
      formSchema.parse(formData);
      
      // Merge existing data with new changes
      const existingData = game?.data || {};
      const newColors = formData.data?.colors || {};
      const newPlacement = formData.data?.placement || {};
      const mergedData = {
        ...existingData,
        colors: {
          ...existingData.colors,
          ...newColors
        },
        placement: {
          ...existingData.placement,
          ...newPlacement
        }
      };
      
      // Ensure we're sending the correct data structure
      const updateData: GameDataItem = {
        id: formData.id,
        snowflake: formData.snowflake,
        name: formData.name,
        description: formData.description,
        data: mergedData,
        roster: formData.roster
      };

      await editGame(updateData);
      
      // If we get here and there's no error in the store, edit was successful
      if (!error) {
        handleSubmitClose('game', 'none', updateData);
        return true;
      }
      throw new Error(error || 'Failed to edit game');
    } catch (err) {
      console.error('Error in editGameData:', {
        error: err,
        errorMessage: err instanceof Error ? err.message : 'Unknown error',
        errorStack: err instanceof Error ? err.stack : undefined,
        formData
      });
      
      if (err instanceof z.ZodError) {
        let newErrs: Record<string, string> = {};
        err.errors.map((errItem) => {
          const { path, message } = errItem;
          const key = path[0];
          newErrs[`${key}`] = message;
        });
        console.log('Validation errors:', newErrs);
        setErrors(newErrs);
      } else {
        // Handle other errors (like creation/editing failure)
        const errorMessage = err instanceof Error ? err.message : 'Failed to process game';
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
        {name} Layout & Styles
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
                      Basic Colors
                    </h3>
                    <Input
                      name="data.colors.background"
                      label="Background Color"
                      value={form?.data?.colors?.background || '#000000'}
                      changeHandler={handleFormChange}
                      preview={
                        <div 
                          className="rounded-lg w-11 h-11 ring-1 ring-slate-500/40" 
                          style={{ backgroundColor: form?.data?.colors?.background || '#000000' }}
                        />
                      }
                      actionButton={
                        <ButtonColorPicker
                          color={form?.data?.colors?.background || '#000000'}
                          setColor={(color: string) => handleColorChange('data.colors.background', color)}
                        />
                      }
                    />
                    <Input
                      name="data.colors.text"
                      label="Text Color"
                      value={form?.data?.colors?.text || '#ffffff'}
                      changeHandler={handleFormChange}
                      preview={
                        <div 
                          className="rounded-lg w-11 h-11 ring-1 ring-slate-500/40" 
                          style={{ backgroundColor: form?.data?.colors?.text || '#ffffff' }}
                        />
                      }
                      actionButton={
                        <ButtonColorPicker
                          color={form?.data?.colors?.text || '#ffffff'}
                          setColor={(color: string) => handleColorChange('data.colors.text', color)}
                        />
                      }
                    />
                    <Input
                      name="data.colors.primary"
                      label="Primary Color"
                      value={form?.data?.colors?.primary || ''}
                      changeHandler={handleFormChange}
                      preview={
                        <div 
                          className="rounded-lg w-11 h-11 ring-1 ring-slate-500/40" 
                          style={{ backgroundColor: form?.data?.colors?.primary || 'transparent' }}
                        />
                      }
                      actionButton={
                        <ButtonColorPicker
                          color={form?.data?.colors?.primary || ''}
                          setColor={(color: string) => handleColorChange('data.colors.primary', color)}
                        />
                      }
                    />
                    <Input
                      name="data.colors.secondary"
                      label="Secondary Color"
                      value={form?.data?.colors?.secondary || '#000000'}
                      changeHandler={handleFormChange}
                      preview={
                        <div 
                          className="rounded-lg w-11 h-11 ring-1 ring-slate-500/40" 
                          style={{ backgroundColor: form?.data?.colors?.secondary || '' }}
                        />
                      }
                      actionButton={
                        <ButtonColorPicker
                          color={form?.data?.colors?.secondary || 'transparent'}
                          setColor={(color: string) => handleColorChange('data.colors.secondary', color)}
                        />
                      }
                    />
                    <Input
                      name="data.colors.tertiary"
                      label="Tertiary Color"
                      value={form?.data?.colors?.tertiary || ''}
                      changeHandler={handleFormChange}
                      preview={
                        <div 
                          className="rounded-lg w-11 h-11 ring-1 ring-slate-500/40" 
                          style={{ backgroundColor: form?.data?.colors?.tertiary || 'transparent' }}
                        />
                      }
                      actionButton={
                        <ButtonColorPicker
                          color={form?.data?.colors?.tertiary || ''}
                          setColor={(color: string) => handleColorChange('data.colors.tertiary', color)}
                        />
                      }
                    />
                    <h3 className="text-xl font-bold border-b border-slate-600 p-2 pr-1 pl-1 w-full">
                      Table Colors
                    </h3>
                    <Input
                      name="data.colors.tableHeader"
                      label="Table Header Color"
                      value={form?.data?.colors?.tableHeader || ''}
                      changeHandler={handleFormChange}
                      preview={
                        <div 
                          className="rounded-lg w-11 h-11 ring-1 ring-slate-500/40" 
                          style={{ backgroundColor: form?.data?.colors?.tableHeader || '' }}
                        />
                      }
                      actionButton={
                        <ButtonColorPicker
                          color={form?.data?.colors?.tableHeader || 'transparent'}
                          setColor={(color: string) => handleColorChange('data.colors.tableHeader', color)}
                        />
                      }
                    />
                    <Input
                      name="data.colors.tableRow"
                      label="Row Color"
                      value={form?.data?.colors?.tableRow || ''}
                      changeHandler={handleFormChange}
                      preview={
                        <div 
                          className="rounded-lg w-11 h-11 ring-1 ring-slate-500/40" 
                          style={{ backgroundColor: form?.data?.colors?.tableRow || 'transparent' }}
                        />
                      }
                      actionButton={
                        <ButtonColorPicker
                          color={form?.data?.colors?.tableRow || ''}
                          setColor={(color: string) => handleColorChange('data.colors.tableRow', color)}
                        />
                      }
                    />
                    <Input
                      name="data.colors.tableAlt"
                      label="Alternate Row Color"
                      value={form?.data?.colors?.tableAlt || ''}
                      changeHandler={handleFormChange}
                      preview={
                        <div 
                          className="rounded-lg w-11 h-11 ring-1 ring-slate-500/40" 
                          style={{ backgroundColor: form?.data?.colors?.tableAlt || 'transparent' }}
                        />
                      }
                      actionButton={
                        <ButtonColorPicker
                          color={form?.data?.colors?.tableAlt || ''}
                          setColor={(color: string) => handleColorChange('data.colors.tableAlt', color)}
                        />
                      }
                    />
                    <h3 className="text-xl font-bold border-b border-slate-600 p-2 pr-1 pl-1 w-full">
                      Placement
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                      <Input
                        name="data.placement.paddingFrame.top"
                        label="Top Table Padding"
                        value={form?.data?.placement?.paddingFrame?.top || ''}
                        changeHandler={handleFormChange}
                        placeholder={'0'}
                      />
                      <Input
                        name="data.placement.paddingFrame.bottom"
                        label="Bottom Table Padding"
                        value={form?.data?.placement?.paddingFrame?.bottom || ''}
                        changeHandler={handleFormChange}
                        placeholder={'0'}
  
                      />
                      <Input
                        name="data.placement.paddingFrame.left"
                        label="Left Table Padding"
                        value={form?.data?.placement?.paddingFrame?.left || ''}
                        changeHandler={handleFormChange}
                        placeholder={'0'}
                      />
                      <Input
                        name="data.placement.paddingFrame.right"
                        label="Right Table Padding"
                        value={form?.data?.placement?.paddingFrame?.right || ''}
                        changeHandler={handleFormChange}  
                        placeholder={'0'}
                      />
                    </div>
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

export default FormGameStyles;
