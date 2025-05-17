export type DisplayData = {
    category?: string; // table, turn-order, tourney bracket, etc.
    createdAt?: string;
    description?: string | null;
    handleClick?: Function;
    id?: number | string;
    name: string;
    roster?: string | null;
    updatedAt?: string;
}

export type BasicGame = {
    name: string;
    description?: string | null;
    roster?: number | null;
    gameId: number;
};
