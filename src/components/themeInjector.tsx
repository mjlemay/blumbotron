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
  primary: '--color-primary',
  secondary: '--color-secondary',
  tertiary: '--color-tertiary',
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
    const colorOverrideEnabled = !!gameData?.data?.colorOverride;
    const gameColors = gameData?.data?.colors;
    const themeColors = customThemeSettings?.[theme as string]?.colors;
    const themeDefaults = themeColors as Record<string, string> | undefined;

    if (themeDefaults) {
      const colorVars: string[] = [];

      // Build CSS variables - only use game colors if colorOverride is enabled
      Object.entries(colorToCssVar).forEach(([colorKey, cssVar]) => {
        // Use game colors only when override is enabled, otherwise use theme defaults
        const gameColorValue = gameColors?.[colorKey as keyof typeof gameColors];
        const themeColorValue = themeDefaults[colorKey];
        const colorValue = colorOverrideEnabled
          ? (gameColorValue || themeColorValue)
          : themeColorValue;
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
