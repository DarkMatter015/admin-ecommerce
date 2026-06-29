import type { ICategory } from "./category_types";

export interface IProductImage {
    id: number;
    url: string;
    position: number;
}

export interface IProduct {
    id: number;
    name: string;
    description: string;
    price: number;
    urlImage: string;
    quantityAvailableInStock: number;
    category: ICategory;
    active?: boolean;
    images?: IProductImage[];
}

export interface IUpdateProduct {
    name?: string;
    description?: string;
    price?: number;
    quantityAvailableInStock?: number;
    categoryId?: number;
}

export interface ICreateProduct {
    name: string;
    description?: string;
    price: number;
    quantityAvailableInStock: number;
    categoryId: number;
}

// Valores padrão para o formulário de criação de produto
export interface IProductForm {
    name: string;
    description: string;
    price: number;
    quantityAvailableInStock: number;
    category: ICategory | null;
}

export interface IItem {
    id?: number;
    product: IProduct;
    totalPrice?: number;
    quantity: number;
}

export class Item implements IItem {
    id?: number;
    product: IProduct;
    quantity: number;
    totalPrice?: number;

    constructor(product: IProduct, quantity: number, id?: number) {
        this.product = product;
        this.quantity = quantity;
        this.id = id;
        this.totalPrice = product.price * quantity;
    }
}
