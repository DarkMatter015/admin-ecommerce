import { TitlePage } from "@/components/layout/TitlePage";
import { ProductsList } from "@/components/products/ProductsList";

export const ProductsPage = () => {
    return (
        <>
            <TitlePage title="Produtos" />
            <div className="products-page mx-4">
                <p>Lista de produtos</p>
                <ProductsList />
            </div>
        </>
    );
};
