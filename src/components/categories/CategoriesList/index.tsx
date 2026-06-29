import type { ICategory } from "@/commons/category_types";
import {
    getCategories,
    getCategoriesFiltered,
} from "@/services/category_service";
import { Button } from "primereact/button";
import { DataView } from "primereact/dataview";
import { InputText } from "primereact/inputtext";
import { useCallback, useEffect, useState } from "react";
import { CategoryFormModal } from "../CategoryFormModal";
import { CategoryListTemplate } from "../CategoryListTemplate";

const PAGE_SIZE = 8;

export const CategoriesList = () => {
    const [categories, setCategories] = useState<ICategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [createModalVisible, setCreateModalVisible] = useState(false);

    const fetchCategories = useCallback(async (name = "") => {
        setLoading(true);
        try {
            const data = name.trim()
                ? await getCategoriesFiltered(0, 100, name.trim())
                : await getCategories(0, 100);

            if (data && data.content) {
                setCategories(data.content);
            } else {
                console.error("Formato de dados inválido recebido da API:", data);
                setCategories([]);
            }
        } catch (error) {
            console.error("Erro ao buscar categorias:", error);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleSearch = (value: string) => {
        setSearch(value);
        fetchCategories(value);
    };

    const handleRefresh = () => {
        fetchCategories(search);
    };

    const itemTemplate = (category: ICategory, layout: string) => {
        if (!category) return null;
        const index = categories.indexOf(category);
        if (layout === "list")
            return CategoryListTemplate(category, index, handleRefresh);
        return null;
    };

    const header = (
        <div className="flex flex-column sm:flex-row sm:align-items-center justify-content-between gap-3">
            <span className="p-input-icon-left w-full sm:w-20rem">
                <i className="pi pi-search" />
                <InputText
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Buscar categoria pelo nome"
                    className="w-full"
                />
            </span>
            <Button
                label="Nova Categoria"
                icon="pi pi-plus"
                severity="success"
                onClick={() => setCreateModalVisible(true)}
            />
        </div>
    );

    return (
        <div>
            <CategoryFormModal
                visible={createModalVisible}
                setVisible={setCreateModalVisible}
                onSuccess={handleRefresh}
            />

            <DataView
                value={categories}
                itemTemplate={itemTemplate}
                layout="list"
                header={header}
                paginator
                rows={PAGE_SIZE}
                loading={loading}
                emptyMessage="Nenhuma categoria encontrada"
            />
        </div>
    );
};
