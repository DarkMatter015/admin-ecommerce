import { createContext, useRef, type ReactNode } from "react";

import { Toast } from "primereact/toast";

export enum ToastSeverity {
    SUCCESS = "success",
    INFO = "info",
    WARN = "warn",
    ERROR = "error",
    SECONDARY = "secondary",
    CONTRAST = "contrast",
}

interface ToastContextType {
    showToast: (
        severity: ToastSeverity | undefined,
        summary: string,
        detail: string,
        life?: number,
        stick?: boolean,
    ) => void;
}

interface ToastProviderProps {
    children: ReactNode;
}

const ToastContext = createContext({} as ToastContextType);

export function ToastProvider({ children }: ToastProviderProps) {
    const toast = useRef<Toast | null>(null);

    const showToast = (
        severity: ToastSeverity | undefined,
        summary: string,
        detail: string,
        life?: number,
        stick?: boolean,
    ) => {
        toast.current?.show({
            severity: severity || ToastSeverity.INFO,
            summary: summary,
            detail: detail,
            life: life || 3000,
            sticky: stick || false,
        });
    };

    return (
        <ToastContext
            value={{
                showToast,
            }}
        >
            {children}
            <Toast ref={toast} />
        </ToastContext>
    );
}

export { ToastContext };
