import type { IUserLogin } from "@/commons/auth_types";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { useAuth } from "@/context/hooks/use-auth";
import { useToast } from "@/context/hooks/use-toast";
import { ToastSeverity } from "@/context/ToastContext";
import { login } from "@/services/auth_service";
import { createValidationRules, VALIDATION_RULES } from "@/utils/FormUtils";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { classNames } from "primereact/utils";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

const FORM_DEFAULT_VALUES: IUserLogin = {
    email: "",
    password: "",
};

const NAVIGATION_DELAY = 1000;

export const LoginPage = () => {
    const {
        control,
        handleSubmit,
        formState: { isSubmitting },
    } = useForm<IUserLogin>({
        defaultValues: FORM_DEFAULT_VALUES,
        mode: "all",
    });

    const navigate = useNavigate();

    const { handleLogin } = useAuth();

    const { showToast } = useToast();

    const onSubmitLogin = async (data: IUserLogin) => {
        try {
            const response = await login(data);

            if (response && response.status === 200) {
                const authResponse = response.data;

                handleLogin(authResponse);

                showToast(
                    ToastSeverity.SUCCESS,
                    "Login bem-sucedido",
                    "Seja bem vindo!",
                    1000,
                );

                setTimeout(() => {
                    navigate("/", { replace: true });
                }, NAVIGATION_DELAY);
            } else {
                throw new Error(
                    response?.data?.message ||
                        "Falha ao efetuar login. Verifique suas credenciais e tente novamente",
                );
            }
        } catch (error: any) {
            console.error("Erro durante login:", error);
            const errorMessage =
                error.response?.data?.message ||
                "Falha ao efetuar login. Verifique suas credenciais e tente novamente";
            showToast(ToastSeverity.ERROR, "Erro", errorMessage);
        }
    };

    return (
        <main className="login-page flex align-items-center justify-content-center h-screen w-full">
            <div
                id="login-form-container"
                className="flex flex-column align-items-center bg-primary-reverse justify-content-center p-4 shadow-2 border-round w-10 lg:w-6 xl:w-4"
            >
                <AuthHeader title="Entre na Sua Conta" />

                <form
                    className="p-fluid flex flex-column gap-4"
                    onSubmit={handleSubmit(onSubmitLogin)}
                    autoComplete="on"
                    noValidate
                >
                    <Controller
                        name="email"
                        control={control}
                        rules={VALIDATION_RULES.email}
                        render={({ field, fieldState }) => (
                            <div className="field">
                                <label htmlFor="input-email">Email</label>
                                <div className="p-inputgroup w-full">
                                    <InputText
                                        id="input-email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="exemplo@gmail.com"
                                        maxLength={255}
                                        aria-describedby={`input-email-error`}
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
                                    <span className="p-inputgroup-addon">
                                        <i
                                            className={`pi pi-envelope`}
                                            aria-hidden="true"
                                        ></i>
                                    </span>
                                </div>
                                {fieldState.error && (
                                    <small
                                        id={`input-email-error`}
                                        className="p-error block mt-1"
                                    >
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
                        })}
                        render={({ field, fieldState }) => (
                            <div className="field">
                                <label htmlFor="input-password">Senha</label>
                                <div className="p-inputgroup w-full">
                                    <Password
                                        inputId="input-password"
                                        autoComplete="current-password"
                                        placeholder="******"
                                        aria-describedby={`input-password-error`}
                                        aria-invalid={!!fieldState.error}
                                        feedback={false}
                                        className={classNames("w-full", {
                                            "p-invalid":
                                                fieldState.error ||
                                                fieldState.invalid,
                                            "p-valid":
                                                !fieldState.error &&
                                                !fieldState.invalid &&
                                                field.value.length > 0,
                                        })}
                                        inputClassName="w-full"
                                        toggleMask
                                        promptLabel="Digite uma senha"
                                        {...field}
                                    />
                                    <span className="p-inputgroup-addon">
                                        <i
                                            className="pi pi-lock"
                                            aria-hidden="true"
                                        ></i>
                                    </span>
                                </div>

                                {fieldState.error && (
                                    <small
                                        id={`input-password-error`}
                                        className="p-error block mt-1"
                                    >
                                        {fieldState.error.message}
                                    </small>
                                )}
                            </div>
                        )}
                    />

                    <Button
                        severity="info"
                        type="submit"
                        className="w-full text-1xl form-submit-button"
                        loading={isSubmitting}
                        disabled={isSubmitting}
                        aria-label="Entrar"
                        label="Entrar"
                    />

                    <AuthFooter
                        text="Não tem uma conta?"
                        linkText="Cadastre-se"
                        to="/register"
                    />
                </form>
            </div>
        </main>
    );
};
