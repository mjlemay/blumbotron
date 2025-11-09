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

export type UnitItem = {
  name: string;
  type: scoreUnitType;
}

export type DisplayData = {
    title?: string;
    rows?: number;
    offset?: number;
    direction?: 'ascending' | 'descending';
    sortUnit?: string;
    backgroundImage?: string;
    backgroundVideo?: string | null;
    titleImage?: string | null;
    showAvatars?: boolean;
    category: DisplayCategory,
    filteredUnits: string[]
}

export type GameDataItem = DataItem & {
  roster?: string | null | undefined;
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
    media?: {
      showAvatars?: boolean;
      backgroundImage?: string | null;
      backgroundImageOpacity?: number | null;
      logoImage?: string | null;
      logoImageOpacity?: number | null;
      logoImagePosition?: string | null;
      logoImageScale?: number | null;
      logoImageHorizontalOffset?: number | null;
      logoImageVerticalOffset?: number | null;
    };
    placement?: {
      paddingFrame?: {
        top?: string;
        bottom?: string;
        left?: string;
        right?: string;
      };
    };
    mechanics?:
    {
      units?: UnitItem[];
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

export type DisplayCategory = 'table' | 'slide';

export type scoreUnitType = 'score' | 'flag' | 'time';

export type Experience = {
  view: string;
  subView: string;
  modal: string;
  selected: Record<string, DataItem | SelectedItem> | null;
  subSelected: number | string | null;
};

export type GameAvatar = {
  game?: string | null;
  location?: string | null;
}

export type PlayerDataItem = DataItem & {
  avatars?: GameAvatar[];
};