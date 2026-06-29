import type { ICategory, ICategoryRequest } from "@/commons/category_types";
import { useToast } from "@/context/hooks/use-toast";
import { ToastSeverity } from "@/context/ToastContext";
import {
    createCategory,
    updateCategory,
} from "@/services/category_service";
import { createValidationRules } from "@/utils/FormUtils";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { classNames } from "primereact/utils";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

interface CategoryFormModalProps {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    // quando informado, o modal funciona em modo edição
    category?: ICategory;
    onSuccess?: () => void;
}

// Regra de negócio do backend (CategoryRequestDTO): name 4-25 caracteres
const NAME_RULES = createValidationRules({
    label: "Nome",
    required: true,
    minLength: 4,
    maxLength: 25,
});

export const CategoryFormModal = ({
    visible,
    setVisible,
    category,
    onSuccess,
}: CategoryFormModalProps) => {
    const { showToast } = useToast();
    const isEditMode = !!category;

    const {
        control,
        handleSubmit,
        reset,
        formState: { isSubmitting, isValid, isDirty },
    } = useForm<ICategoryRequest>({
        defaultValues: { name: category?.name ?? "" },
        mode: "all",
    });

    useEffect(() => {
        if (visible) {
            reset({ name: category?.name ?? "" });
        }
    }, [visible, category, reset]);

    const handleHideModal = () => {
        if (isSubmitting) return;
        setVisible(false);
        reset({ name: category?.name ?? "" });
    };

    const handleSubmitForm = async (data: ICategoryRequest) => {
        const payload: ICategoryRequest = { name: data.name.trim() };

        try {
            if (isEditMode) {
                await updateCategory(category!.id, payload);
                showToast(
                    ToastSeverity.SUCCESS,
                    "Sucesso",
                    "Categoria atualizada com sucesso!",
                );
            } else {
                await createCategory(payload);
                showToast(
                    ToastSeverity.SUCCESS,
                    "Sucesso",
                    "Categoria criada com sucesso!",
                );
            }
            setVisible(false);
            onSuccess?.();
        } catch (error: any) {
            console.error("Erro ao salvar categoria:", error);
            const message =
                error.response?.data?.message ||
                "Erro ao salvar categoria. Tente novamente.";
            showToast(ToastSeverity.ERROR, "Erro", message);
        }
    };

    return (
        <Dialog
            draggable={false}
            header={isEditMode ? "Editar Categoria" : "Nova Categoria"}
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
                        <label htmlFor="input-category-id">ID</label>
                        <div className="p-inputgroup w-full">
                            <InputText
                                id="input-category-id"
                                type="text"
                                disabled
                                className="w-full"
                                value={category!.id.toString()}
                            />
                        </div>
                    </div>
                )}

                <Controller
                    name="name"
                    control={control}
                    rules={NAME_RULES}
                    render={({ field, fieldState }) => (
                        <div className="field">
                            <label htmlFor="input-category-name">Nome</label>
                            <div className="p-inputgroup w-full">
                                <InputText
                                    id="input-category-name"
                                    type="text"
                                    placeholder="Digite o nome da categoria"
                                    minLength={4}
                                    maxLength={25}
                                    aria-describedby="input-category-name-error"
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
                                    id="input-category-name-error"
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
                            (isEditMode && !isDirty)
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
