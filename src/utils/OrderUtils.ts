import type { TagProps } from "primereact/tag";

/** Mapeia o status do pedido para a severidade visual de um Tag do PrimeReact. */
export const getStatusSeverity = (status: string): TagProps["severity"] => {
    switch (status?.toUpperCase()) {
        case "ENTREGUE":
            return "success";
        case "ENVIADO":
            return "info";
        case "PROCESSANDO":
            return "warning";
        case "CANCELADO":
            return "danger";
        case "PENDENTE":
        default:
            return null;
    }
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});

export const formatCurrency = (value?: number | null): string => {
    return currencyFormatter.format(Number(value ?? 0));
};

export const formatDate = (value?: string | null): string => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const getOrderTotal = (
    orderItems: { totalPrice?: number }[]
): number => {
    return orderItems.reduce(
        (acc, item) => acc + Number(item.totalPrice ?? 0),
        0
    );
};

export const formatCpf = (cpf?: string | null): string => {
    if (!cpf) return "-";
    const digits = cpf.replace(/\D/g, "");
    if (digits.length !== 11) return cpf;
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

export const formatCep = (cep?: string | null): string => {
    if (!cep) return "";
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return cep;
    return digits.replace(/(\d{5})(\d{3})/, "$1-$2");
};

export const getCustomerName = (customer?: {
    name?: string;
} | null): string => {
    return customer?.name?.trim() || "Cliente";
};

const PRODUCT_IMAGE_FALLBACK = "/images/logo/logo_riffhouse_white.png";

export const resolveProductImage = (urlImage?: string | null): string => {
    return urlImage && urlImage.trim().length > 0
        ? urlImage
        : PRODUCT_IMAGE_FALLBACK;
};

export const formatFileSize = (bytes?: number | null): string => {
    const value = Number(bytes ?? 0);
    if (value <= 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const exponent = Math.min(
        Math.floor(Math.log(value) / Math.log(1024)),
        units.length - 1
    );
    const size = value / Math.pow(1024, exponent);
    return `${size.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
};
