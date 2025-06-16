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

export type GameDataItem = DataItem & {
  roster?: string | null;
  data?: {
    colors?: {
      background?: string;
      text?: string;
      primary?: string;
      secondary?: string;
      tertiary?: string;
    };
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
