import { useImmer } from 'use-immer';
import Input from './input';
import { z } from 'zod';
import { useGameStore } from '../stores/gamesStore';
import { useExperienceStore } from '../stores/experienceStore';
import { GameDataItem } from '../lib/types';
import { getSelected } from '../lib/selectedStates';
import { Pencil1Icon, UploadIcon, TrashIcon } from '@radix-ui/react-icons';
import '@rc-component/color-picker/assets/index.css';
import * as Menubar from '@radix-ui/react-menubar';
import { defaultGame } from '../lib/defaults';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import SelectChip from './selectChip';
import Chip from './chip';
import { setNestedValue } from '../lib/helpers';
import { useRef, useState, useEffect } from 'react';
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';


type FormGameDisplayConfigProps = {
  onSuccess?: () => void;
};

const mdParser = new MarkdownIt(/* Markdown-it options */);
 
function FormGameDisplayConfig(props: FormGameDisplayConfigProps) {
  const { onSuccess } = props;
  const { editGame, loading, error } = useGameStore();
  const { setExpView, setExpModal, setExpSelected, experience } = useExperienceStore();
  const game = getSelected('games') as GameDataItem;
  const displayIndex = experience.subSelected as number || 0;
  const titleImageInputRef = useRef<HTMLInputElement>(null);
  const [titleImageSrc, settitleImageSrc] = useState<string>('');

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


  const updateFormInput = (formKey: string, formValue: string | boolean | number) => {
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

  const handleSelect = (formKey: string) => (value: string) => {
    updateFormInput(formKey, value);
  }

  // Image handling functions (similar to formGameMedia)
  useEffect(() => {
    const updateImageSrc = async () => {
      const titleImage = form?.data?.displays?.[displayIndex]?.titleImage;
      if (titleImage) {
        try {
          const src = await getImageSrc(titleImage);
          settitleImageSrc(src || '');
        } catch (error) {
          console.error('FormGameDisplayConfig: Error loading header image:', error);
          settitleImageSrc('');
        }
      } else {
        settitleImageSrc('');
      }
    };
    updateImageSrc();
  }, [form?.data?.displays?.[displayIndex]?.titleImage]);

  const getImageSrc = async (imagePath: string): Promise<string> => {
    if (!imagePath) return '';
    if (imagePath.startsWith('data:')) return imagePath;
    
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const dataUrl = await invoke('get_background_image_data', { fileName: imagePath }) as string;
      return dataUrl;
    } catch (error) {
      console.error('getImageSrc: Failed to get image data for', imagePath, ':', error);
      return imagePath;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, GIF, etc.)');
      return;
    }
    
    try {
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop() || 'png';
      const fileName = `header_${game?.snowflake || 'unknown'}_${timestamp}.${fileExtension}`;
    
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const base64 = btoa(String.fromCharCode.apply(null, Array.from(bytes)));
      
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('save_background_image', {
        fileName: fileName,
        imageData: base64
      });
      
      updateFormInput(`data.displays[${displayIndex}].titleImage`, fileName);
      
    } catch (error) {
      console.error('FormGameDisplayConfig: Failed to save header image:', error);
      try {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64String = event.target?.result as string;
          updateFormInput(`data.displays[${displayIndex}].titleImage`, base64String);
        };
        reader.readAsDataURL(file);
      } catch (fallbackError) {
        alert('Failed to upload image. Please try again.');
      }
    }
  };

  const handleImageRemove = async () => {
    const currentImage = form?.data?.displays?.[displayIndex]?.titleImage;
    if (currentImage && !currentImage.startsWith('data:')) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('delete_background_image', { fileName: currentImage });
      } catch (error) {
        console.warn('Failed to delete header image file:', error);
      }
    }
    updateFormInput(`data.displays[${displayIndex}].titleImage`, '');
    if (titleImageInputRef.current) {
      titleImageInputRef.current.value = '';
    }
  };

  const triggerFileUpload = () => {
    titleImageInputRef.current?.click();
  };

  const getUnitBySnowflake = (snowflake: string, units: any[]) => {
    return units?.find((unit) => String(unit.id) === String(snowflake));
  };

  const handleAddUnit = async (unitSnowflake: string) => {
    const currentFilteredUnits = form?.data?.displays?.[displayIndex]?.filteredUnits || [];
    if (!currentFilteredUnits.includes(unitSnowflake)) {
      setForm(draft => {
        if (!draft.data) draft.data = {};
        if (!draft.data.displays) draft.data.displays = [];
        if (!draft.data.displays[displayIndex]) draft.data.displays[displayIndex] = {};
        if (!draft.data.displays[displayIndex].filteredUnits) {
          draft.data.displays[displayIndex].filteredUnits = [];
        }
        draft.data.displays[displayIndex].filteredUnits!.push(unitSnowflake);
      });
    }
  };

  const handleRemoveUnit = async (unitSnowflake: string) => {
    setForm(draft => {
      if (draft.data?.displays?.[displayIndex]?.filteredUnits) {
        draft.data.displays[displayIndex].filteredUnits = 
          draft.data.displays[displayIndex].filteredUnits!.filter(
            (snowflake: string) => snowflake !== unitSnowflake
          );
      }
    });
  };

  const unUsedUnits = form?.data?.mechanics?.units?.filter((unit: any) => {
    const currentFilteredUnits = form?.data?.displays?.[displayIndex]?.filteredUnits || [];
    return !currentFilteredUnits.includes(String(unit.id));
  }) || [];


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
          offset: z.union([z.string(), z.number()]).transform((val) => {
            if (typeof val === 'string') {
              const parsed = parseInt(val, 10);
              if (isNaN(parsed)) throw new Error('Must be a valid number');
              return parsed;
            }
            return val;
          }).refine((val) => val >= 0, 'Must be at least 0').optional(),
          direction: z.enum(['ascending', 'descending']).optional(),
          sortUnit: z.union([z.string(), z.number()]).transform((val) => {
            if (typeof val === 'string') {
              const parsed = parseInt(val, 10);
              if (isNaN(parsed)) return undefined;
              return parsed;
            }
            return val;
          }).optional(),
          titleImage: z.string().nullable().optional(),
          showAvatars: z.boolean().optional(),
          showSubHeaders: z.boolean().optional(),
          category: z.enum(['table', 'slide']).optional(),
          filteredUnits: z.array(z.string()).optional(),
        })),
      }),
    });
    try {
      const validatedData = formSchema.parse(formData);
      // Merge existing data with new changes
      const existingData = game?.data || {};
      const existingDisplays = existingData.displays || [];
      const newDisplays = validatedData.data?.displays?.map((newDisplay, index) => ({
        ...existingDisplays[index], // Preserve existing fields like category, filteredUnits
        ...newDisplay // Override with new validated values
      })) || [];
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
        handleSubmitClose('game', 'none', updateData);
        return true;
      } else {
        console.error('Store has error:', error);
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
        console.error('Validation errors:', newErrs);
        setErrors(newErrs);
      } else {
        // Handle other errors (like creation/editing failure)
        const errorMessage = error instanceof Error ? error.message : 'Failed to process game';
        console.error('Setting error:', errorMessage);
        setErrors({ name: errorMessage });
      }
      console.log('errors', errors);
      return false;
    }
  };


  return (
    <>
    <h2 className="text-3xl font-thin pb-2 flex flex-row items-center gap-2">
        {name} » Display {displayIndex + 1} 
        {gameData?.displays?.[displayIndex]?.title && (
          <span className="text-slate-400 text-xl">({gameData.displays[displayIndex].title})</span>
        )}
    </h2>
    <div className="flex flex-col items-center bg-slate-900 rounded-lg shadow-lg">
      <ScrollArea.Root className="w-full flex-1 min-h-0 rounded bg-slate-700/50 overflow-y-auto overflow-x-hidden">
        <ScrollArea.Viewport className="h-full w-full">
          <div className="px-5 py-[15px] min-h-[calc(100vh-250px)] max-h-[calc(100vh-250px)]">
            <div className="flex flex-row items-center justify-start">
              <div className="flex flex-col items-center justify-start text-lg font-medium rounded-lg min-w-full">
                <div className="min-w-full pr-4 pl-4">
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
                  <div className="flex flex-col items-start justify-between min-w-full">
                    <h3 className="text-xl font-bold border-b border-slate-600 p-2 pr-1 pl-1 w-full">
                      {form?.data?.displays?.[displayIndex]?.category?.charAt(0).toUpperCase() + form?.data?.displays?.[displayIndex]?.category?.slice(1)} Display Configuration
                    </h3>
                    <Input
                      name={`data.displays[${displayIndex}].title`}
                      label="Title"
                      value={form?.data?.displays?.[displayIndex]?.title || ''}
                      changeHandler={handleFormChange}
                    />
                    { form?.data?.displays?.[displayIndex]?.category === 'slide' && <>
                      <div className="w-full mb-4">
                        <label className="block text-lg font-bold text-white mb-1">Slide Content</label>
                           <MdEditor 
                            style={{ height: '300px', width: '100%' }} 
                            renderHTML={text => mdParser.render(text)} 
                            onChange={()=>{}} 
                            canView={{ menu: true, md: true, html: false, both: false, fullScreen: false, hideMenu: true }}
                            />
                      </div>
                    </>}
                    { form?.data?.displays?.[displayIndex]?.category === 'table' && <>
                    <Input
                      name={`data.displays[${displayIndex}].rows`}
                      label="Number of Rows"
                      value={form?.data?.displays?.[displayIndex]?.rows || ''}
                      changeHandler={handleFormChange}
                    />
                    <Input
                      name={`data.displays[${displayIndex}].offset`}
                      label="Skipped Top Rows"
                      value={form?.data?.displays?.[displayIndex]?.offset || ''}
                      changeHandler={handleFormChange}
                    />
                     <div className="gap-2 p-1 mb-4">
                        <label className="block text-lg font-bold text-white mb-1">
                          Units to Show
                        </label>
                      <div className="block flex flex-row gap-2 mb-2">
                      {form?.data?.displays?.[displayIndex]?.filteredUnits &&
                        form?.data?.displays?.[displayIndex]?.filteredUnits.map((unitSnowflake: string) => (
                          <Chip
                            key={`unit-${unitSnowflake}_allow`}
                            text={getUnitBySnowflake(unitSnowflake, form?.data?.mechanics?.units)?.name || unitSnowflake}
                            actionIcon="remove"
                            handleClick={() => handleRemoveUnit(unitSnowflake)}
                          />
                        ))}
                      <SelectChip
                        selectPlaceholder="Add Unit"
                        selections={
                          unUsedUnits?.map((item: any) => ({
                                label: item.name,
                                value: String(item.id),
                                data: { snowflake: String(item.id) },
                              })) || []
                        }
                        handleSelect={(value) => handleAddUnit(value)}
                        resetOnSelect={true}
                        noAvatar
                      />
                      </div>
                    </div>
                    <div>
                        <label className="block text-lg font-bold text-white mb-1">
                          Filter Direction
                        </label>
                        <div className='flex flex-row'>
                        <SelectChip
                          selectLabel="Direction"
                          selectPlaceholder="Choose Direction"
                          selections={[
                            { value: 'descending', label: 'Highest' },
                            { value: 'ascending', label: 'Lowest' },
                          ]}
                          defaultValue={form?.data?.displays?.[displayIndex]?.direction || 'descending'}
                          handleSelect={handleSelect(`data.displays[${displayIndex}].direction`)}
                          moreClasses="w-full justify-start"
                        />
                        <SelectChip
                          selectLabel="Unit"
                          selectPlaceholder="Choose Unit"
                          selections={
                            form?.data?.mechanics?.units?.map((unit: any) => ({
                              value: String(unit.id),
                              label: unit.name,
                            })) || []
                          }
                          defaultValue={
                            form?.data?.displays?.[displayIndex]?.sortUnit || 
                            (form?.data?.mechanics?.units?.[0] ? String(form.data.mechanics.units[0].id) : '')
                          }
                          handleSelect={handleSelect(`data.displays[${displayIndex}].sortUnit`)}
                          moreClasses="w-full justify-start"
                        />
                        </div>
                      </div>
                      <div>
                        <label className="block text-lg font-bold text-white mt-2 mb-1">
                          Show Avatars
                        </label>
                        <SelectChip
                          selectLabel="Show Avatars"
                          selectPlaceholder="Choose Option"
                          selections={[
                            { value: 'true', label: 'Yes' },
                            { value: 'false', label: 'No' },
                          ]}
                          defaultValue={form?.data?.displays?.[displayIndex]?.showAvatars ? 'true' : 'false'}
                          handleSelect={(value) => {
                            updateFormInput(`data.displays[${displayIndex}].showAvatars`, value === 'true');
                          }}
                          moreClasses="w-full justify-start"
                        />
                      </div>
                      <div>
                        <label className="block text-lg font-bold text-white mt-2 mb-1">
                          Show Unit Column Headers
                        </label>
                        <SelectChip
                          selectLabel="Show Unit Column Headers"
                          selectPlaceholder="Choose Option"
                          selections={[
                            { value: 'true', label: 'Yes' },
                            { value: 'false', label: 'No' },
                          ]}
                          defaultValue={form?.data?.displays?.[displayIndex]?.showSubHeaders ? 'true' : 'false'}
                          handleSelect={(value) => {
                            updateFormInput(`data.displays[${displayIndex}].showSubHeaders`, value === 'true');
                          }}
                          moreClasses="w-full justify-start"
                        />
                      </div>
                      <div className="w-full mb-4 mt-4">
                        <label className="block font-bold text-lg mb-2 text-white">
                          Header Image
                        </label>
                        <input
                          ref={titleImageInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          name={`data.displays[${displayIndex}].titleImage`}
                        />
                        
                        {/* Current image preview or upload area */}
                        <div className="border-2 border-dashed border-gray-400 rounded-lg p-4 bg-gray-800 max-w-xs">
                          {form?.data?.displays?.[displayIndex]?.titleImage ? (
                            <div className="space-y-3">
                              {/* Image thumbnail */}
                              <div className="relative inline-block">
                                <img
                                  src={titleImageSrc}
                                  alt="Header preview"
                                  className="max-w-xs max-h-32 rounded border object-cover"
                                />
                                {/* Remove button overlay */}
                                <button
                                  type="button"
                                  onClick={handleImageRemove}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                  title="Remove image"
                                >
                                  <TrashIcon width="16" height="16" />
                                </button>
                              </div>
                              
                              {/* Replace button */}
                              <button
                                type="button"
                                onClick={triggerFileUpload}
                                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                              >
                                <UploadIcon width="16" height="16" />
                                Replace Image
                              </button>
                            </div>
                          ) : (
                            /* Upload area when no image */
                            <div className="text-center">
                              <div className="mb-3">
                                <UploadIcon width="48" height="48" className="mx-auto text-gray-400" />
                              </div>
                              <p className="text-gray-300 mb-3">
                                Click to upload a header image
                              </p>
                              <button
                                type="button"
                                onClick={triggerFileUpload}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors mx-auto"
                              >
                                <UploadIcon width="16" height="16" />
                                Choose Image
                              </button>
                              <p className="text-xs text-gray-400 mt-2">
                                Supports JPG, PNG, GIF files
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>}
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
