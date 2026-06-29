
import type { ICategory, ICategoryRequest } from "@/commons/category_types";
import { api } from "@/lib/axios";
import type { IPage, IResponse } from "./types/service_types";

const ROUTE = "/categories";

export const getCategories = async (
    page = 0,
    size = 30
): Promise<IPage<ICategory>> => {
    const { data } = await api.get(`${ROUTE}/page?page=${page}&size=${size}`);
    return data;
};

export const getCategoriesFiltered = async (
    page = 0,
    size = 10,
    name: string
): Promise<IPage<ICategory>> => {
    const searchParam = name ? `&name=${encodeURIComponent(name)}` : "";
    const { data } = await api.get(
        `${ROUTE}/filter?page=${page}&size=${size}${searchParam}`
    );
    return data;
};

export const getCategoryById = async (id: string): Promise<ICategory> => {
    const { data } = await api.get(`${ROUTE}/${id}`);
    return data;
};

// Regra de negócio: name é obrigatório (4-25 caracteres)
export const createCategory = async (
    category: ICategoryRequest
): Promise<ICategory> => {
    const { data } = await api.post(`${ROUTE}`, category);
    return data;
};

// Regra de negócio: name opcional, mas se enviado deve ter 4-25 caracteres
export const updateCategory = async (
    id: number,
    category: ICategoryRequest
): Promise<ICategory> => {
    const { data } = await api.patch(`${ROUTE}/${id}`, category);
    return data;
};

// Exclusão permanente: remove a categoria e seus produtos
export const deleteCategory = async (
    id: number
): Promise<IResponse | void> => {
    return await api.delete(`${ROUTE}/${id}`);
};

// Soft delete: inativa a categoria e seus produtos
export const inactivateCategory = async (
    id: number
): Promise<IResponse | void> => {
    return await api.delete(`${ROUTE}/inactivate/${id}`);
};

// Reativa a categoria e seus produtos
export const activateCategory = async (id: number): Promise<ICategory> => {
    const { data } = await api.post(`${ROUTE}/activate/${id}`);
    return data;
};
