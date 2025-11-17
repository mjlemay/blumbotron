import { generateSnowflake } from './snowflake';
import { Experience, DataItem, GameDataItem, RosterDataItem, UnitItem } from './types';

export const defaultExperience: Experience = {
  view: 'home',
  subView: 'main',
  modal: 'none',
  selected: {},
  subSelected: null,
};

export const defaultDisplayData = {
  title: 'High Scores',
  rows: 5,
  category: 'table' as const,
  filteredUnits: []
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
