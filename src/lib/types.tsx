export type DisplayData = {
    category?: string; // table, turn-order, tourney bracket, etc.
    createdAt?: string;
    description?: string;
    handleClick?: Function;
    id?: number | string;
    name: string;
    roster?: string;
    updatedAt?: string;
}