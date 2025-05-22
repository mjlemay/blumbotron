export type DataItem = {
    category?: string; // table, turn-order, tourney bracket, etc.
    created_at?: string;
    description?: string | null;
    handleClick?: Function;
    id?: number | string;
    name: string;
    updated_at?: string;
}

export type GameDataItem = DataItem & {
    gameId: number;
    roster?: number | null;
    meta?: string | null;
};

export type RosterDataItem = DataItem & {
    rosterId: number;
    data: string;
};

export type ListItem = {
    id: string;
    name?: string;
    description?: string;
}

export type Experience = {
    view: string;
    modal: string;
    selected: Record<string, ListItem>;
}
