import type { ICategory } from "./category_types";

/** Status possíveis de um pedido (espelha tb_order_status no backend). */
export type OrderStatusName =
    | "PENDENTE"
    | "PROCESSANDO"
    | "ENVIADO"
    | "ENTREGUE"
    | "CANCELADO";

export interface IOrderStatus {
    id: number;
    name: string;
}

export interface IOrderProduct {
    id: number;
    name: string;
    description?: string;
    price: number;
    urlImage?: string;
    quantityAvailableInStock?: number;
    category?: ICategory;
}

export interface IOrderItem {
    id: number;
    orderId: number;
    product: IOrderProduct;
    totalPrice: number;
    quantity: number;
}

export interface IOrderAddress {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    cep?: string;
}

export interface IOrderPayment {
    id: number;
    name: string;
}

export interface IOrderCustomer {
    id: number;
    name?: string;
    email?: string;
    cpf?: string;
}

export interface IOrderShipment {
    id?: number;
    name?: string;
    price?: number;
    currency?: string;
    delivery_time?: number;
}

/** Pedido como retornado pelo backend (OrderResponseDTO). */
export interface IOrder {
    id: number;
    data: string;
    userId: number;
    customer: IOrderCustomer | null;
    orderItems: IOrderItem[];
    address: IOrderAddress;
    payment: IOrderPayment | null;
    shipment: IOrderShipment | null;
    status: string;
    statusMessage: string | null;
}

export interface IUpdateOrderStatus {
    statusId: number;
    statusMessage?: string;
}