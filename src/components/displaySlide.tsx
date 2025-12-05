import { useMemo, useEffect, useState } from 'react';
import { useGameStore } from '../stores/gamesStore';
import MarkdownIt from 'markdown-it';
import { invoke } from '@tauri-apps/api/core';

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
  const htmlContent = mdParser.render(markdownContent);

  const colors = {
    background: 'black',
    text: 'white',
    ...(gameData?.data?.colors || {})
  };
  
  const fonts = {
    body: 'Arial, sans-serif',
    ...(gameData?.data?.fonts || {})
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
      className="rounded-md w-full h-full relative"
      style={{
        backgroundColor: colors.background
      }}
    >
      {/* Background image layer with its own opacity */}
      {backgroundImageSrc && (
        <div 
          className="rounded-md w-full h-full absolute inset-0"
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
          className="rounded-md w-full h-full absolute inset-0"
          style={{
            backgroundImage: `url("${logoImageSrc}")`,
            backgroundPosition: logoImagePosition ? calculatedLogoPosition() : 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${logoImageScale}%`,
            opacity: logoImageOpacity / 100,
            zIndex: 2,
          }}
        />
      )}
      
      <div 
        className="flex flex-col items-center justify-center w-full h-full relative z-10"
        style={{
          paddingTop: `${placement?.paddingFrame?.top || 0}vh`,
          paddingBottom: `${placement?.paddingFrame?.bottom || 0}vh`,
          paddingLeft: `${placement?.paddingFrame?.left || 0}vw`,
          paddingRight: `${placement?.paddingFrame?.right || 0}vw`,
        }}
      >
        <div 
            data-augmented-ui={isFullScreen ? "tl-rect br-rect tr-clip bl-clip both" : ""}
            className="primary-mixin"
        >
        <div
          data-slide-container 
          className="prose prose-invert max-w-none w-full overflow-hidden"
          style={{
            color: colors.text,
            fontFamily: fonts.body
          }}
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
        </div>
      </div>
    </div>
  );
}

export default DisplaySlide;
