import { useEffect } from 'react';
import { useGameStore } from "../stores/gamesStore";
import { customThemeSettings } from '../lib/consts';

type ComponentProps = {
  game?: string;
};

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

function ThemeInjector(props: ComponentProps): JSX.Element {
  const { game } = props;
  const { games } = useGameStore();
  const gameData = games.find((gameItem) => gameItem.snowflake === game);

  useEffect(() => {
    const theme = gameData?.data?.theme;
    const customTheme = customThemeSettings?.[theme as string]?.path as string;

    // Remove any existing theme links and color overrides
    const existingThemeLinks = document.querySelectorAll('link[data-blumbotron-theme]');
    existingThemeLinks.forEach(link => link.remove());
    const existingColorStyles = document.querySelectorAll('style[data-blumbotron-colors]');
    existingColorStyles.forEach(style => style.remove());

    if (!theme || theme === '' || !customTheme) return;

    // Create new theme link
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.setAttribute('data-blumbotron-theme', customTheme);

    // Construct theme URL - themes are in public/themes/ folder
    link.href = `/themes/${customTheme}`;

    // Add error handling
    link.onerror = function() {
      console.warn(`ThemeInjector: Failed to load theme: ${link.href}`);
    };

    link.onload = function() {
      console.log(`ThemeInjector: Successfully loaded theme: ${link.href}`);
    };

    // Append to head
    document.head.appendChild(link);

    // Inject color overrides from game data
    const gameColors = gameData?.data?.colors;
    const themeDefaults = customThemeSettings?.[theme as string]?.colors as Record<string, string> | undefined;

    if (gameColors || themeDefaults) {
      const colorVars: string[] = [];

      // Build CSS variables from game colors, falling back to theme defaults
      Object.entries(colorToCssVar).forEach(([colorKey, cssVar]) => {
        const colorValue = gameColors?.[colorKey] || themeDefaults?.[colorKey];
        if (colorValue) {
          colorVars.push(`${cssVar}: ${colorValue};`);
        }
      });

      if (colorVars.length > 0) {
        const styleEl = document.createElement('style');
        styleEl.setAttribute('data-blumbotron-colors', 'true');
        styleEl.textContent = `:root { ${colorVars.join(' ')} }`;
        document.head.appendChild(styleEl);
      }
    }

    // Cleanup function to remove theme when component unmounts or theme changes
    return () => {
      const themeLink = document.querySelector(`link[data-blumbotron-theme="${customTheme}"]`);
      if (themeLink) {
        themeLink.remove();
      }
      const colorStyle = document.querySelector('style[data-blumbotron-colors]');
      if (colorStyle) {
        colorStyle.remove();
      }
    };
  }, [gameData]);

  return <></>;
}

export default ThemeInjector;
