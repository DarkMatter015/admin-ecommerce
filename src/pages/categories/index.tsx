import { CategoriesList } from "@/components/categories/CategoriesList";
import { TitlePage } from "@/components/layout/TitlePage";

export const CategoriesPage = () => {
    return (
        <>
            <TitlePage title="Categorias" />
            <div className="categories-page mx-4">
                <p>Gerencie as categorias de produtos</p>
                <CategoriesList />
            </div>
        </>
    );
};
