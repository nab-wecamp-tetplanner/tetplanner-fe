export interface Timeline{
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    display_order: number;
    tet_config: {
        id: string;
    }
}

export interface TimelineCreateRequest {
    name: string,
    start_date: string,
    end_date:string,
    display_order: number,
    tet_config_id: string
}