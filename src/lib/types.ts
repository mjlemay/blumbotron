export type DataItem = {
  created_at?: string;
  data?: Record<string, unknown>;
  description?: string;
  handleClick?: Function;
  id?: number;
  name: string;
  snowflake?: string;
  updated_at?: string;
};

export type DisplayData = {
    title?: string;
    rows?: number;
    bgImage?: string;
}

export type GameDataItem = DataItem & {
  roster?: string | null;
  data?: {
    theme?: string;
    colors?: {
      background?: string;
      text?: string;
      primary?: string;
      secondary?: string;
      tertiary?: string;
      tableHeader?: string;
      tableRow?: string;
      tableAlt?: string;
    };
    fonts?: {
      header?: string;
      player?: string;
      score?: string;
    };
    backgroundImage?: string | null;
    placement?: {
      paddingFrame?: {
        top?: string;
        bottom?: string;
        left?: string;
        right?: string;
      };
    };
    displays?: DisplayData[];
  };
};

export type ScoreDataItem = DataItem & {
  game?: string | null;
  player?: string | null;
  units?: string | null;
  amount?: number | null;
};

export type RosterDataItem = DataItem & {
  allow?: string[];
  deny?: string[];
  opt_in?: string[];
  opt_out?: string[];
};

export type SelectedItem = DataItem | GameDataItem | RosterDataItem | ScoreDataItem;

export type Experience = {
  view: string;
  modal: string;
  selected: Record<string, DataItem | SelectedItem> | null;
};