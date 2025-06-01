import { Experience, GameDataItem, PlayerDataItem } from "./types";

export const defaultExperience: Experience = {
    view: 'home',
    modal: 'none',
    selected: {},
}

export const defaultGame: GameDataItem = {
    gameId: -1,
    name: '',
    description: ''
}

export const defaultPlayer: PlayerDataItem = {
    playerId: -1,
    name: '',
    data: ''
}