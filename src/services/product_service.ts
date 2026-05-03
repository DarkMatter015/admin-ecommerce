import type { IProduct, IUpdateProduct } from "@/commons/product_types";
import { api } from "@/lib/axios";
import { normalizePage } from "@/utils/ServiceUtils";
import type { IPage } from "./types/service_types";


const ROUTE = "/products";


type ApiProduct = Record<string, any>;

const mapApiToProduct = (item: ApiProduct): IProduct => {
    return {
        id: item.id,
        name: item.name,
        description: item.description || "",
        price: Number(item.price),
        urlImage:
            item.urlImage ||
            "/assets/images/common/unavailable_image_product.png",
        category: item.category,
        quantityAvailableInStock: Number(item.quantityAvailableInStock),
    };
};

export const getProducts = async (
    page = 0,
    size = 30
): Promise<IPage<IProduct>> => {
    const { data } = await api.get(`${ROUTE}/page?page=${page}&size=${size}`);
    return normalizePage(data, mapApiToProduct);
};

export const getProductsFiltered = async (
    page = 0,
    size = 8,
    name: string | undefined,
    category: string | undefined
): Promise<IPage<IProduct>> => {
    const searchParam = category ? `&category=${category}` : "";
    const searchParamName = name ? `&name=${name}` : "";
    const { data } = await api.get(
        `${ROUTE}/filter?page=${page}&size=${size}${searchParamName}${searchParam}`
    );
    return normalizePage(data, mapApiToProduct);
};

export const getProductById = async (id: string): Promise<IProduct> => {
    const idFormated = id.trim().replace(/[^0-9]/g, "");
    const { data } = await api.get(`${ROUTE}/${idFormated}`);
    return mapApiToProduct(data);
};

export const updateProduct = async (id: number, product: IProduct): Promise<IProduct> => {
    const updateProduct: IUpdateProduct = {
        name: product.name,
        description: product.description,
        price: product.price,
        urlImage: product.urlImage,
        quantityAvailableInStock: product.quantityAvailableInStock,
        categoryId: product.category.id,
    };
    const { data } = await api.patch(`${ROUTE}/${id}`, updateProduct);
    return mapApiToProduct(data);
}