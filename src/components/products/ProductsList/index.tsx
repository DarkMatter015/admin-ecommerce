import type { ICategory } from "@/commons/category_types";
import type { IProduct } from "@/commons/product_types";
import { getCategories } from "@/services/category_service";
import { getProducts } from "@/services/product_service";
import { DataView } from "primereact/dataview";
import { useCallback, useEffect, useState } from "react";
import { ProductListTemplate } from "../ProductListTemplate";

export const ProductsList = () => {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [categories, setCategories] = useState<ICategory[]>([]);

    const fetchProducts = useCallback(async () => {
        try {
            const data = await getProducts();
            if (data && data.content) {
                setProducts(data.content);
            } else {
                console.error("Invalid data format received from API:", data);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const data = await getCategories();
            if (data && data.content) {
                setCategories(data.content);
            } else {
                console.error("Invalid data format received from API:", data);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [fetchProducts]);

    const itemTemplate = (product: IProduct, layout: string) => {
        if (!product) {
            return;
        }

        if (layout === "list")
            return ProductListTemplate(product, product.id, categories);
    };

    return (
        <div className="">
            <DataView
                value={products}
                itemTemplate={itemTemplate}
                layout="list"
                paginator
                emptyMessage="Sem produtos disponíveis"
                rows={5}
            />
        </div>
    );
};
