import { useEffect } from 'react';
import { useGameStore } from "../stores/gamesStore";
import { customThemeSettings } from '../lib/consts';

type ComponentProps = {
  game?: string;
};

function ThemeInjector(props: ComponentProps): JSX.Element {
  const { game } = props;
  const { games } = useGameStore();
  const gameData = games.find((gameItem) => gameItem.snowflake === game);

useEffect(() => {  
  const theme = gameData?.data?.theme;
  const customTheme = customThemeSettings?.[theme as string]?.path as string;
    if (!theme || theme === '' || !customTheme) return;
    
    // Remove any existing theme links
    const existingThemeLinks = document.querySelectorAll('link[data-blumbotron-theme]');
    existingThemeLinks.forEach(link => link.remove());
    
    // Create new theme link
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.setAttribute('data-blumbotron-theme', customTheme);
    
    // Construct theme URL - themes are in public/themes/ folder
    link.href = `/themes/${customTheme}`;
    
    // Add error handling
    link.onerror = function() {
      console.warn(`DisplayTableWrapper: Failed to load theme: ${link.href}`);
    };
    
    link.onload = function() {
      console.log(`DisplayTableWrapper: Successfully loaded theme: ${link.href}`);
    };
    
    // Append to head
    document.head.appendChild(link);
    
    // Cleanup function to remove theme when component unmounts or theme changes
    return () => {
      const themeLink = document.querySelector(`link[data-blumbotron-theme="${customTheme}"]`);
      if (themeLink) {
        themeLink.remove();
      }
    };
  }, [gameData]);

  return <></>;
}

export default ThemeInjector;
