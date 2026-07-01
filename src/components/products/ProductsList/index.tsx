import type { ICategory } from "@/commons/category_types";
import type { IProduct } from "@/commons/product_types";
import { getCategories } from "@/services/category_service";
import { getProducts, getProductsFiltered } from "@/services/product_service";
import { Button } from "primereact/button";
import { DataView } from "primereact/dataview";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { useCallback, useEffect, useState } from "react";
import { ProductFormModal } from "../ProductFormModal";
import { ProductListTemplate } from "../ProductListTemplate";

const PAGE_SIZE = 5;

export const ProductsList = () => {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<ICategory | null>(null);
    const [createModalVisible, setCreateModalVisible] = useState(false);

    const fetchProducts = useCallback(
        async (name = "", category: ICategory | null = null) => {
            setLoading(true);
            try {
                const hasFilter = !!name.trim() || !!category;
                const data = hasFilter
                    ? await getProductsFiltered(
                          0,
                          100,
                          name.trim() || undefined,
                          category?.name || undefined,
                      )
                    : await getProducts(0, 100);

                if (data && data.content) {
                    setProducts(data.content);
                } else {
                    console.error("Formato de dados inválido da API:", data);
                    setProducts([]);
                }
            } catch (error) {
                console.error("Erro ao buscar produtos:", error);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        },
        [],
    );

    const fetchCategories = useCallback(async () => {
        try {
            const data = await getCategories();
            if (data && data.content) {
                setCategories(data.content);
            }
        } catch (error) {
            console.error("Erro ao buscar categorias:", error);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [fetchProducts, fetchCategories]);

    const handleRefresh = useCallback(() => {
        fetchProducts(search, categoryFilter);
        fetchCategories();
    }, [fetchProducts, fetchCategories, search, categoryFilter]);

    const handleSearch = () => {
        fetchProducts(search, categoryFilter);
    };

    const handleSearchKeyDown = (
        event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (event.key === "Enter") {
            handleSearch();
        }
    };

    const handleCategoryChange = (value: ICategory | null) => {
        setCategoryFilter(value);
        fetchProducts(search, value);
    };

    const handleClearFilters = () => {
        setSearch("");
        setCategoryFilter(null);
        fetchProducts("", null);
    };

    const itemTemplate = (product: IProduct, layout: string) => {
        if (!product) return null;
        const index = products.indexOf(product);
        if (layout === "list")
            return ProductListTemplate(
                product,
                index,
                categories,
                handleRefresh,
            );
        return null;
    };

    const header = (
        <div className="flex flex-column gap-3">
            <div className="flex flex-column sm:flex-row sm:align-items-center justify-content-between gap-3">
                <div className="flex w-full sm:w-auto gap-2">
                    <span className="p-input-icon-left w-full sm:w-20rem">
                        <i className="pi pi-search" />
                        <InputText
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            placeholder="Buscar produto pelo nome"
                            className="w-full"
                        />
                    </span>
                    <Button
                        label="Pesquisar"
                        icon="pi pi-search"
                        onClick={handleSearch}
                    />
                </div>
                <Button
                    label="Novo Produto"
                    icon="pi pi-plus"
                    severity="success"
                    onClick={() => setCreateModalVisible(true)}
                />
            </div>
            <div className="flex flex-column sm:flex-row align-items-center gap-2">
                <Dropdown
                    value={categoryFilter}
                    onChange={(e) => handleCategoryChange(e.value)}
                    options={categories}
                    optionLabel="name"
                    showClear
                    placeholder="Filtrar por categoria"
                    className="w-full sm:w-20rem"
                />
                {(search || categoryFilter) && (
                    <Button
                        label="Limpar filtros"
                        icon="pi pi-filter-slash"
                        text
                        onClick={handleClearFilters}
                    />
                )}
            </div>
        </div>
    );

    return (
        <div>
            <ProductFormModal
                visible={createModalVisible}
                setVisible={setCreateModalVisible}
                categories={categories}
                onSuccess={handleRefresh}
            />

            <DataView
                value={products}
                itemTemplate={itemTemplate}
                layout="list"
                header={header}
                paginator
                rows={PAGE_SIZE}
                loading={loading}
                emptyMessage="Sem produtos disponíveis"
            />
        </div>
    );
};
