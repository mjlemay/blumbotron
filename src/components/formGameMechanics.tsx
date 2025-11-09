import { useImmer } from 'use-immer';
import Input from './input';
import SelectChip from './selectChip';
import { z } from 'zod';
import { useGameStore } from '../stores/gamesStore';
import { useExperienceStore } from '../stores/experienceStore';
import { GameDataItem, UnitItem } from '../lib/types';
import { getSelected } from '../lib/selectedStates';
import { Pencil1Icon, UploadIcon, TrashIcon } from '@radix-ui/react-icons';
import '@rc-component/color-picker/assets/index.css';
import * as Menubar from '@radix-ui/react-menubar';
import { defaultGame } from '../lib/defaults';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { useRef, useState, useEffect } from 'react';
import { setNestedValue } from '../lib/helpers';

type FormGameMechanicsProps = {
  onSuccess?: () => void;
};
 
function FormGameMechanics(props: FormGameMechanicsProps) {
  const { onSuccess } = props;
  const { editGame,  loading, error } = useGameStore();
  const { setExpView, setExpModal, setExpSelected } = useExperienceStore();
  const game = getSelected('games') as GameDataItem;
  const backgroundImageInputRef = useRef<HTMLInputElement>(null);
  const logoImageInputRef = useRef<HTMLInputElement>(null);
  const [backgroundSrc, setBackgroundSrc] = useState<string>('');
  const [logoSrc, setLogoSrc] = useState<string>('');

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

  // Update image source when form data changes
  useEffect(() => {
    const updateImageSrc = async () => {
      const { 
        backgroundImage,
        logoImage,
      } = form?.data?.media || defaultGame?.data?.media || {};
      if (backgroundImage) {
        try {
          const src = await getImageSrc(backgroundImage);
          setBackgroundSrc(src || '');
        } catch (error) {
          console.error('FormGameMechanics: Error loading image:', error);
          setBackgroundSrc('');
        }
      } else {
        console.log('No backgroundImage found, clearing src');
        setBackgroundSrc('');
      }
      if (logoImage) {
        try {
          const src = await getImageSrc(logoImage);
          setLogoSrc(src || '');
        } catch (error) {
          console.error('FormGameMechanics: Error loading image:', error);
          setLogoSrc('');
        }
      } else {
        console.log('No logoImage found, clearing src');
        setLogoSrc('');
      }
    };
    
    updateImageSrc();
  }, [form?.data?.media]);

  const updateFormInput = (formKey: string, formValue: string) => {
    setForm(form => {
      // Convert string values to numbers for numeric fields
      let processedValue: string | number = formValue;
      if (formKey.includes('Opacity') 
        || formKey.includes('Scale')
        || formKey.includes('Offset')
      ) {
        processedValue = parseInt(formValue, 10);
      }
      setNestedValue(form, formKey, processedValue);
    });
  };

  const selectedRef = (name: string) => {
    switch (name) {
      case 'backgroundImage':
        return backgroundImageInputRef;
      case 'logoImage':
      default:
        return logoImageInputRef;
    }
  };

  const handleFormChange = (Event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLSelectElement>) => {
    const eventTarget = Event?.target;
    const formKey = eventTarget?.name;
    const formValue = eventTarget?.value;
    updateFormInput(formKey, formValue);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const name = event.target.name;
    if (!file) {
      console.warn('FormGameMechanics: No file selected');
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      console.error('FormGameMechanics: Invalid file type:', file.type);
      alert('Please select an image file (PNG, JPG, GIF, etc.)');
      return;
    }
    
    try {
      // Generate unique filename with timestamp
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop() || 'png';
      const fileName = `bg_${game?.snowflake || 'unknown'}_${timestamp}.${fileExtension}`;
    
      // Convert file to base64 for transfer to Rust
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const base64 = btoa(String.fromCharCode.apply(null, Array.from(bytes)));
      
      // Use Tauri invoke to save file on the Rust side
      const { invoke } = await import('@tauri-apps/api/core');
      
      await invoke('save_background_image', {
        fileName: fileName,
        imageData: base64
      });
      
      // Store the filename instead of base64 data
      updateFormInput(name, fileName);
      
    } catch (error) {
      console.error('FormGameMechanics: Failed to save image:', error);
      // Fallback to base64 if file system operations fail
      console.log('FormGameMechanics: Attempting fallback to base64...');
      try {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64String = event.target?.result as string;
          console.log('FormGameMechanics: Fallback - storing base64 data, length:', base64String.length);
          updateFormInput(name, base64String);
        };
        reader.onerror = (error) => {
          console.error('FormGameMechanics: FileReader error:', error);
        };
        reader.readAsDataURL(file);
      } catch (fallbackError) {
        console.error('FormGameMechanics: Fallback also failed:', fallbackError);
        alert('Failed to upload image. Please try again.');
      }
    }
  };

  const handleImageRemove = async (event: React.MouseEvent<HTMLButtonElement>) => {
    const name = event.currentTarget.dataset.name || '';
    const currentImage = form?.data?.media?.[name as keyof typeof form.data.media];
    if (!currentImage) {
      console.warn(`FormGameMechanics: No currentImage for ${name} found`);
      return;
    }
    
    // If it's a filename (not base64), try to delete the file
    if (currentImage && !currentImage.startsWith('data:')) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('delete_background_image', { fileName: currentImage });
      } catch (error) {
        console.warn('Failed to delete background image file:', error);
      }
    }

    const uploadRef = selectedRef(name);
    updateFormInput(`data.media.${name}`, '');
    if (uploadRef.current) {
      uploadRef.current.value = '';
    }
  };

  const triggerFileUpload = (inputName: string) => {
    const ref = selectedRef(inputName);
    ref.current?.click();
  };

  const getImageSrc = async (imagePath: string): Promise<string> => {
    if (!imagePath) {
      return '';
    }
    
    if (imagePath.startsWith('data:')) {
      return imagePath;
    }
    // If it's a filename, get the base64 data from Tauri
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const dataUrl = await invoke('get_background_image_data', { fileName: imagePath }) as string;
      return dataUrl;
    } catch (error) {
      console.error('getImageSrc: Failed to get image data for', imagePath, ':', error);
      // If the file is missing, return an empty string instead of the filename
      if (error && typeof error === 'string' && error.includes('Image file not found')) {
        console.warn('Image file missing, returning empty string:', imagePath);
        return '';
      }
      console.warn('getImageSrc: fallback - returning original path:', imagePath);
      return imagePath; // Fallback to original path for other errors
    }
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
      data: z.object({
        media: z.object({
          backgroundImage: z.string().nullable().optional(),
          backgroundImageOpacity: z.number().min(0).max(100).optional(),
          logoImage: z.string().nullable().optional(),
          logoImageOpacity: z.number().min(0).max(100).optional(),
          logoImagePosition: z.string().optional(),
          logoImageHorizontalOffset: z.number().optional(),
          logoImageVerticalOffset: z.number().optional(),
          logoImageScale: z.number().min(0).max(50).optional(),
        }).optional(),
      }),
    });
    try {
      formSchema.parse(formData);
      // Merge existing data with new changes
      const existingData = game?.data || {};
      const newMedia = formData.data?.media || {};
      const mergedData = {
        ...existingData,
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
                            draft.data.mechanics.units.push({ name: '', type: 'points' });
                          });
                        }}
                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm flex items-center gap-1"
                      >
                        <span>+</span> Add Unit
                      </button>
                    </div>
                    
                    {form.data?.mechanics?.units?.map((unit: UnitItem, index: number) => (
                      <div key={index} className="flex flex-row items-center gap-2 mb-2 p-3 bg-slate-600 rounded-md">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-slate-300 mb-1">Name</label>
                          <input
                            type="text"
                            value={unit.name || ''}
                            onChange={(e) => {
                              setForm(draft => {
                                if (draft.data?.mechanics?.units?.[index]) {
                                  draft.data.mechanics.units[index].name = e.target.value;
                                }
                              });
                            }}
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Unit name"
                          />
                        </div>
                        
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-slate-300 mb-1">Type</label>
                          <SelectChip
                            key={`unit-type-${index}-${unit.type || 'score'}`}
                            defaultValue={unit.type || 'score'}
                            handleSelect={(value) => {
                              setForm(draft => {
                                if (draft.data?.mechanics?.units?.[index]) {
                                  draft.data.mechanics.units[index].type = value;
                                }
                              });
                            }}
                            selections={[
                              { label: 'Score', value: 'score' },
                              { label: 'Flag', value: 'flag' },
                              { label: 'Time', value: 'time' }
                            ]}
                            selectPlaceholder="Select Type"
                            moreClasses="w-full"
                          />
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
                          className={`mt-6 px-2 py-2 text-white rounded-md ${
                            form.data?.mechanics?.units?.length === 1
                              ? 'bg-gray-500 cursor-not-allowed'
                              : 'bg-red-600 hover:bg-red-700'
                          }`}
                          title={form.data?.mechanics?.units?.length === 1 ? "Cannot remove the last unit" : "Remove unit"}
                        >
                          <TrashIcon width="16" height="16" />
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
