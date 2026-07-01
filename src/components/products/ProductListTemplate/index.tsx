import type { ICategory } from "@/commons/category_types";
import type { IProduct } from "@/commons/product_types";
import { useToast } from "@/context/hooks/use-toast";
import { ToastSeverity } from "@/context/ToastContext";
import {
    activateProduct,
    deleteProduct,
    inactivateProduct,
} from "@/services/product_service";
import { Button } from "primereact/button";
import { Image } from "primereact/image";
import { Tag } from "primereact/tag";
import { classNames } from "primereact/utils";
import { useState } from "react";
import { ProductFormModal } from "../ProductFormModal";

const formatPrice = (price: number) =>
    new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(price);

export const ProductListTemplate = (
    product: IProduct,
    index: number,
    categories: ICategory[],
    onRefresh: () => void,
) => {
    const [editModalVisible, setEditModalVisible] = useState(false);
    const { showConfirmDialog, showToast } = useToast();
    const isActive = product.active ?? true;

    const handleToggleActiveConfirm = async () => {
        try {
            if (isActive) {
                await inactivateProduct(product.id);
                showToast(
                    ToastSeverity.SUCCESS,
                    "Sucesso",
                    "Produto inativado com sucesso!",
                );
            } else {
                await activateProduct(product.id);
                showToast(
                    ToastSeverity.SUCCESS,
                    "Sucesso",
                    "Produto reativado com sucesso!",
                );
            }
            onRefresh();
        } catch (error: any) {
            console.error("Erro ao alterar status do produto:", error);
            const message =
                error.response?.data?.message ||
                "Erro ao alterar o status do produto!";
            showToast(ToastSeverity.ERROR, "Erro", message);
        }
    };

    const handleToggleActive = () => {
        const action = isActive ? "Inativar" : "Reativar";
        showConfirmDialog(
            `${action} Produto`,
            `Deseja ${action.toLowerCase()} o produto "${product.name}"?`,
            "pi pi-exclamation-triangle",
            isActive ? "p-button-warning" : "p-button-success",
            handleToggleActiveConfirm,
            () => {},
        );
    };

    const handleDeleteConfirm = async () => {
        try {
            await deleteProduct(product.id);
            showToast(
                ToastSeverity.SUCCESS,
                "Sucesso",
                "Produto excluído com sucesso!",
            );
            onRefresh();
        } catch (error: any) {
            console.error("Erro ao excluir produto:", error);
            const message =
                error.response?.data?.message || "Erro ao excluir produto!";
            showToast(ToastSeverity.ERROR, "Erro", message);
        }
    };

    const handleDelete = () => {
        // Regra de negócio: exclusão permanente remove o produto
        showConfirmDialog(
            "Excluir Produto",
            `Deseja excluir permanentemente o produto "${product.name}"? Esta ação não pode ser desfeita.`,
            "pi pi-exclamation-triangle",
            "p-button-danger",
            handleDeleteConfirm,
            () => {},
        );
    };

    const stockSeverity =
        product.quantityAvailableInStock === 0
            ? "danger"
            : product.quantityAvailableInStock <= 5
              ? "warning"
              : "info";

    return (
        <>
            <ProductFormModal
                product={product}
                visible={editModalVisible}
                setVisible={setEditModalVisible}
                categories={categories}
                onSuccess={onRefresh}
            />

            <div className="col-12" key={product.id}>
                <div
                    className={classNames(
                        "flex flex-column xl:flex-row xl:align-items-start p-4 gap-4",
                        { "border-top-1 surface-border": index !== 0 },
                    )}
                >
                    <Image
                        imageClassName={classNames(
                            "w-9 h-9 sm:w-16rem sm:h-16rem xl:w-5rem xl:h-5rem shadow-2 block xl:block mx-auto border-round",
                            { "opacity-50": !isActive },
                        )}
                        src={`${product.urlImage}`}
                        alt={product.name}
                    />
                    <div className="flex flex-column sm:flex-row justify-content-between align-items-center flex-1 gap-4">
                        <div className="flex flex-column align-items-center sm:align-items-start gap-3">
                            <div className="flex align-items-center gap-3 flex-row flex-wrap">
                                <span className="text-2xl font-semibold border-1 border-solid text-green-700 px-2 py-1 border-round">
                                    {formatPrice(product.price)}
                                </span>
                                <div className="text-xl font-bold text-900">
                                    {product.name}
                                </div>
                                <Tag
                                    value={isActive ? "Ativo" : "Inativo"}
                                    severity={isActive ? "success" : "danger"}
                                />
                            </div>

                            <div className="flex align-items-center gap-3 flex-wrap">
                                <span className="flex align-items-center gap-2">
                                    <i className="pi pi-tag"></i>
                                    <span className="font-semibold">
                                        {product.category?.name ?? "—"}
                                    </span>
                                </span>
                                <span className="flex align-items-center gap-2">
                                    <i className="pi pi-box"></i>
                                    <Tag
                                        value={`${product.quantityAvailableInStock} em estoque`}
                                        severity={stockSeverity}
                                    ></Tag>
                                </span>
                            </div>
                        </div>
                        <div className="flex align-items-center sm:align-items-end gap-2">
                            <Button
                                onClick={handleToggleActive}
                                outlined
                                severity={isActive ? "warning" : "success"}
                                icon={
                                    isActive ? "pi pi-ban" : "pi pi-check-circle"
                                }
                                tooltip={
                                    isActive
                                        ? "Inativar produto"
                                        : "Reativar produto"
                                }
                                tooltipOptions={{ position: "top" }}
                                className="p-button-rounded"
                            />
                            <Button
                                onClick={() => setEditModalVisible(true)}
                                outlined
                                severity="info"
                                icon="pi pi-pencil"
                                tooltip="Editar produto"
                                tooltipOptions={{ position: "top" }}
                                className="p-button-rounded"
                            />
                            <Button
                                onClick={handleDelete}
                                outlined
                                severity="danger"
                                icon="pi pi-trash"
                                tooltip="Excluir produto"
                                tooltipOptions={{ position: "top" }}
                                className="p-button-rounded"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
