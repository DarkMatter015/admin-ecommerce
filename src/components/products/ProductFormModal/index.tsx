import type { ICategory } from "@/commons/category_types";
import type {
    IProduct,
    IProductForm,
    IProductImage,
} from "@/commons/product_types";
import { useToast } from "@/context/hooks/use-toast";
import { ToastSeverity } from "@/context/ToastContext";
import {
    createProduct,
    deleteProductImage,
    updateProduct,
    uploadProductImages,
} from "@/services/product_service";
import { createValidationRules } from "@/utils/FormUtils";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { FileUpload, type FileUploadSelectEvent } from "primereact/fileupload";
import { Image } from "primereact/image";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Tag } from "primereact/tag";
import { classNames } from "primereact/utils";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

interface ProductFormModalProps {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    categories: ICategory[];
    // quando informado, o modal funciona em modo edição
    product?: IProduct;
    onSuccess?: () => void;
}

const EMPTY_FORM: IProductForm = {
    name: "",
    description: "",
    price: 0,
    quantityAvailableInStock: 0,
    category: null,
};

export const ProductFormModal = ({
    visible,
    setVisible,
    categories,
    product,
    onSuccess,
}: ProductFormModalProps) => {
    const { showToast } = useToast();
    const isEditMode = !!product;

    const buildDefaults = (): IProductForm =>
        product
            ? {
                  name: product.name,
                  description: product.description,
                  price: product.price,
                  quantityAvailableInStock: product.quantityAvailableInStock,
                  category: product.category,
              }
            : { ...EMPTY_FORM };

    const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(
        product?.category ?? null,
    );

    const [existingImages, setExistingImages] = useState<IProductImage[]>(
        product?.images ?? [],
    );
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [deletingImageId, setDeletingImageId] = useState<number | null>(null);
    const fileUploadRef = useRef<FileUpload>(null);

    const {
        control,
        handleSubmit,
        reset,
        formState: { isSubmitting, isValid, isDirty },
    } = useForm<IProductForm>({
        defaultValues: buildDefaults(),
        mode: "all",
    });

    useEffect(() => {
        if (visible) {
            const defaults = buildDefaults();
            reset(defaults);
            setSelectedCategory(defaults.category);
            setExistingImages(product?.images ?? []);
            setPendingFiles([]);
            fileUploadRef.current?.clear();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, product]);

    const handleHideModal = () => {
        if (isSubmitting) return;
        setVisible(false);
        reset(buildDefaults());
        setSelectedCategory(product?.category ?? null);
        setExistingImages(product?.images ?? []);
        setPendingFiles([]);
        fileUploadRef.current?.clear();
    };

    const handleSelectFiles = (event: FileUploadSelectEvent) => {
        setPendingFiles(Array.from(event.files));
    };

    const handleClearFiles = () => {
        setPendingFiles([]);
    };

    const handleDeleteExistingImage = async (imageId: number) => {
        if (!product) return;
        setDeletingImageId(imageId);
        try {
            await deleteProductImage(product.id, imageId);
            setExistingImages((prev) =>
                prev.filter((image) => image.id !== imageId),
            );
            showToast(
                ToastSeverity.SUCCESS,
                "Sucesso",
                "Imagem removida com sucesso!",
            );
        } catch (error: any) {
            console.error("Erro ao remover imagem:", error);
            const message =
                error.response?.data?.message ||
                "Erro ao remover imagem. Tente novamente.";
            showToast(ToastSeverity.ERROR, "Erro", message);
        } finally {
            setDeletingImageId(null);
        }
    };

    const handleSubmitForm = async (data: IProductForm) => {
        if (!data.category) return;

        const payload: IProduct = {
            id: product?.id ?? 0,
            name: data.name.trim(),
            description: data.description?.trim() ?? "",
            price: data.price,
            urlImage: product?.urlImage ?? "",
            quantityAvailableInStock: data.quantityAvailableInStock,
            category: data.category,
        };

        try {
            if (isEditMode) {
                await updateProduct(product!.id, payload);
                if (pendingFiles.length > 0) {
                    await uploadProductImages(product!.id, pendingFiles);
                }
                showToast(
                    ToastSeverity.SUCCESS,
                    "Sucesso",
                    "Produto editado com sucesso!",
                );
            } else {
                const created = await createProduct(payload);
                if (pendingFiles.length > 0) {
                    await uploadProductImages(created.id, pendingFiles);
                }
                showToast(
                    ToastSeverity.SUCCESS,
                    "Sucesso",
                    "Produto criado com sucesso!",
                );
            }
            setVisible(false);
            onSuccess?.();
        } catch (error: any) {
            console.error("Erro ao salvar produto:", error);
            const message =
                error.response?.data?.message ||
                "Erro ao salvar produto. Tente novamente.";
            showToast(ToastSeverity.ERROR, "Erro", message);
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
            header={isEditMode ? "Editar Produto" : "Novo Produto"}
            visible={visible}
            className="w-30rem"
            onHide={() => {
                if (!visible) return;
                handleHideModal();
            }}
        >
            <form
                className="flex flex-column gap-2"
                onSubmit={handleSubmit(handleSubmitForm)}
                noValidate
            >
                {isEditMode && (
                    <div className="field">
                        <label htmlFor="input-id">ID</label>
                        <div className="p-inputgroup w-full">
                            <InputText
                                id="input-id"
                                type="text"
                                disabled
                                className="w-full"
                                value={product!.id.toString()}
                            />
                        </div>
                    </div>
                )}

                <Controller
                    name="name"
                    control={control}
                    rules={createValidationRules({
                        label: "Nome",
                        required: true,
                        minLength: 2,
                        maxLength: 255,
                    })}
                    render={({ field, fieldState }) => (
                        <div className="field">
                            <label htmlFor="input-name">Nome</label>
                            <div className="p-inputgroup w-full">
                                <InputText
                                    id="input-name"
                                    type="text"
                                    placeholder="Digite o nome do produto"
                                    minLength={2}
                                    maxLength={255}
                                    aria-describedby="input-name-error"
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
                                    id="input-name-error"
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
                        maxLength: 255,
                    })}
                    render={({ field, fieldState }) => (
                        <div className="field">
                            <label htmlFor="input-description">
                                Descrição{" "}
                                <span className="text-500 text-sm">
                                    (opcional)
                                </span>
                            </label>
                            <div className="p-inputgroup w-full">
                                <InputTextarea
                                    id="input-description"
                                    placeholder="Digite a descrição do produto"
                                    maxLength={255}
                                    aria-describedby="input-description-error"
                                    aria-invalid={!!fieldState.error}
                                    className={classNames("w-full min-h-full", {
                                        "i-invalid":
                                            fieldState.error ||
                                            fieldState.invalid,
                                        "i-valid":
                                            !fieldState.error &&
                                            !fieldState.invalid &&
                                            (field.value?.length ?? 0) > 0,
                                    })}
                                    {...field}
                                />
                            </div>
                            {fieldState.error && (
                                <small
                                    id="input-description-error"
                                    className="p-error block mt-1"
                                >
                                    {fieldState.error.message}
                                </small>
                            )}
                        </div>
                    )}
                />

                <div className="field">
                    <label htmlFor="input-images">
                        Imagens{" "}
                        <span className="text-500 text-sm">(opcional)</span>
                    </label>

                    {existingImages.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                            {existingImages.map((image) => (
                                <div
                                    key={image.id}
                                    className="relative border-round overflow-hidden border-1 surface-border"
                                    style={{ width: "5rem", height: "5rem" }}
                                >
                                    <Image
                                        src={image.url}
                                        alt="Imagem do produto"
                                        imageStyle={{
                                            width: "5rem",
                                            height: "5rem",
                                            objectFit: "cover",
                                        }}
                                        preview
                                    />
                                    <Button
                                        type="button"
                                        icon="pi pi-times"
                                        rounded
                                        text
                                        severity="danger"
                                        className="absolute"
                                        style={{ top: 0, right: 0 }}
                                        aria-label="Remover imagem"
                                        loading={deletingImageId === image.id}
                                        disabled={
                                            isSubmitting ||
                                            deletingImageId !== null
                                        }
                                        onClick={() =>
                                            handleDeleteExistingImage(image.id)
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    <FileUpload
                        ref={fileUploadRef}
                        id="input-images"
                        name="files"
                        multiple
                        accept="image/*"
                        maxFileSize={10000000}
                        auto={false}
                        customUpload
                        mode="advanced"
                        chooseLabel="Selecionar imagens"
                        uploadOptions={{ className: "hidden" }}
                        cancelLabel="Limpar"
                        disabled={isSubmitting}
                        onSelect={handleSelectFiles}
                        onClear={handleClearFiles}
                        emptyTemplate={
                            <p className="m-0 text-500">
                                Arraste imagens aqui ou clique em "Selecionar
                                imagens".
                            </p>
                        }
                    />
                </div>

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
                                    onValueChange={(e) => field.onChange(e.value)}
                                    onBlur={field.onBlur}
                                    mode="currency"
                                    currency="BRL"
                                    locale="pt-BR"
                                    minFractionDigits={2}
                                    maxFractionDigits={2}
                                    min={0.01}
                                    aria-describedby="input-price-error"
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
                                    id="input-price-error"
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
                                    placeholder="Digite a quantidade disponível"
                                    value={field.value}
                                    onValueChange={(e) => field.onChange(e.value)}
                                    onBlur={field.onBlur}
                                    mode="decimal"
                                    minFractionDigits={0}
                                    maxFractionDigits={0}
                                    min={0}
                                    showButtons
                                    aria-describedby="input-quantityAvailableInStock-error"
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
                                    id="input-quantityAvailableInStock-error"
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
                                    aria-describedby="input-category-error"
                                    aria-invalid={!!fieldState.error}
                                    panelClassName="rh-dropdown-panel"
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
                                    id="input-category-error"
                                    className="p-error block mt-1"
                                >
                                    {fieldState.error.message}
                                </small>
                            )}
                        </div>
                    )}
                />

                <div className="flex flex-column gap-3 mt-2">
                    <Button
                        type="submit"
                        severity="success"
                        label="Salvar"
                        disabled={
                            isSubmitting ||
                            !isValid ||
                            (isEditMode &&
                                !isDirty &&
                                pendingFiles.length === 0)
                        }
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
