import type { ICategory } from "@/commons/category_types";
import type { IProduct } from "@/commons/product_types";
import { useToast } from "@/context/hooks/use-toast";
import { ToastSeverity } from "@/context/ToastContext";
import { updateProduct } from "@/services/product_service";
import { createValidationRules, VALIDATION_RULES } from "@/utils/FormUtils";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Tag } from "primereact/tag";
import { classNames } from "primereact/utils";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

export const EditProductModal = ({
    visible,
    setVisible,
    product,
    categories,
}: {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    product: IProduct;
    categories: ICategory[];
}) => {
    const [selectedCategory, setSelectedCategory] = useState(product.category);
    const { showToast } = useToast();

    const DEFAULT_VALUES: IProduct = {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        urlImage: product.urlImage,
        category: product.category,
        quantityAvailableInStock: product.quantityAvailableInStock,
    };

    const {
        control,
        handleSubmit,
        reset,
        formState: { isSubmitting, isValid, isDirty },
    } = useForm<IProduct>({
        defaultValues: DEFAULT_VALUES,
        mode: "all",
    });

    const handleHideModal = () => {
        if (isSubmitting) return;
        setVisible(false);
        setSelectedCategory(product.category);
        reset();
    };

    const handleSubmitEdit = async (data: IProduct) => {
        console.log("Dados do formulário:", data);
        try {
            const response = await updateProduct(product.id, {
                ...data,
                category: selectedCategory,
            });

            console.log("Resposta da API:", response);

            showToast(
                ToastSeverity.SUCCESS,
                "Sucesso",
                "Produto editado com sucesso!",
            );
            setVisible(false);
        } catch (error) {
            console.error("Erro ao editar produto:", error);
            showToast(ToastSeverity.ERROR, "Erro", "Erro ao editar produto.");
        }
    };

    const panelFooterTemplate = () => {
        return (
            <div className="py-2 px-3">
                {selectedCategory ? (
                    <span>
                        <b>{selectedCategory.name}</b> selecionada.
                    </span>
                ) : (
                    "Nenhuma categoria selecionada."
                )}
            </div>
        );
    };

    return (
        <Dialog
            draggable={false}
            header="Editar Produto"
            visible={visible}
            className="w-30rem"
            onHide={() => {
                if (!visible) return;
                handleHideModal();
            }}
        >
            <form
                className="flex flex-column gap-2"
                onSubmit={handleSubmit(handleSubmitEdit)}
                noValidate
            >
                <div className="field">
                    <label htmlFor="input-id">ID</label>
                    <div className="p-inputgroup w-full">
                        <InputText
                            id="input-id"
                            type="text"
                            disabled
                            className={"w-full"}
                            value={product.id.toString()}
                        />
                    </div>
                </div>

                <Controller
                    name="name"
                    control={control}
                    rules={VALIDATION_RULES.displayName}
                    render={({ field, fieldState }) => (
                        <div className="field">
                            <label htmlFor="input-name">Nome</label>
                            <div className="p-inputgroup w-full">
                                <InputText
                                    id="input-name"
                                    type="text"
                                    autoComplete="name"
                                    placeholder="Digite o nome do produto"
                                    maxLength={255}
                                    aria-describedby={`input-name-error`}
                                    aria-invalid={!!fieldState.error}
                                    className={classNames("w-full", {
                                        "i-invalid":
                                            fieldState.error ||
                                            fieldState.invalid,
                                        "i-valid":
                                            !fieldState.error &&
                                            !fieldState.invalid &&
                                            field.value?.length > 0,
                                    })}
                                    {...field}
                                />
                            </div>
                            {fieldState.error && (
                                <small
                                    id={`input-name-error`}
                                    className="p-error block mt-1"
                                >
                                    {fieldState.error.message}
                                </small>
                            )}
                        </div>
                    )}
                />

                <Controller
                    name="description"
                    control={control}
                    rules={createValidationRules({
                        label: "Descrição",
                        required: true,
                        minLength: 10,
                        maxLength: 255,
                    })}
                    render={({ field, fieldState }) => (
                        <div className="field">
                            <label htmlFor="input-description">Descrição</label>
                            <div className="p-inputgroup w-full">
                                <InputTextarea
                                    id="input-description"
                                    autoComplete="name"
                                    placeholder="Digite a descrição do produto"
                                    maxLength={255}
                                    aria-describedby={`input-description-error`}
                                    aria-invalid={!!fieldState.error}
                                    className={classNames("w-full min-h-full", {
                                        "i-invalid":
                                            fieldState.error ||
                                            fieldState.invalid,
                                        "i-valid":
                                            !fieldState.error &&
                                            !fieldState.invalid &&
                                            field.value?.length > 0,
                                    })}
                                    {...field}
                                />
                            </div>
                            {fieldState.error && (
                                <small
                                    id={`input-description-error`}
                                    className="p-error block mt-1"
                                >
                                    {fieldState.error.message}
                                </small>
                            )}
                        </div>
                    )}
                />

                <Controller
                    name="price"
                    control={control}
                    rules={createValidationRules({
                        label: "Preço",
                        required: true,
                        min: 0.01,
                    })}
                    render={({ field, fieldState }) => (
                        <div className="field">
                            <label htmlFor="input-price">Preço</label>
                            <div className="p-inputgroup w-full">
                                <InputNumber
                                    id="input-price"
                                    placeholder="Digite o preço do produto"
                                    value={field.value}
                                    onValueChange={(e) =>
                                        field.onChange(e.value)
                                    }
                                    onBlur={field.onBlur}
                                    mode="currency"
                                    currency="BRL"
                                    minFractionDigits={2}
                                    maxFractionDigits={2}
                                    min={0.01}
                                    aria-describedby={`input-price-error`}
                                    aria-invalid={!!fieldState.error}
                                    className={classNames("w-full", {
                                        "i-invalid":
                                            fieldState.error ||
                                            fieldState.invalid,
                                        "i-valid":
                                            !fieldState.error &&
                                            !fieldState.invalid &&
                                            field.value > 0,
                                    })}
                                />
                            </div>
                            {fieldState.error && (
                                <small
                                    id={`input-price-error`}
                                    className="p-error block mt-1"
                                >
                                    {fieldState.error.message}
                                </small>
                            )}
                        </div>
                    )}
                />

                <Controller
                    name="quantityAvailableInStock"
                    control={control}
                    rules={createValidationRules({
                        label: "Quantidade em Estoque",
                        required: true,
                        min: 0,
                        type: "numeric",
                    })}
                    render={({ field, fieldState }) => (
                        <div className="field">
                            <label htmlFor="input-quantityAvailableInStock">
                                Quantidade em Estoque
                            </label>
                            <div className="p-inputgroup w-full">
                                <InputNumber
                                    id="input-quantityAvailableInStock"
                                    placeholder="Digite a quantidade disponível em estoque"
                                    value={field.value}
                                    onValueChange={(e) =>
                                        field.onChange(e.value)
                                    }
                                    onBlur={field.onBlur}
                                    mode="decimal"
                                    minFractionDigits={0}
                                    maxFractionDigits={0}
                                    min={0}
                                    aria-describedby={`input-quantityAvailableInStock-error`}
                                    aria-invalid={!!fieldState.error}
                                    className={classNames("w-full", {
                                        "i-invalid":
                                            fieldState.error ||
                                            fieldState.invalid,
                                        "i-valid":
                                            !fieldState.error &&
                                            !fieldState.invalid &&
                                            field.value >= 0,
                                    })}
                                />
                            </div>
                            {fieldState.error && (
                                <small
                                    id={`input-quantityAvailableInStock-error`}
                                    className="p-error block mt-1"
                                >
                                    {fieldState.error.message}
                                </small>
                            )}
                        </div>
                    )}
                />

                <Controller
                    name="category"
                    control={control}
                    rules={createValidationRules({
                        label: "Categoria",
                        required: true,
                    })}
                    render={({ field, fieldState }) => (
                        <div className="field">
                            <label htmlFor="input-category">Categoria</label>
                            <div className="p-inputgroup w-full">
                                <Dropdown
                                    id="input-category"
                                    value={selectedCategory}
                                    onChange={(e) => {
                                        setSelectedCategory(e.value);
                                        field.onChange(e.value);
                                    }}
                                    onBlur={field.onBlur}
                                    options={categories}
                                    optionLabel="name"
                                    emptyMessage="Nenhuma categoria disponível"
                                    placeholder="Selecione uma categoria"
                                    aria-describedby={`input-category-error`}
                                    aria-invalid={!!fieldState.error}
                                    panelClassName="bg-primary-reverse"
                                    className="w-full"
                                    itemTemplate={(option) => (
                                        <div className="flex align-items-center gap-2">
                                            <i className="pi pi-tag"></i>
                                            <div className="w-full flex justify-content-between">
                                                <span>{option.name}</span>
                                                <Tag
                                                    className="align-content-end"
                                                    value={
                                                        option.active
                                                            ? "Ativo"
                                                            : "Inativo"
                                                    }
                                                    severity={
                                                        option.active
                                                            ? "success"
                                                            : "danger"
                                                    }
                                                ></Tag>
                                            </div>
                                        </div>
                                    )}
                                    panelFooterTemplate={panelFooterTemplate}
                                />
                            </div>
                            {fieldState.error && (
                                <small
                                    id={`input-category-error`}
                                    className="p-error block mt-1"
                                >
                                    {fieldState.error.message}
                                </small>
                            )}
                        </div>
                    )}
                />

                <div className="flex flex-column gap-3">
                    <Button
                        type="submit"
                        severity="success"
                        label="Salvar"
                        disabled={isSubmitting || !isValid || !isDirty}
                        loading={isSubmitting}
                    />
                    <Button
                        type="reset"
                        severity="secondary"
                        outlined
                        label="Cancelar"
                        onClick={handleHideModal}
                        disabled={isSubmitting}
                    />
                </div>
            </form>
        </Dialog>
    );
};
