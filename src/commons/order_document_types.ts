/** Tipos de documento anexável a um pedido (espelha o enum DocumentType no backend). */
export type DocumentType = "NOTA_FISCAL" | "COMPROVANTE" | "OUTRO";

export interface IOrderDocument {
    id: number;
    orderId: number;
    originalName: string;
    contentType: string;
    sizeBytes: number;
    documentType: DocumentType;
    uploadedByName?: string | null;
    createdAt: string;
}

export const DOCUMENT_TYPE_OPTIONS: { label: string; value: DocumentType }[] = [
    { label: "Nota fiscal", value: "NOTA_FISCAL" },
    { label: "Comprovante", value: "COMPROVANTE" },
    { label: "Outro", value: "OUTRO" },
];

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
    NOTA_FISCAL: "Nota fiscal",
    COMPROVANTE: "Comprovante",
    OUTRO: "Outro",
};
