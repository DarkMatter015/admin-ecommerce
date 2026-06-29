import type { ICategory } from "@/commons/category_types";
import { useToast } from "@/context/hooks/use-toast";
import { ToastSeverity } from "@/context/ToastContext";
import {
    activateCategory,
    deleteCategory,
    inactivateCategory,
} from "@/services/category_service";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { classNames } from "primereact/utils";
import { useState } from "react";
import { CategoryFormModal } from "../CategoryFormModal";

export const CategoryListTemplate = (
    category: ICategory,
    index: number,
    onRefresh: () => void,
) => {
    const [editModalVisible, setEditModalVisible] = useState(false);
    const { showConfirmDialog, showToast } = useToast();
    const isActive = category.active ?? true;

    const handleToggleActiveConfirm = async () => {
        try {
            if (isActive) {
                await inactivateCategory(category.id);
                showToast(
                    ToastSeverity.SUCCESS,
                    "Sucesso",
                    "Categoria inativada com sucesso!",
                );
            } else {
                await activateCategory(category.id);
                showToast(
                    ToastSeverity.SUCCESS,
                    "Sucesso",
                    "Categoria reativada com sucesso!",
                );
            }
            onRefresh();
        } catch (error: any) {
            console.error("Erro ao alterar status da categoria:", error);
            const message =
                error.response?.data?.message ||
                "Erro ao alterar o status da categoria!";
            showToast(ToastSeverity.ERROR, "Erro", message);
        }
    };

    const handleToggleActive = () => {
        const action = isActive ? "inativar" : "reativar";
        // Regra de negócio: inativar/reativar também afeta os produtos da categoria
        const detail = isActive
            ? `Deseja inativar a categoria "${category.name}"? Os produtos vinculados também serão inativados.`
            : `Deseja reativar a categoria "${category.name}"? Os produtos vinculados também serão reativados.`;

        showConfirmDialog(
            `${action.charAt(0).toUpperCase() + action.slice(1)} Categoria`,
            detail,
            "pi pi-exclamation-triangle",
            isActive ? "p-button-warning" : "p-button-success",
            handleToggleActiveConfirm,
            () => {},
        );
    };

    const handleDeleteConfirm = async () => {
        try {
            await deleteCategory(category.id);
            showToast(
                ToastSeverity.SUCCESS,
                "Sucesso",
                "Categoria excluída com sucesso!",
            );
            onRefresh();
        } catch (error: any) {
            console.error("Erro ao excluir categoria:", error);
            const message =
                error.response?.data?.message || "Erro ao excluir categoria!";
            showToast(ToastSeverity.ERROR, "Erro", message);
        }
    };

    const handleDelete = () => {
        // Regra de negócio: exclusão permanente remove a categoria e seus produtos
        showConfirmDialog(
            "Excluir Categoria",
            `Deseja excluir permanentemente a categoria "${category.name}"? Esta ação removerá os produtos vinculados e não pode ser desfeita.`,
            "pi pi-exclamation-triangle",
            "p-button-danger",
            handleDeleteConfirm,
            () => {},
        );
    };

    return (
        <>
            <CategoryFormModal
                category={category}
                visible={editModalVisible}
                setVisible={setEditModalVisible}
                onSuccess={onRefresh}
            />

            <div className="col-12" key={category.id}>
                <div
                    className={classNames(
                        "flex flex-column sm:flex-row sm:align-items-center justify-content-between p-4 gap-3",
                        { "border-top-1 surface-border": index !== 0 },
                    )}
                >
                    <div className="flex align-items-center gap-3">
                        <i className="pi pi-tag text-xl text-primary"></i>
                        <div className="flex flex-column gap-1">
                            <span className="text-xl font-bold text-900">
                                {category.name}
                            </span>
                            <span className="text-sm text-500">
                                ID: {category.id}
                            </span>
                        </div>
                        <Tag
                            value={isActive ? "Ativa" : "Inativa"}
                            severity={isActive ? "success" : "danger"}
                        />
                    </div>

                    <div className="flex align-items-center gap-2">
                        <Button
                            onClick={handleToggleActive}
                            outlined
                            severity={isActive ? "warning" : "success"}
                            icon={
                                isActive
                                    ? "pi pi-ban"
                                    : "pi pi-check-circle"
                            }
                            tooltip={
                                isActive
                                    ? "Inativar categoria"
                                    : "Reativar categoria"
                            }
                            tooltipOptions={{ position: "top" }}
                            className="p-button-rounded"
                        />
                        <Button
                            onClick={() => setEditModalVisible(true)}
                            outlined
                            severity="info"
                            icon="pi pi-pencil"
                            tooltip="Editar categoria"
                            tooltipOptions={{ position: "top" }}
                            className="p-button-rounded"
                        />
                        <Button
                            onClick={handleDelete}
                            outlined
                            severity="danger"
                            icon="pi pi-trash"
                            tooltip="Excluir categoria"
                            tooltipOptions={{ position: "top" }}
                            className="p-button-rounded"
                        />
                    </div>
                </div>
            </div>
        </>
    );
};
