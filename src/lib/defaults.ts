import { Experience, GameDataItem, PlayerDataItem } from "./types";

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

export const defaultPlayer: PlayerDataItem = {
    playerId: -1,
    name: '',
    data: ''
}