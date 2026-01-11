import { generateSnowflake } from './snowflake';
import { Experience, DataItem, GameDataItem, RosterDataItem, UnitItem } from './types';

export const defaultExperience: Experience = {
  view: 'home',
  subView: 'main',
  modal: 'none',
  selected: {},
  subSelected: null,
};

export const defaultPadding = { top: 0, right: 0, bottom: 0, left: 0 };

export const defaultDisplayLayout = {
  header: { padding: { ...defaultPadding }, alignment: 'center' as const },
  subheader: { padding: { ...defaultPadding }, alignment: 'center' as const },
  avatars: { padding: { ...defaultPadding }, alignment: 'left' as const },
  names: { padding: { ...defaultPadding }, alignment: 'left' as const },
  columns: { padding: { ...defaultPadding }, alignment: 'right' as const },
  rows: { padding: { top: 0, right: 5, bottom: 0, left: 5 }, alignment: 'left' as const }
};

export const defaultDisplayData = {
  title: 'High Scores',
  rows: 5,
  category: 'table' as const,
  filteredUnits: [],
  layout: defaultDisplayLayout
};

export const defaultUnitItem: UnitItem = {
  name: 'points',
  type: 'score',
  id: Number(generateSnowflake())
}

export const defaultGameMetaData = {
  theme: 'default',
  mechanics: {
    units: [defaultUnitItem]
  },
  displays: [defaultDisplayData],
};

export const defaultGame: GameDataItem = {
  id: -1,
  snowflake: 'BAD_ID',
  name: '',
  description: '',
  roster: null,
  data: defaultGameMetaData,
};

export const defaultPlayer: DataItem = {
  id: -1,
  snowflake: 'BAD_ID',
  name: '',
  data: {},
};

export const defaultRoster: RosterDataItem = {
  id: -1,
  snowflake: 'BAD_ID',
  name: '',
  description: '',
  allow: [],
  deny: [],
  opt_in: [],
  opt_out: [],
};

export const defaultScore = {
  id: -1,
  snowflake: 'BAD_ID',
  name: '',
  game: '',
  player: '',
  unit_id: -1,
  unit_type: 'score',
  datum: 0,
};
