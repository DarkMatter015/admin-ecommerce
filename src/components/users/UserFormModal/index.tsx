import { ROLES } from "@/commons/roles_types";
import type { IUserForm } from "@/commons/user_types";
import { useToast } from "@/context/hooks/use-toast";
import { ToastSeverity } from "@/context/ToastContext";
import { createUser } from "@/services/user_service";
import { createValidationRules } from "@/utils/FormUtils";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { classNames } from "primereact/utils";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

interface UserFormModalProps {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    onSuccess?: () => void;
}

const ROLE_OPTIONS = [
    { label: "Administrador", value: ROLES.Admin },
    { label: "Cliente", value: ROLES.User },
];

const EMPTY_FORM: IUserForm = {
    displayName: "",
    email: "",
    cpf: "",
    password: "",
    confirmPassword: "",
    role: ROLES.Admin,
};

export const UserFormModal = ({
    visible,
    setVisible,
    onSuccess,
}: UserFormModalProps) => {
    const { showToast } = useToast();

    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState: { isSubmitting, isValid },
    } = useForm<IUserForm>({
        defaultValues: { ...EMPTY_FORM },
        mode: "all",
    });

    const passwordValue = watch("password");

    useEffect(() => {
        if (visible) {
            reset({ ...EMPTY_FORM });
        }
    }, [visible, reset]);

    const handleHideModal = () => {
        if (isSubmitting) return;
        setVisible(false);
        reset({ ...EMPTY_FORM });
    };

    const handleSubmitForm = async (data: IUserForm) => {
        try {
            await createUser({
                displayName: data.displayName.trim(),
                email: data.email.trim().toLowerCase(),
                cpf: data.cpf.replace(/\D/g, ""),
                password: data.password,
                roles: [data.role],
            });

            showToast(
                ToastSeverity.SUCCESS,
                "Sucesso",
                data.role === ROLES.Admin
                    ? "Administrador criado com sucesso!"
                    : "Usuário criado com sucesso!",
            );
            setVisible(false);
            onSuccess?.();
        } catch (error: any) {
            console.error("Erro ao criar usuário:", error);
            const message =
                error.response?.data?.message ||
                "Erro ao criar usuário. Tente novamente.";
            showToast(ToastSeverity.ERROR, "Erro", message);
        }
    };

    return (
        <Dialog
            draggable={false}
            header="Novo Usuário"
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
                <Controller
                    name="role"
                    control={control}
                    rules={{ required: "Perfil é obrigatório" }}
                    render={({ field }) => (
                        <div className="field">
                            <label htmlFor="input-role">Perfil de acesso</label>
                            <Dropdown
                                id="input-role"
                                value={field.value}
                                options={ROLE_OPTIONS}
                                optionLabel="label"
                                optionValue="value"
                                onChange={(e) => field.onChange(e.value)}
                                className="w-full"
                            />
                            <small className="text-500 block mt-1">
                                Apenas administradores podem criar outros
                                administradores.
                            </small>
                        </div>
                    )}
                />

                <Controller
                    name="displayName"
                    control={control}
                    rules={createValidationRules({
                        label: "Nome",
                        required: true,
                        minLength: 3,
                        maxLength: 255,
                    })}
                    render={({ field, fieldState }) => (
                        <div className="field">
                            <label htmlFor="input-displayName">Nome</label>
                            <div className="p-inputgroup w-full">
                                <InputText
                                    id="input-displayName"
                                    type="text"
                                    placeholder="Digite o nome completo"
                                    minLength={3}
                                    maxLength={255}
                                    aria-invalid={!!fieldState.error}
                                    className={classNames("w-full", {
                                        "i-invalid": !!fieldState.error,
                                    })}
                                    {...field}
                                />
                            </div>
                            {fieldState.error && (
                                <small className="p-error block mt-1">
                                    {fieldState.error.message}
                                </small>
                            )}
                        </div>
                    )}
                />

                <Controller
                    name="email"
                    control={control}
                    rules={createValidationRules({
                        label: "Email",
                        required: true,
                        type: "email",
                        maxLength: 255,
                    })}
                    render={({ field, fieldState }) => (
                        <div className="field">
                            <label htmlFor="input-email">Email</label>
                            <div className="p-inputgroup w-full">
                                <InputText
                                    id="input-email"
                                    type="email"
                                    placeholder="exemplo@gmail.com"
                                    maxLength={255}
                                    aria-invalid={!!fieldState.error}
                                    className={classNames("w-full", {
                                        "i-invalid": !!fieldState.error,
                                    })}
                                    {...field}
                                />
                            </div>
                            {fieldState.error && (
                                <small className="p-error block mt-1">
                                    {fieldState.error.message}
                                </small>
                            )}
                        </div>
                    )}
                />

                <Controller
                    name="cpf"
                    control={control}
                    rules={createValidationRules({
                        label: "CPF",
                        required: true,
                        custom: (value: string) =>
                            value.replace(/\D/g, "").length === 11 ||
                            "CPF deve conter 11 dígitos",
                    })}
                    render={({ field, fieldState }) => (
                        <div className="field">
                            <label htmlFor="input-cpf">CPF</label>
                            <div className="p-inputgroup w-full">
                                <InputText
                                    id="input-cpf"
                                    type="text"
                                    placeholder="Somente números"
                                    maxLength={14}
                                    aria-invalid={!!fieldState.error}
                                    className={classNames("w-full", {
                                        "i-invalid": !!fieldState.error,
                                    })}
                                    {...field}
                                />
                            </div>
                            {fieldState.error && (
                                <small className="p-error block mt-1">
                                    {fieldState.error.message}
                                </small>
                            )}
                        </div>
                    )}
                />

                <Controller
                    name="password"
                    control={control}
                    rules={createValidationRules({
                        label: "Senha",
                        required: true,
                        minLength: 6,
                        pattern: {
                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
                            message:
                                "A senha deve conter ao menos uma letra minúscula, uma maiúscula e um número",
                        },
                    })}
                    render={({ field, fieldState }) => (
                        <div className="field">
                            <label htmlFor="input-password">Senha</label>
                            <Password
                                inputId="input-password"
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                onBlur={field.onBlur}
                                toggleMask
                                feedback
                                inputClassName="w-full"
                                className={classNames("w-full", {
                                    "i-invalid": !!fieldState.error,
                                })}
                                promptLabel="Digite uma senha"
                                weakLabel="Fraca"
                                mediumLabel="Média"
                                strongLabel="Forte"
                            />
                            {fieldState.error && (
                                <small className="p-error block mt-1">
                                    {fieldState.error.message}
                                </small>
                            )}
                        </div>
                    )}
                />

                <Controller
                    name="confirmPassword"
                    control={control}
                    rules={{
                        required: "Confirmação de senha é obrigatória",
                        validate: (value: string) =>
                            value === passwordValue ||
                            "As senhas não coincidem",
                    }}
                    render={({ field, fieldState }) => (
                        <div className="field">
                            <label htmlFor="input-confirmPassword">
                                Confirmar senha
                            </label>
                            <Password
                                inputId="input-confirmPassword"
                                value={field.value}
                                onChange={(e) => field.onChange(e.target.value)}
                                onBlur={field.onBlur}
                                toggleMask
                                feedback={false}
                                inputClassName="w-full"
                                className={classNames("w-full", {
                                    "i-invalid": !!fieldState.error,
                                })}
                            />
                            {fieldState.error && (
                                <small className="p-error block mt-1">
                                    {fieldState.error.message}
                                </small>
                            )}
                        </div>
                    )}
                />

                <div className="flex justify-content-end gap-2 mt-3">
                    <Button
                        type="button"
                        label="Cancelar"
                        severity="secondary"
                        outlined
                        disabled={isSubmitting}
                        onClick={handleHideModal}
                    />
                    <Button
                        type="submit"
                        label="Criar"
                        icon="pi pi-check"
                        loading={isSubmitting}
                        disabled={!isValid || isSubmitting}
                    />
                </div>
            </form>
        </Dialog>
    );
};
