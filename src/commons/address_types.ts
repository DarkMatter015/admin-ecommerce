export interface IAddress {
    id?: number;
    street?: string;
    number?: string | undefined;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    cep: string;
    active?: boolean;
}