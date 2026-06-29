import type { IUserLogin } from "@/commons/auth_types";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { useAuth } from "@/context/hooks/use-auth";
import { useToast } from "@/context/hooks/use-toast";
import { ToastSeverity } from "@/context/ToastContext";
import { login } from "@/services/auth_service";
import { createValidationRules, VALIDATION_RULES } from "@/utils/FormUtils";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { classNames } from "primereact/utils";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";

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

    const [capsLockOn, setCapsLockOn] = useState(false);

    const handleCapsLock = (event: React.KeyboardEvent<HTMLInputElement>) => {
        setCapsLockOn(event.getModifierState?.("CapsLock") ?? false);
    };

    const onSubmitLogin = async (data: IUserLogin) => {
        try {
            const payload: IUserLogin = {
                email: data.email.trim().toLowerCase(),
                password: data.password,
            };

            const response = await login(payload);

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
        <main className="login-page flex align-items-center justify-content-center p-4">
            <section
                id="login-form-container"
                className="login-card flex flex-column align-items-center"
                aria-labelledby="login-title"
            >
                <header className="text-center mb-4">
                    <img
                        src="/images/logo/logo_riffhouse_white.png"
                        alt="Logo Riff House"
                        className="login-logo mb-3"
                    />
                    <h1 id="login-title" className="login-title">
                        Entre na Sua Conta
                    </h1>
                    <p className="login-subtitle">
                        Acesse o painel administrativo da Riff House
                    </p>
                </header>

                <form
                    className="p-fluid flex flex-column gap-3 w-full"
                    onSubmit={handleSubmit(onSubmitLogin)}
                    autoComplete="on"
                    noValidate
                >
                    <Controller
                        name="email"
                        control={control}
                        rules={VALIDATION_RULES.email}
                        render={({ field, fieldState }) => {
                            const isValid =
                                !fieldState.error &&
                                fieldState.isDirty &&
                                (field.value?.length ?? 0) > 0;

                            return (
                                <div className="field m-0">
                                    <label htmlFor="input-email">Email</label>
                                    <div className="p-inputgroup w-full">
                                        <InputText
                                            id="input-email"
                                            type="email"
                                            autoComplete="email"
                                            placeholder="exemplo@gmail.com"
                                            maxLength={255}
                                            aria-describedby="input-email-error"
                                            aria-invalid={!!fieldState.error}
                                            className={classNames("w-full", {
                                                "i-invalid": !!fieldState.error,
                                                "i-valid": isValid,
                                            })}
                                            {...field}
                                        />
                                        <span className="p-inputgroup-addon">
                                            <i
                                                className={classNames(
                                                    "pi field-icon",
                                                    {
                                                        "pi-check-circle is-valid":
                                                            isValid,
                                                        "pi-times-circle is-invalid":
                                                            !!fieldState.error,
                                                        "pi-envelope":
                                                            !isValid &&
                                                            !fieldState.error,
                                                    },
                                                )}
                                                aria-hidden="true"
                                            ></i>
                                        </span>
                                    </div>
                                    {fieldState.error && (
                                        <small
                                            id="input-email-error"
                                            className="login-error"
                                            role="alert"
                                        >
                                            <i
                                                className="pi pi-exclamation-circle"
                                                aria-hidden="true"
                                            ></i>
                                            {fieldState.error.message}
                                        </small>
                                    )}
                                </div>
                            );
                        }}
                    />

                    <Controller
                        name="password"
                        control={control}
                        rules={createValidationRules({
                            label: "Senha",
                            required: true,
                            minLength: 6,
                        })}
                        render={({ field, fieldState }) => {
                            const isValid =
                                !fieldState.error &&
                                fieldState.isDirty &&
                                (field.value?.length ?? 0) > 0;

                            return (
                                <div className="field m-0">
                                    <label htmlFor="input-password">
                                        Senha
                                    </label>
                                    <div className="p-inputgroup w-full">
                                        <Password
                                            inputId="input-password"
                                            autoComplete="current-password"
                                            placeholder="******"
                                            aria-describedby="input-password-error"
                                            aria-invalid={!!fieldState.error}
                                            feedback={false}
                                            className={classNames("w-full", {
                                                "p-invalid": !!fieldState.error,
                                                "p-valid": isValid,
                                            })}
                                            inputClassName="w-full"
                                            toggleMask
                                            onKeyUp={handleCapsLock}
                                            onKeyDown={handleCapsLock}
                                            {...field}
                                        />
                                        <span className="p-inputgroup-addon">
                                            <i
                                                className={classNames(
                                                    "pi field-icon",
                                                    {
                                                        "pi-check-circle is-valid":
                                                            isValid,
                                                        "pi-times-circle is-invalid":
                                                            !!fieldState.error,
                                                        "pi-lock":
                                                            !isValid &&
                                                            !fieldState.error,
                                                    },
                                                )}
                                                aria-hidden="true"
                                            ></i>
                                        </span>
                                    </div>

                                    {capsLockOn && !fieldState.error && (
                                        <small
                                            className="login-hint"
                                            role="status"
                                        >
                                            <i
                                                className="pi pi-info-circle"
                                                aria-hidden="true"
                                            ></i>
                                            Caps Lock está ativado
                                        </small>
                                    )}

                                    {fieldState.error && (
                                        <small
                                            id="input-password-error"
                                            className="login-error"
                                            role="alert"
                                        >
                                            <i
                                                className="pi pi-exclamation-circle"
                                                aria-hidden="true"
                                            ></i>
                                            {fieldState.error.message}
                                        </small>
                                    )}
                                </div>
                            );
                        }}
                    />

                    <Button
                        severity="info"
                        type="submit"
                        className="w-full login-submit-button"
                        loading={isSubmitting}
                        disabled={isSubmitting}
                        aria-label="Entrar"
                        label={isSubmitting ? "Entrando..." : "Entrar"}
                    />
                </form>
            </section>
        </main>
    );
};
