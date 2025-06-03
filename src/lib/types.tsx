export type DataItem = {
    created_at?: string;
    data?: string;
    description?: string;
    handleClick?: Function;
    id?: number;
    name: string;
    snowflake?: string;
    updated_at?: string;
}

export type GameDataItem = DataItem & {
    roster?: string | null;
};

export type RosterDataItem = DataItem & {
    allow?: string[];
    deny?: string[];
    opt_in?: string[];
    opt_out?: string[];
};

export type SelectedItem = DataItem | GameDataItem | RosterDataItem;

export type Experience = {
    view: string;
    modal: string;
    selected: Record<string, DataItem | SelectedItem> | null;
}
