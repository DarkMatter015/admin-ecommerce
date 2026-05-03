
import type { ICategory } from "@/commons/category_types";
import { api } from "@/lib/axios";
import type { IPage } from "./types/service_types";

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
