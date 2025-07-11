import { Experience, DataItem, GameDataItem, RosterDataItem } from './types';

export const defaultExperience: Experience = {
  view: 'home',
  modal: 'none',
  selected: {},
};

export const defaultGameMetaData = {
  colors: {
    background: '#000000',
    text: '#ffffff',
    primary: '#ff0000',
    secondary: '#00ff00',
    tertiary: '#0000ff',
  },
  displays: [
    {
      title: 'High Scores',
      rows: 10,
    },
  ],
};

export const defaultGame: GameDataItem = {
  id: -1,
  snowflake: 'BAD_ID',
  name: '',
  description: '',
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
