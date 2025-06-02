import { Experience, GameDataItem, DataItem } from "./types";

export const defaultExperience: Experience = {
    view: 'home',
    modal: 'none',
    selected: {},
}

export const defaultGame: GameDataItem = {
    id: -1,
    snowflake: 'BAD_ID',
    name: '',
    description: ''
}

export const defaultPlayer: DataItem = {
    id: -1,
    snowflake: 'BAD_ID',
    name: '',
    data: ''
}