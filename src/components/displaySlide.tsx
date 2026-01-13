import { useMemo, useEffect, useState } from 'react';
import { useGameStore } from '../stores/gamesStore';
import MarkdownIt from 'markdown-it';
import DOMPurify from 'dompurify';
import { invoke } from '@tauri-apps/api/core';
import { customThemeSettings } from '../lib/consts';

type ComponentProps = {
  game?: string;
  displayIndex?: number;
  isFullScreen?: boolean;
};

const mdParser = new MarkdownIt();

function DisplaySlide(props: ComponentProps): JSX.Element {
  const { game, displayIndex = 0, isFullScreen = false } = props;
  const { games } = useGameStore();
  const [backgroundImageSrc, setBackgroundImageSrc] = useState<string>('');
  const [logoImageSrc, setLogoImageSrc] = useState<string>('');

  const gameData = useMemo(() => 
    games.find((gameItem) => gameItem.snowflake === game), 
    [games, game]
  );

  const displayData = gameData?.data?.displays?.[displayIndex];
  const markdownContent = displayData?.markdown || '';
  const htmlContent = DOMPurify.sanitize(mdParser.render(markdownContent));

  // Get theme defaults if a theme is selected
  const themeName = gameData?.data?.theme;
  const themeSettings = customThemeSettings?.[themeName as string];
  const themeColors = themeSettings?.colors;
  const themeFonts = themeSettings?.fonts;

  // Always apply colors inline - use custom colors if override is enabled, otherwise use theme defaults
  const colorOverrideEnabled = !!gameData?.data?.colorOverride;
  const colors = {
    background: colorOverrideEnabled
      ? (gameData?.data?.colors?.background || themeColors?.background || 'black')
      : (themeColors?.background || 'black'),
    text: colorOverrideEnabled
      ? (gameData?.data?.colors?.text || themeColors?.text || 'white')
      : (themeColors?.text || 'white'),
    primary: themeColors?.primary || undefined,
    secondary: themeColors?.secondary || undefined,
    tertiary: themeColors?.tertiary || undefined,
    tableHeader: colorOverrideEnabled
      ? (gameData?.data?.colors?.tableHeader || themeColors?.tableHeader || undefined)
      : (themeColors?.tableHeader || undefined),
    fontHeader: colorOverrideEnabled
      ? (gameData?.data?.colors?.fontHeader || themeColors?.fontHeader || undefined)
      : (themeColors?.fontHeader || undefined),
    fontPlayer: colorOverrideEnabled
      ? (gameData?.data?.colors?.fontPlayer || themeColors?.fontPlayer || undefined)
      : (themeColors?.fontPlayer || undefined),
  };

  // Determine if we should apply theme styles
  const shouldApplyColors = !!themeName || colorOverrideEnabled;

  const fonts = {
    header: themeFonts?.header || 'Arial, sans-serif',
    player: themeFonts?.player || 'Arial, sans-serif',
    ...(gameData?.data?.fonts || {})
  };

  const title = displayData?.title || '';

  // Layout settings for display elements with defaults
  const defaultCellPadding = { top: 2, right: 3, bottom: 4, left: 3 };
  const layout = displayData?.layout || {};
  const cellPadding = layout.cell?.padding || defaultCellPadding;
  const getAlignmentClass = (alignment?: string, defaultAlignment: string = 'left') => {
    const align = alignment || defaultAlignment;
    switch (align) {
      case 'left': return 'justify-start';
      case 'center': return 'justify-center';
      case 'right': return 'justify-end';
      default: return 'justify-start';
    }
  };
  const getPaddingStyle = (padding?: { top?: number | string; right?: number | string; bottom?: number | string; left?: number | string }) => {
    if (!padding) return {};
    const toViewport = (val?: number | string, unit: 'vh' | 'vw' = 'vw') => {
      if (val === undefined || val === null || val === '') return undefined;
      const numVal = typeof val === 'string' ? parseFloat(val) : val;
      if (isNaN(numVal)) return undefined;
      return `${numVal}${unit}`;
    };
    return {
      paddingTop: toViewport(padding.top, 'vh'),
      paddingRight: toViewport(padding.right, 'vw'),
      paddingBottom: toViewport(padding.bottom, 'vh'),
      paddingLeft: toViewport(padding.left, 'vw'),
    };
  };

  const placement = gameData?.data?.placement || {
    paddingFrame: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
  };

  const backgroundImage = displayData?.backgroundImage 
    || gameData?.data?.media?.backgroundImage 
    || null;
  const backgroundImageOpacity = gameData?.data?.media?.backgroundImageOpacity || 100;
  
  const logoImage = gameData?.data?.media?.logoImage || null;
  const logoImageOpacity = gameData?.data?.media?.logoImageOpacity || 100;
  const logoImageScale = gameData?.data?.media?.logoImageScale || 25;
  const logoImagePosition = gameData?.data?.media?.logoImagePosition || 'center';
  const logoImageHorizontalOffset = gameData?.data?.media?.logoImageHorizontalOffset || 0;
  const logoImageVerticalOffset = gameData?.data?.media?.logoImageVerticalOffset || 0;
  
  const calculatedLogoPosition = () => {
    const positions = logoImagePosition.split(' ');
    
    // Handle 'center' case
    if (logoImagePosition === 'center') {
      return `${50 + logoImageHorizontalOffset}% ${50 + logoImageVerticalOffset}%`;
    }
    
    // Parse position values and calculate with offsets
    let horizontal = 50; // default center
    let vertical = 50;   // default center
    
    // Map position keywords to percentage values
    const horizontalMap: { [key: string]: number } = {
      'left': 0,
      'center': 50,
      'right': 100
    };
    
    const verticalMap: { [key: string]: number } = {
      'top': 0,
      'center': 50,
      'bottom': 100
    };
    
    // Parse the position string (e.g., 'top left', 'bottom center', etc.)
    positions.forEach(pos => {
      if (horizontalMap.hasOwnProperty(pos)) {
        horizontal = horizontalMap[pos];
      } else if (verticalMap.hasOwnProperty(pos)) {
        vertical = verticalMap[pos];
      }
    });
    
    // Apply offsets
    const finalHorizontal = Math.max(0, Math.min(100, horizontal + logoImageHorizontalOffset));
    const finalVertical = Math.max(0, Math.min(100, vertical + logoImageVerticalOffset));
    
    return `${finalHorizontal}% ${finalVertical}%`;
  };

  // Load background image when it changes
  useEffect(() => {
    const loadBackgroundImage = async () => {
      if (backgroundImage) {
        try {
          // If it's already a data URL, use it directly
          if (backgroundImage.startsWith('data:')) {
            setBackgroundImageSrc(backgroundImage);
            return;
          }
          
          // Otherwise, load from Tauri backend
          const dataUrl = await invoke('get_background_image_data', { fileName: backgroundImage }) as string;
          setBackgroundImageSrc(dataUrl);
        } catch (error) {
          console.error('Failed to load background image:', backgroundImage, error);
          setBackgroundImageSrc('');
        }
      } else {
        setBackgroundImageSrc('');
      }
    };
    
    const loadLogoImage = async () => {
      if (logoImage) {
        try {
          // If it's already a data URL, use it directly
          if (logoImage.startsWith('data:')) {
            setLogoImageSrc(logoImage);
            return;
          }
          
          // Otherwise, load from Tauri backend
          const dataUrl = await invoke('get_background_image_data', { fileName: logoImage }) as string;
          setLogoImageSrc(dataUrl);
        } catch (error) {
          console.error('Failed to load logo image:', logoImage, error);
          setLogoImageSrc('');
        }
      } else {
        setLogoImageSrc('');
      }
    };
    
    loadBackgroundImage();
    loadLogoImage();
  }, [backgroundImage, logoImage]);

  return (
    <div
      data-display-frame={isFullScreen ? true : undefined}
      data-fullscreen={isFullScreen ? true : undefined}
      className={`
        ${isFullScreen ? 'w-screen h-screen' : 'rounded-md w-full h-full'}
        flex items-start justify-center
      `}
      style={{
        ...(shouldApplyColors && colors.background && { backgroundColor: colors.background }),
        ...(shouldApplyColors && colors.text && { color: colors.text }),
        minWidth: isFullScreen ? '100vw' : '100%',
        minHeight: isFullScreen ? '100vh' : '100%',
        position: 'relative',
      }}
    >
      {/* Background image layer with its own opacity */}
      {backgroundImageSrc && (
        <div
          className={`
            ${isFullScreen ? 'w-screen h-screen' : 'rounded-md w-full h-full'}
            absolute inset-0
          `}
          style={{
            backgroundImage: `url("${backgroundImageSrc}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: backgroundImageOpacity / 100,
            zIndex: 1,
          }}
        />
      )}

      {/* Logo image layer with its own opacity */}
      {logoImageSrc && (
        <div
          className={`
            ${isFullScreen ? 'w-screen h-screen' : 'rounded-md w-full h-full'}
            absolute inset-0
          `}
          style={{
            backgroundImage: `url("${logoImageSrc}")`,
            backgroundPosition: logoImagePosition ? calculatedLogoPosition() : 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${logoImageScale}%`,
            opacity: logoImageOpacity / 100,
            zIndex: 2,
            maxWidth: isFullScreen ? '100vw' : '100%',
            maxHeight: isFullScreen ? '100vh' : '100%',
          }}
        />
      )}

      <div
        data-content-container
        className={`
          flex flex-col
          items-center
          justify-center
          opacity-100
          overflow-hidden
          relative
          z-10
          ${isFullScreen ? 'w-screen h-screen' : 'w-full h-full backdrop-blur-xl'}
        `}
        style={{
          paddingTop: `${isFullScreen ? placement?.paddingFrame?.top : 0}vh`,
          paddingBottom: `${isFullScreen ? placement?.paddingFrame?.bottom : 0}vh`,
          paddingLeft: `${isFullScreen ? placement?.paddingFrame?.left : 0}vw`,
          paddingRight: `${isFullScreen ? placement?.paddingFrame?.right : 0}vw`,
        }}
      >
        <div
            data-augmented-ui={isFullScreen ? "tl-rect br-rect tr-clip bl-clip both" : ""}
            className="primary-mixin flex flex-col"
        >
          {title && title.length > 0 && (
            <div className="flex flex-row items-stretch justify-start w-full flex-1">
              <h1
                className={`
                  title
                  flex-1
                  text-white
                  font-bold
                  flex
                  items-center
                  ${getAlignmentClass(layout.header?.alignment, 'center')}
                  ${isFullScreen ? 'text-[min(4cqw,4cqh)]' : 'text-[min(2cqw,2cqh)]'}
                `}
                style={{
                  ...(shouldApplyColors && colors.fontHeader && { color: colors.fontHeader }),
                  ...(shouldApplyColors && colors.tableHeader && { backgroundColor: colors.tableHeader }),
                  fontFamily: fonts.header,
                  ...getPaddingStyle(layout.header?.padding),
                }}
              >
                {title}
              </h1>
            </div>
          )}
          <style>
            {`
              [data-slide-container] * {
                font-family: ${fonts.player} !important;
              }
            `}
          </style>
          <div
            data-slide-container
            className={`
              flex-row prose prose-invert max-w-none w-full overflow-hidden
              ${isFullScreen ? 'text-[min(4cqw,4cqh)]' : 'text-[min(2cqw,2cqh)]'}
            `}
            style={{
              ...(shouldApplyColors && colors.fontPlayer && { color: colors.fontPlayer }),
              fontFamily: fonts.player,
              textAlign: layout.cell?.alignment || 'left',
              lineHeight: 1.6,
              ...getPaddingStyle(cellPadding),
            }}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      </div>
    </div>
  );
}

export default DisplaySlide;
