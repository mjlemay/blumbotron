import { useImmer } from 'use-immer';
import { useState, useEffect } from 'react';
import Input from './input';
import SelectChip from './selectChip';
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
import { GameVisualData } from '../lib/interfaces';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { customThemeSettings } from '../lib/consts';

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

// Map form color keys to CSS variable names
const colorToCssVar: Record<string, string> = {
  background: '--color-background',
  text: '--color-text',
  tableHeader: '--color-table-header',
  tableRow: '--color-table-row',
  tableAlt: '--color-table-alt',
  fontHeader: '--color-font-header',
  fontPlayer: '--color-font-player',
  fontScore: '--color-font-score',
};

type ThemePreviewProps = {
  theme?: string;
  colors?: Record<string, string>;
  gameSnowflake?: string;
};

function ThemePreview({ theme, colors, gameSnowflake }: ThemePreviewProps) {
  const previewId = 'theme-preview-container';
  const [themeKey, setThemeKey] = useState(0);

  // Load theme CSS and inject color variables
  useEffect(() => {
    const customTheme = customThemeSettings?.[theme as string]?.path as string;
    const linkId = 'theme-preview-link';
    const styleId = 'theme-preview-vars';

    // Remove existing preview styles
    document.getElementById(linkId)?.remove();
    document.getElementById(styleId)?.remove();

    if (!theme || theme === 'none' || !customTheme) {
      setThemeKey(prev => prev + 1);
      return;
    }

    // Create new theme link for preview
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = `/themes/${customTheme}`;
    link.onload = () => setThemeKey(prev => prev + 1);
    document.head.appendChild(link);

    return () => {
      document.getElementById(linkId)?.remove();
      document.getElementById(styleId)?.remove();
    };
  }, [theme]);

  // Inject CSS variables via style tag when colors change
  useEffect(() => {
    const styleId = 'theme-preview-vars';
    document.getElementById(styleId)?.remove();

    const themeDefaults = customThemeSettings?.[theme as string]?.colors as Record<string, string> | undefined;
    if (!themeDefaults && !colors) return;

    const colorVars: string[] = [];

    // Add all theme default colors first
    if (themeDefaults) {
      Object.entries(themeDefaults).forEach(([key, val]) => {
        // Map known keys to CSS var names, or use key directly
        const cssVar = colorToCssVar[key] || `--color-${key}`;
        colorVars.push(`${cssVar}: ${val};`);
      });
    }

    // Override with user-selected colors if provided
    if (colors) {
      Object.entries(colorToCssVar).forEach(([colorKey, cssVar]) => {
        const colorValue = colors[colorKey];
        if (colorValue) {
          colorVars.push(`${cssVar}: ${colorValue};`);
        }
      });
    }

    if (colorVars.length > 0) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `#${previewId}, #${previewId} * { ${colorVars.join(' ')} }`;
      document.head.appendChild(style);
    }

    return () => {
      document.getElementById(styleId)?.remove();
    };
  }, [theme, colors]);

  // Get theme defaults for inline styles
  const themeDefaults = customThemeSettings?.[theme as string]?.colors as Record<string, string> | undefined;

  // Sample data for preview
  const sampleScores = [
    { player: 'Player One', score: 1500 },
    { player: 'Player Two', score: 1200 },
    { player: 'Player Three', score: 900 },
    { player: 'Player Four', score: 600 },
    { player: 'Player Five', score: 300 },
  ];

  // Only apply inline styles when custom colors are provided (override is ON)
  // Otherwise, let the theme CSS handle all styling via CSS variables
  const hasCustomColors = !!colors;

  return (
    <div
      id={previewId}
      key={themeKey}
      className="w-full aspect-video bg-black rounded-lg overflow-hidden relative"
      data-display-frame
    >
      <div
        data-table-container
        className="w-full h-full flex flex-col relative"
        style={hasCustomColors ? {
          backgroundColor: colors?.background || themeDefaults?.background || '#000',
          color: colors?.text || themeDefaults?.text || '#fff',
        } : undefined}
      >
        <h1
          className="title text-center text-lg font-bold flex items-center justify-center"
          style={hasCustomColors ? {
            color: colors?.fontHeader || themeDefaults?.fontHeader || colors?.text || themeDefaults?.text,
            backgroundColor: colors?.tableHeader || themeDefaults?.tableHeader,
          } : undefined}
        >
          Sample Leaderboard
        </h1>
        <div className="flex-1 flex flex-col">
          {sampleScores.map((item, index) => (
            <div
              key={index}
              className="flex-row flex items-center justify-between flex-1"
              style={hasCustomColors ? {
                backgroundColor: index % 2 === 0
                  ? (colors?.tableRow || themeDefaults?.tableRow || 'transparent')
                  : (colors?.tableAlt || themeDefaults?.tableAlt || 'transparent'),
              } : undefined}
            >
              <span
                className="pl-4"
                style={hasCustomColors ? { color: colors?.fontPlayer || themeDefaults?.fontPlayer || colors?.text || themeDefaults?.text } : undefined}
              >
                {item.player}
              </span>
              <span
                className="pr-4"
                style={hasCustomColors ? { color: colors?.fontScore || themeDefaults?.fontScore || colors?.text || themeDefaults?.text } : undefined}
              >
                {item.score}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


function FormGameStyles(props: FormGameStylesProps) {
  const { onSuccess } = props;
  const { editGame,  loading, error } = useGameStore();
  const { setExpView, setExpModal, setExpSelected } = useExperienceStore();
  const game = getSelected('games') as GameDataItem;
  const { name = '' } = game || {};

  let gameData: GameVisualData = {};
  try {
    if (typeof game?.data === 'string') {
      gameData = JSON.parse(game.data);
    } else if (game?.data) {
      gameData = game.data as GameVisualData;
    }
  } catch (error) {
    gameData = {};
  }
  
  const fullForm = { ...game, data: gameData };
  const [form, setForm] = useImmer(fullForm || defaultGame);
  const [errors, setErrors] = useImmer({});

  // Font options based on available fonts
  const fontOptions = [
    { value: 'Arial, sans-serif', label: 'Default (Arial)', style: { fontFamily: 'Arial, sans-serif' } },
    { value: '"Eightgon", monospace', label: 'Eightgon', style: { fontFamily: '"Eightgon", monospace' } },
    { value: '"Excluded", sans-serif', label: 'Excluded', style: { fontFamily: '"Excluded", sans-serif' } },
    { value: '"Groutpix Flow Slab Serif", serif', label: 'Groutpix Flow Slab Serif', style: { fontFamily: '"Groutpix Flow Slab Serif", serif' } },
    { value: '"Hacked", monospace', label: 'Hacked', style: { fontFamily: '"Hacked", monospace' } },
    { value: '"Martius", serif', label: 'Martius', style: { fontFamily: '"Martius", serif' } },
    { value: '"Monument Valley 12", sans-serif', label: 'Monument Valley 12', style: { fontFamily: '"Monument Valley 12", sans-serif' } },
    { value: '"Moonhouse", display', label: 'Moonhouse', style: { fontFamily: '"Moonhouse", display' } },
    { value: '"Orbitronio", sans-serif', label: 'Orbitronio', style: { fontFamily: '"Orbitronio", sans-serif' } },
    { value: '"Pasti", cursive', label: 'Pasti', style: { fontFamily: '"Pasti", cursive' } },
    { value: '"Stardate 81316", sci-fi', label: 'Stardate 81316', style: { fontFamily: '"Stardate 81316", sci-fi' } },
    { value: '"Timeburner", display', label: 'Timeburner', style: { fontFamily: '"Timeburner", display' } },
    { value: '"Warriot Circle", display', label: 'Warriot Circle', style: { fontFamily: '"Warriot Circle", display' } },
  ];

  const customThemeValues = customThemeSettings?.[form?.data?.theme as string] || {};

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

  const handleColorChange = (formKey: string, color: string) => {
    updateFormInput(formKey as string, color as string);
  };

  const handleFontSelect = (fontKey: string) => (fontValue: string) => {
    updateFormInput(fontKey, fontValue);
  };

  const editGameData = async (formData: GameDataItem) => {
    
    let formSchema = z.object({
      name: z.string().min(3, 'Please supply a game name.'),
      description: z.string(),
      data: z.object({
        theme: z.string().optional(),
        colorOverride: z.string().optional(),
        colors: z.object({
          background: z.string().optional(),
          text: z.string().optional(),
          tableHeader: z.string().optional(),
          tableRow: z.string().optional(),
          tableAlt: z.string().optional(),
          fontHeader: z.string().optional(),
          fontPlayer: z.string().optional(),
          fontScore: z.string().optional(),
        }).optional(),
        fonts: z.object({
          header: z.string().optional(),
          player: z.string().optional(),
          score: z.string().optional(),
        }).optional(),
        placement: z.object({
          paddingFrame: z.object({
            top: z.coerce.number().optional(),
            bottom: z.coerce.number().optional(),
            left: z.coerce.number().optional(),
            right: z.coerce.number().optional(),
          }).optional(),
        }).optional(),
        // Allow any additional data fields to be preserved
        displays: z.array(z.any()).optional(),
        backgroundImage: z.string().optional(),
      }).passthrough() // This allows additional fields to pass through
    });
    try {
      formSchema.parse(formData);
      
      // Merge existing data with new changes
      const existingData = game?.data || {};
      const newColors = formData.data?.colors || {};
      const newFonts = formData.data?.fonts || {};
      const newPlacement = formData.data?.placement || {};
      const newTheme = formData.data?.theme === 'none' ? '' : formData.data?.theme;
      const colorOverride = formData.data?.colorOverride;
      const mergedData = {
        ...existingData,
        ...(newTheme !== undefined && { theme: newTheme }),
        colorOverride: colorOverride || '',
        colors: {
          ...existingData.colors,
          ...newColors
        },
        fonts: {
          ...existingData.fonts,
          ...newFonts
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
    <div className="flex flex-col bg-slate-900 rounded-lg shadow-lg w-full">
      <div className="flex flex-row gap-6 p-4">
        {/* Left Column - Form */}
        <div className="flex-1 max-w-lg">
          <ScrollArea.Root className="w-full flex-1 min-h-0 rounded bg-slate-700/50 overflow-y-auto overflow-x-hidden">
            <ScrollArea.Viewport className="h-full w-full">
              <div className="px-5 py-[15px] min-h-[calc(100vh-300px)] max-h-[calc(100vh-300px)]">
                <div className="flex flex-row items-center justify-start">
                  <div className="flex flex-col items-center justify-start text-lg font-medium rounded-lg w-full">
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
                      Theme
                    </h3>
                    <div className="space-y-4 w-full mb-6">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          CSS Theme
                        </label>
                        <SelectChip
                          selectLabel="Theme"
                          selectPlaceholder="Choose Theme"
                          selections={[
                            { value: 'none', label: 'None (Default)' },
                            { value: 'cyTerminal', label: 'CyTerminal' },
                            { value: 'neoNavigator', label: 'Neo Navigator' },
                            { value: 'neuralNet', label: 'Neural Net' },
                          ]}
                          defaultValue={((form?.data?.theme as string) === '' || !(form?.data?.theme as string)) ? 'none' : (form?.data?.theme as string)}
                          handleSelect={handleFontSelect('data.theme')}
                          moreClasses="w-full justify-start"
                        />
                      </div>
                    </div>
                    
                    {/* Color Override Toggle */}
                    <div className="w-full mb-4 mt-4">
                      <label className="flex items-center justify-between cursor-pointer p-3 bg-slate-800 rounded-lg hover:bg-slate-750 transition-colors">
                        <span className="text-base font-medium text-white">
                          Override Default Colors
                        </span>
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={!!form?.data?.colorOverride}
                            onChange={(e) => updateFormInput('data.colorOverride', e.target.checked ? 'true' : '')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </div>
                      </label>
                    </div>

                    <div
                      className="overflow-hidden transition-all duration-300 ease-in-out"
                      style={{
                        maxHeight: form?.data?.colorOverride ? '2000px' : '0px',
                        opacity: form?.data?.colorOverride ? 1 : 0
                      }}
                    >
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold border-b border-slate-600 p-2 pr-1 pl-1 w-full">
                          Basic Colors
                        </h3>
                    <Input
                      name="data.colors.background"
                      label="Background Color"
                      value={form?.data?.colors?.background 
                        || (customThemeValues.colors as Record<string, string>)?.background 
                        || '#000000'}
                      changeHandler={handleFormChange}
                      preview={
                        <div 
                          className="rounded-lg w-11 h-11 ring-1 ring-slate-500/40" 
                          style={{ backgroundColor: form?.data?.colors?.background  
                            || (customThemeValues.colors as Record<string, string>)?.background 
                            || '#000000' }}
                        />
                      }
                      actionButton={
                        <ButtonColorPicker
                          color={form?.data?.colors?.background 
                            || (customThemeValues.colors as Record<string, string>)?.background 
                            || '#000000'}
                          setColor={(color: string) => handleColorChange('data.colors.background', color)}
                        />
                      }
                    />
                    <Input
                      name="data.colors.text"
                      label="Text Color"
                      value={form?.data?.colors?.text 
                        || (customThemeValues.colors as Record<string, string>)?.text 
                        || '#ffffff'}
                      changeHandler={handleFormChange}
                      preview={
                        <div 
                          className="rounded-lg w-11 h-11 ring-1 ring-slate-500/40" 
                          style={{ backgroundColor: form?.data?.colors?.text 
                            || (customThemeValues.colors as Record<string, string>)?.text 
                            || '#ffffff' }}
                        />
                      }
                      actionButton={
                        <ButtonColorPicker
                          color={form?.data?.colors?.text 
                            || (customThemeValues.colors as Record<string, string>)?.text 
                            || '#ffffff'}
                          setColor={(color: string) => handleColorChange('data.colors.text', color)}
                        />
                      }
                    />
                    <h3 className="text-xl font-bold border-b border-slate-600 p-2 pr-1 pl-1 w-full">
                      Table Colors
                    </h3>
                    <Input
                      name="data.colors.tableHeader"
                      label="Table Header Color"
                      value={form?.data?.colors?.tableHeader 
                        || (customThemeValues.colors as Record<string, string>)?.tableHeader 
                        || ''}
                      changeHandler={handleFormChange}
                      preview={
                        <div 
                          className="rounded-lg w-11 h-11 ring-1 ring-slate-500/40" 
                          style={{ backgroundColor: form?.data?.colors?.tableHeader 
                            || (customThemeValues.colors as Record<string, string>)?.tableHeader 
                            || '' }}
                        />
                      }
                      actionButton={
                        <ButtonColorPicker
                          color={form?.data?.colors?.tableHeader 
                            || (customThemeValues.colors as Record<string, string>)?.tableHeader 
                            || 'transparent'}
                          setColor={(color: string) => handleColorChange('data.colors.tableHeader', color)}
                        />
                      }
                    />
                    <Input
                      name="data.colors.tableRow"
                      label="Row Color"
                      value={form?.data?.colors?.tableRow 
                        || (customThemeValues.colors as Record<string, string>)?.tableRow 
                        || ''}
                      changeHandler={handleFormChange}
                      preview={
                        <div 
                          className="rounded-lg w-11 h-11 ring-1 ring-slate-500/40" 
                          style={{ backgroundColor: form?.data?.colors?.tableRow 
                            || (customThemeValues.colors as Record<string, string>)?.tableRow 
                            || 'transparent' }}
                        />
                      }
                      actionButton={
                        <ButtonColorPicker
                          color={form?.data?.colors?.tableRow 
                            || (customThemeValues.colors as Record<string, string>)?.tableRow 
                            || ''}
                          setColor={(color: string) => handleColorChange('data.colors.tableRow', color)}
                        />
                      }
                    />
                    <Input
                      name="data.colors.tableAlt"
                      label="Alternate Row Color"
                      value={form?.data?.colors?.tableAlt
                        || (customThemeValues.colors as Record<string, string>)?.tableAlt
                        || ''}
                      changeHandler={handleFormChange}
                      preview={
                        <div
                          className="rounded-lg w-11 h-11 ring-1 ring-slate-500/40"
                          style={{ backgroundColor: form?.data?.colors?.tableAlt
                            || (customThemeValues.colors as Record<string, string>)?.tableAlt
                            || 'transparent' }}
                        />
                      }
                      actionButton={
                        <ButtonColorPicker
                          color={form?.data?.colors?.tableAlt
                            || (customThemeValues.colors as Record<string, string>)?.tableAlt
                            || ''}
                          setColor={(color: string) => handleColorChange('data.colors.tableAlt', color)}
                        />
                      }
                    />
                    <h3 className="text-xl font-bold border-b border-slate-600 p-2 pr-1 pl-1 w-full">
                      Font Colors
                    </h3>
                    <Input
                      name="data.colors.fontHeader"
                      label="Header Text Color"
                      value={form?.data?.colors?.fontHeader
                        || (customThemeValues.colors as Record<string, string>)?.fontHeader
                        || ''}
                      changeHandler={handleFormChange}
                      preview={
                        <div
                          className="rounded-lg w-11 h-11 ring-1 ring-slate-500/40"
                          style={{ backgroundColor: form?.data?.colors?.fontHeader
                            || (customThemeValues.colors as Record<string, string>)?.fontHeader
                            || '' }}
                        />
                      }
                      actionButton={
                        <ButtonColorPicker
                          color={form?.data?.colors?.fontHeader
                            || (customThemeValues.colors as Record<string, string>)?.fontHeader
                            || 'transparent'}
                          setColor={(color: string) => handleColorChange('data.colors.fontHeader', color)}
                        />
                      }
                    />
                    <Input
                      name="data.colors.fontPlayer"
                      label="Player Name Color"
                      value={form?.data?.colors?.fontPlayer
                        || (customThemeValues.colors as Record<string, string>)?.fontPlayer
                        || ''}
                      changeHandler={handleFormChange}
                      preview={
                        <div
                          className="rounded-lg w-11 h-11 ring-1 ring-slate-500/40"
                          style={{ backgroundColor: form?.data?.colors?.fontPlayer
                            || (customThemeValues.colors as Record<string, string>)?.fontPlayer
                            || 'transparent' }}
                        />
                      }
                      actionButton={
                        <ButtonColorPicker
                          color={form?.data?.colors?.fontPlayer
                            || (customThemeValues.colors as Record<string, string>)?.fontPlayer
                            || ''}
                          setColor={(color: string) => handleColorChange('data.colors.fontPlayer', color)}
                        />
                      }
                    />
                    <Input
                      name="data.colors.fontScore"
                      label="Score Color"
                      value={form?.data?.colors?.fontScore
                        || (customThemeValues.colors as Record<string, string>)?.fontScore
                        || ''}
                      changeHandler={handleFormChange}
                      preview={
                        <div
                          className="rounded-lg w-11 h-11 ring-1 ring-slate-500/40"
                          style={{ backgroundColor: form?.data?.colors?.fontScore
                            || (customThemeValues.colors as Record<string, string>)?.fontScore
                            || 'transparent' }}
                        />
                      }
                      actionButton={
                        <ButtonColorPicker
                          color={form?.data?.colors?.fontScore
                            || (customThemeValues.colors as Record<string, string>)?.fontScore
                            || ''}
                          setColor={(color: string) => handleColorChange('data.colors.fontScore', color)}
                        />
                      }
                    />
                      </div>
                    </div>
                     <h3 className="text-xl font-bold border-b border-slate-600 p-2 pr-1 pl-1 w-full">
                      Fonts
                    </h3>
                    <div className="space-y-4 w-full">
                      {/* Header Font */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Header Font
                        </label>
                        <SelectChip
                          selectLabel="Header Font"
                          selectPlaceholder="Choose Font"
                          selections={fontOptions}
                          defaultValue={form?.data?.fonts?.header || 'Arial, sans-serif'}
                          handleSelect={handleFontSelect('data.fonts.header')}
                          moreClasses="w-full justify-start"
                        />
                      </div>
                      
                      {/* Player Name Font */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Player Name Font
                        </label>
                        <SelectChip
                          selectLabel="Player Font"
                          selectPlaceholder="Choose Font"
                          selections={fontOptions}
                          defaultValue={form?.data?.fonts?.player || 'Arial, sans-serif'}
                          handleSelect={handleFontSelect('data.fonts.player')}
                          moreClasses="w-full justify-start"
                        />
                      </div>
                      
                      {/* Score Font */}
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Score Font
                        </label>
                        <SelectChip
                          selectLabel="Score Font"
                          selectPlaceholder="Choose Font"
                          selections={fontOptions}
                          defaultValue={form?.data?.fonts?.score || 'Arial, sans-serif'}
                          handleSelect={handleFontSelect('data.fonts.score')}
                          moreClasses="w-full justify-start"
                        />
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
        </div>

        {/* Right Column - Theme Preview */}
        <div className="flex flex-col items-start gap-4 flex-1">
          <h3 className="text-xl font-bold text-white">Preview</h3>
          <ThemePreview
            theme={form?.data?.theme as string}
            colors={form?.data?.colorOverride ? form?.data?.colors : undefined}
            gameSnowflake={game?.snowflake}
          />
        </div>
      </div>

      {/* Edit Button */}
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
