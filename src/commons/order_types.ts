import type { IAddress } from "./address_types";
import type { IPayment } from "./payment_types";
import type { IItem } from "./product_types";

export interface IOrderRequest {
    id?: number;
    paymentId: number;
    address: IAddress;
    orderItems: IItem[];
    shipment: IFreightResponse;
}
export interface IOrderResponse {
    id: number;
    payment: IPayment;
    address: IAddress;
    orderItems: IItem[];
    shipment: IFreightResponse;
    status: string;
}


export interface IFreightRequest {
    to: {
        postal_code: string;
    };
    products: {
        id?: number;
        width?: number;
        height?: number;
        length?: number;
        insurance_value?: number;
        quantity?: number;
    }[];
}

export interface IFreightResponse {
    id: number;
    name: string;
    picture: string;
    price: number;
    currency: string;
    delivery_time: number;
    discount: number;
    company: {
        id: number;
        name: string;
        picture: string
    };
}