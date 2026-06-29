import type {
    DocumentType,
    IOrderDocument,
} from "@/commons/order_document_types";
import { api } from "@/lib/axios";

const route = (orderId: number) => `/orders/${orderId}/documents`;

export const getOrderDocuments = async (
    orderId: number
): Promise<IOrderDocument[]> => {
    const { data } = await api.get(route(orderId));
    return data as IOrderDocument[];
};

export const uploadOrderDocument = async (
    orderId: number,
    file: File,
    type: DocumentType
): Promise<IOrderDocument> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const { data } = await api.post(route(orderId), formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data as IOrderDocument;
};

export const downloadOrderDocument = async (
    orderId: number,
    documentId: number
): Promise<Blob> => {
    const { data } = await api.get(
        `${route(orderId)}/${documentId}/download`,
        { responseType: "blob" }
    );
    return data as Blob;
};

export const deleteOrderDocument = async (
    orderId: number,
    documentId: number
): Promise<void> => {
    await api.delete(`${route(orderId)}/${documentId}`);
};
