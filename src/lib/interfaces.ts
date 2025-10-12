export interface GameVisualData extends Record<string, unknown> {
  colors?: {
    background?: string;
    text?: string;
    primary?: string;
    secondary?: string;
    tertiary?: string;
    tableHeader?: string;
    tableRow?: string;
    tableAlt?: string;
    fontHeader?: string;
    fontPlayer?: string;
    fontScore?: string;
  };
  fonts?: {
    header?: string;
    player?: string;
    score?: string;
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