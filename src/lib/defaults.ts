import { log } from 'console';
import { Experience, DataItem, GameDataItem, RosterDataItem } from './types';

export const defaultExperience: Experience = {
  view: 'home',
  subView: 'main',
  modal: 'none',
  selected: {},
  subSelected: null,
};

export const defaultGameMetaData = {
  colors: {
    background: '#000000',
    text: '#ffffff',
    primary: '#ff0000',
    secondary: '#00ff00',
    tertiary: '#0000ff',
  },
  media: {
    backgroundImage: null,
    backgroundVideo: null,
    iconImage: null,
    logoImage: null,
    backgroundImageOpacity: 100,
    logoImageOpacity: 100,
    logoImagePosition: 'center',
    logoImageScale: 25,
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
