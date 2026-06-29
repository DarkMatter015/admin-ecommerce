import type {
    IOrder,
    IOrderStatus,
    IUpdateOrderStatus,
} from "@/commons/order_types";
import { api } from "@/lib/axios";
import { normalizePage } from "@/utils/ServiceUtils";
import type { IPage } from "./types/service_types";

const ROUTE = "/orders";

type ApiOrder = Record<string, any>;

const mapApiToOrder = (item: ApiOrder): IOrder => {
    return {
        id: item.id,
        data: item.data,
        userId: item.userId,
        customer: item.customer
            ? {
                  id: item.customer.id,
                  name: item.customer.name ?? "",
                  email: item.customer.email ?? "",
                  cpf: item.customer.cpf ?? "",
              }
            : null,
        orderItems: (item.orderItems ?? []).map((orderItem: ApiOrder) => ({
            id: orderItem.id,
            orderId: orderItem.orderId,
            quantity: Number(orderItem.quantity ?? 0),
            totalPrice: Number(orderItem.totalPrice ?? 0),
            product: {
                id: orderItem.product?.id,
                name: orderItem.product?.name ?? "",
                description: orderItem.product?.description ?? "",
                price: Number(orderItem.product?.price ?? 0),
                urlImage: orderItem.product?.urlImage,
                quantityAvailableInStock:
                    orderItem.product?.quantityAvailableInStock,
                category: orderItem.product?.category,
            },
        })),
        address: item.address ?? {},
        payment: item.payment ?? null,
        shipment: item.shipment ?? null,
        status: item.status ?? "",
        statusMessage: item.statusMessage ?? null,
    };
};

export const getOrders = async (
    page = 0,
    size = 10,
    order = "data",
    asc = false
): Promise<IPage<IOrder>> => {
    const { data } = await api.get(
        `${ROUTE}/page?page=${page}&size=${size}&order=${order}&asc=${asc}`
    );
    return normalizePage(data, mapApiToOrder);
};

export const getOrderById = async (id: number): Promise<IOrder> => {
    const { data } = await api.get(`${ROUTE}/${id}`);
    return mapApiToOrder(data);
};

export const getOrderStatuses = async (): Promise<IOrderStatus[]> => {
    const { data } = await api.get(`${ROUTE}/statuses`);
    return data as IOrderStatus[];
};

export const updateOrderStatus = async (
    id: number,
    payload: IUpdateOrderStatus
): Promise<IOrder> => {
    const { data } = await api.patch(`${ROUTE}/${id}/status`, payload);
    return mapApiToOrder(data);
};
