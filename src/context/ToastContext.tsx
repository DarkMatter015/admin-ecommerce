import { createContext, useRef, type ReactNode } from "react";

import { confirmDialog, ConfirmDialog } from "primereact/confirmdialog";
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
    showConfirmDialog: (
        header: string,
        message: string,
        icon: string,
        acceptClassName: string,
        onConfirm: () => void,
        onCancel?: () => void,
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
            severity:
                (severity as
                    | "success"
                    | "info"
                    | "warn"
                    | "error"
                    | undefined) || "info",
            summary: summary,
            detail: detail,
            life: life || 3000,
            sticky: stick || false,
        });
    };

    const showConfirmDialog = (
        header: string,
        message: string,
        icon: string,
        acceptClassName: string,
        onConfirm: () => void,
        onCancel?: () => void,
    ) => {
        confirmDialog({
            message: message,
            header: header,
            icon: icon,
            acceptClassName: acceptClassName,
            accept: onConfirm,
            reject: onCancel,
            acceptLabel: "Confirmar",
            rejectLabel: "Cancelar",
        });
    };

    return (
        <ToastContext
            value={{
                showToast,
                showConfirmDialog,
            }}
        >
            {children}
            <Toast ref={toast} />
            <ConfirmDialog />
        </ToastContext>
    );
}

export { ToastContext };
