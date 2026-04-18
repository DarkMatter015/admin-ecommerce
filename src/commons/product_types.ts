import type { ICategory } from "./category_types";

export interface IProduct {
    id: number;
    name: string;
    description: string;
    price: number;
    urlImage: string;
    quantityAvailableInStock: number;
    category: ICategory;
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
