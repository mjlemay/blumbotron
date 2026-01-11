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
  id: number;
  type: scoreUnitType;
  data?: Record<string, unknown>;
}

export type LayoutPadding = {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
}

export type LayoutAlignment = 'left' | 'center' | 'right';

export type LayoutElement = {
    padding?: LayoutPadding;
    alignment?: LayoutAlignment;
}

export type DisplayLayout = {
    header?: LayoutElement;
    subheader?: LayoutElement;
    avatars?: LayoutElement;
    names?: LayoutElement;
    columns?: LayoutElement;
    rows?: LayoutElement;
    cell?: LayoutElement;
}

export type DisplayData = {
    title?: string;
    markdown?: string;
    rows?: number;
    offset?: number;
    direction?: 'ascending' | 'descending';
    sortUnit?: number;
    backgroundImage?: string;
    backgroundVideo?: string | null;
    titleImage?: string | null;
    showAvatars?: boolean;
    showSubHeaders?: boolean;
    category: DisplayCategory,
    filteredUnits: string[],
    layout?: DisplayLayout;
}

export type GameDataItem = DataItem & {
  roster?: string | null | undefined;
  data?: {
    theme?: string;
    colorOverride?: string;
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
  game: string;
  player: string;
  unit_id: number;
  unit_type: string;
  datum: number | string;
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
  data: Record<string, unknown | Record<string, string> []>
};