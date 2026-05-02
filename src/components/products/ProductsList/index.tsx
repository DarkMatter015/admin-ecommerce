import type { IProduct } from "@/commons/product_types";
import { getProducts } from "@/services/product_service";
import { DataView, DataViewLayoutOptions } from "primereact/dataview";
import { useCallback, useEffect, useState } from "react";
import { ProductListTemplate } from "../ProductListTemplate";

export const ProductsList = () => {
    const [products, setProducts] = useState<IProduct[]>([]);

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

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const itemTemplate = (product: IProduct, layout: string) => {
        if (!product) {
            return;
        }

        if (layout === 'list') return ProductListTemplate(product, product.id);
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
