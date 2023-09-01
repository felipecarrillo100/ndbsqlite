export interface QueryResult<C> {
    total: number;
    matches: number;
    group?: number;
    items: C;
}

export interface QueryInputs {
    group?: number | string;
    search?: string;
    limit?: number;
    offset?: number;
    sortBy?: string;
    asc?: boolean;
}
