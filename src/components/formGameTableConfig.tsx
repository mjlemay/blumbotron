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
import { useRef, useState, useEffect } from 'react';
import { setNestedValue } from '../lib/helpers';

type FormGameTableConfigProps = {
  onSuccess?: () => void;
};

function FormGameTableConfig(props: FormGameTableConfigProps) {
  const { onSuccess } = props;
  const { editGame,  loading, error } = useGameStore();
  const { setExpView, setExpModal, setExpSelected } = useExperienceStore();
  const game = getSelected('games') as GameDataItem;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState<string>('');

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
  console.log('Form initialization - fullForm:', fullForm);
  const [form, setForm] = useImmer(fullForm || defaultGame);
  const [errors, setErrors] = useImmer({});
  const { name = '' } = game || {};

  // Update image source when form data changes
  useEffect(() => {
    const updateImageSrc = async () => {
      const backgroundImage = form?.data?.media?.backgroundImage;
      
      if (backgroundImage) {
        try {
          const src = await getImageSrc(backgroundImage);
          setImageSrc(src || '');
        } catch (error) {
          console.error('FormGameTableConfig: Error loading image:', error);
          setImageSrc('');
        }
      } else {
        console.log('No backgroundImage found, clearing src');
        setImageSrc('');
      }
    };
    
    updateImageSrc();
  }, [form?.data?.media?.backgroundImage]);

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.warn('FormGameTableConfig: No file selected');
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      console.error('FormGameTableConfig: Invalid file type:', file.type);
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
      updateFormInput('data.media.backgroundImage', fileName);
      
    } catch (error) {
      console.error('FormGameTableConfig: Failed to save image:', error);
      // Fallback to base64 if file system operations fail
      console.log('FormGameTableConfig: Attempting fallback to base64...');
      try {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64String = event.target?.result as string;
          console.log('FormGameTableConfig: Fallback - storing base64 data, length:', base64String.length);
          updateFormInput('data.media.backgroundImage', base64String);
        };
        reader.onerror = (error) => {
          console.error('FormGameTableConfig: FileReader error:', error);
        };
        reader.readAsDataURL(file);
      } catch (fallbackError) {
        console.error('FormGameTableConfig: Fallback also failed:', fallbackError);
        alert('Failed to upload image. Please try again.');
      }
    }
  };

  const handleImageRemove = async () => {
    const currentImage = form?.data?.media?.backgroundImage;
    
    // If it's a filename (not base64), try to delete the file
    if (currentImage && !currentImage.startsWith('data:')) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('delete_background_image', { fileName: currentImage });
      } catch (error) {
        console.warn('Failed to delete background image file:', error);
      }
    }
    
    updateFormInput('data.media.backgroundImage', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const getImageSrc = async (imagePath: string): Promise<string> => {
    if (!imagePath) {
      console.log('getImageSrc: empty imagePath, returning empty string');
      return '';
    }
    
    if (imagePath.startsWith('data:')) {
      console.log('getImageSrc: returning base64 data URL');
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
      name: z.string().min(3, 'Please supply a game name.'),
      description: z.string(),
      data: z.object({
        media: z.object({
          backgroundImage: z.string().nullable().optional(),
        }).optional(),
        displays: z.array(z.object({
          title: z.string(),
          rows: z.string().min(1, 'Please supply a number of rows.'),
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
        {name} Table Display Configuration
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
                      name="data.displays[0].title"
                      label="Title" 
                      value={form?.data?.displays?.[0]?.title || ''}
                      changeHandler={handleFormChange}
                    />
                    <Input
                      name="data.displays[0].rows"
                      label="Number of Rows"
                      value={form?.data?.displays?.[0]?.rows || ''}
                      changeHandler={handleFormChange}
                    />
                    <div className="w-full mb-4">
                      <label className="block text-sm font-medium text-white mb-2">
                        Background Image
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      
                      {/* Current image preview or upload area */}
                      <div className="border-2 border-dashed border-gray-400 rounded-lg p-4 bg-gray-800">
                        {form?.data?.media?.backgroundImage ? (
                          <div className="space-y-3">
                            {/* Image thumbnail */}
                            <div className="relative inline-block">
                              <img
                                src={imageSrc}
                                alt="Background preview"
                                className="max-w-xs max-h-32 rounded border object-cover"
                                onLoad={() => console.log('FormGameTableConfig: Image loaded successfully:', imageSrc)}
                                onError={(e) => console.error('FormGameTableConfig: Image failed to load:', imageSrc, e)}
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
                              Click to upload a background image
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

export default FormGameTableConfig;
