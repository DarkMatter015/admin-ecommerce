export interface ICategory {
    id: number;
    name: string;
    active?: boolean;
}

export interface ICategoryRequest {
    name: string;
}