import type {
    DocumentType,
    IOrderDocument,
} from "@/commons/order_document_types";
import { DOCUMENT_TYPE_OPTIONS } from "@/commons/order_document_types";
import { useToast } from "@/context/hooks/use-toast";
import { ToastSeverity } from "@/context/ToastContext";
import {
    deleteOrderDocument,
    downloadOrderDocument,
    getOrderDocuments,
    uploadOrderDocument,
} from "@/services/order_document_service";
import { formatDate, formatFileSize } from "@/utils/OrderUtils";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import {
    FileUpload,
    type FileUploadHandlerEvent,
} from "primereact/fileupload";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";
import type { TagProps } from "primereact/tag";
import { useEffect, useRef, useState } from "react";

const ACCEPTED = ".pdf,image/png,image/jpeg";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface OrderDocumentsProps {
    orderId: number;
    onDocumentsChange?: (documents: IOrderDocument[]) => void;
}

const documentIcon = (contentType: string) =>
    contentType === "application/pdf" ? "pi pi-file-pdf" : "pi pi-image";

const typeSeverity = (type: DocumentType): TagProps["severity"] => {
    switch (type) {
        case "NOTA_FISCAL":
            return "success";
        case "COMPROVANTE":
            return "info";
        default:
            return null;
    }
};

const typeLabel = (type: DocumentType) =>
    DOCUMENT_TYPE_OPTIONS.find((o) => o.value === type)?.label ?? type;

export const OrderDocuments = ({
    orderId,
    onDocumentsChange,
}: OrderDocumentsProps) => {
    const { showToast, showConfirmDialog } = useToast();
    const fileUploadRef = useRef<FileUpload>(null);
    const [documents, setDocuments] = useState<IOrderDocument[]>([]);
    const [selectedType, setSelectedType] =
        useState<DocumentType>("NOTA_FISCAL");
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const syncDocuments = (docs: IOrderDocument[]) => {
        setDocuments(docs);
        onDocumentsChange?.(docs);
    };

    useEffect(() => {
        let active = true;
        setLoading(true);
        getOrderDocuments(orderId)
            .then((docs) => {
                if (active) syncDocuments(docs);
            })
            .catch(() => {
                if (active)
                    showToast(
                        ToastSeverity.ERROR,
                        "Erro",
                        "Não foi possível carregar os anexos."
                    );
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderId]);

    const handleUpload = async (event: FileUploadHandlerEvent) => {
        const file = event.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const created = await uploadOrderDocument(
                orderId,
                file,
                selectedType
            );
            syncDocuments([created, ...documents]);
            showToast(
                ToastSeverity.SUCCESS,
                "Sucesso",
                "Documento anexado com sucesso."
            );
        } catch (error: any) {
            const message =
                error.response?.data?.message ||
                "Não foi possível anexar o documento.";
            showToast(ToastSeverity.ERROR, "Erro", message);
        } finally {
            setUploading(false);
            fileUploadRef.current?.clear();
        }
    };

    const handleDownload = async (doc: IOrderDocument) => {
        try {
            const blob = await downloadOrderDocument(orderId, doc.id);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = doc.originalName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            showToast(
                ToastSeverity.ERROR,
                "Erro",
                "Não foi possível baixar o documento."
            );
        }
    };

    const handleDelete = (doc: IOrderDocument) => {
        showConfirmDialog(
            "Remover anexo",
            `Deseja remover o documento "${doc.originalName}"?`,
            "pi pi-exclamation-triangle",
            "p-button-danger",
            async () => {
                try {
                    await deleteOrderDocument(orderId, doc.id);
                    syncDocuments(documents.filter((d) => d.id !== doc.id));
                    showToast(
                        ToastSeverity.SUCCESS,
                        "Sucesso",
                        "Documento removido."
                    );
                } catch (error: any) {
                    const message =
                        error.response?.data?.message ||
                        "Não foi possível remover o documento.";
                    showToast(ToastSeverity.ERROR, "Erro", message);
                }
            }
        );
    };

    return (
        <div className="flex flex-column gap-3">
            {/* Controles de upload */}
            <div className="flex flex-column sm:flex-row gap-2 sm:align-items-end">
                <div className="flex flex-column">
                    <label
                        htmlFor="document-type"
                        className="block mb-2 text-sm text-500"
                    >
                        Tipo do documento
                    </label>
                    <Dropdown
                        inputId="document-type"
                        value={selectedType}
                        options={DOCUMENT_TYPE_OPTIONS}
                        optionLabel="label"
                        optionValue="value"
                        onChange={(e) => setSelectedType(e.value)}
                        className="w-full sm:w-12rem"
                        disabled={uploading}
                    />
                </div>
                <FileUpload
                    ref={fileUploadRef}
                    mode="basic"
                    auto
                    customUpload
                    chooseLabel="Anexar arquivo"
                    chooseOptions={{ icon: "pi pi-paperclip" }}
                    accept={ACCEPTED}
                    maxFileSize={MAX_FILE_SIZE}
                    uploadHandler={handleUpload}
                    disabled={uploading}
                />
                {uploading && (
                    <ProgressSpinner
                        style={{ width: "2rem", height: "2rem" }}
                        strokeWidth="4"
                    />
                )}
            </div>
            <small className="text-500">
                Formatos aceitos: PDF, JPG ou PNG (até 10MB).
            </small>

            {/* Lista de anexos */}
            {loading ? (
                <div className="flex align-items-center gap-2 text-500 py-2">
                    <ProgressSpinner
                        style={{ width: "1.5rem", height: "1.5rem" }}
                        strokeWidth="4"
                    />
                    <span>Carregando anexos...</span>
                </div>
            ) : documents.length === 0 ? (
                <div className="flex align-items-center gap-2 text-500 py-3">
                    <i className="pi pi-inbox" />
                    <span>Nenhum documento anexado.</span>
                </div>
            ) : (
                <div className="flex flex-column gap-2">
                    {documents.map((doc) => (
                        <div
                            key={doc.id}
                            className="flex align-items-center gap-3 border-1 surface-border border-round p-2"
                        >
                            <i
                                className={`${documentIcon(
                                    doc.contentType
                                )} text-2xl text-primary`}
                            />
                            <div className="flex flex-column flex-1 gap-1 overflow-hidden">
                                <div className="flex align-items-center gap-2 flex-wrap">
                                    <span
                                        className="font-medium text-900 white-space-nowrap overflow-hidden text-overflow-ellipsis"
                                        title={doc.originalName}
                                    >
                                        {doc.originalName}
                                    </span>
                                    <Tag
                                        value={typeLabel(doc.documentType)}
                                        severity={typeSeverity(
                                            doc.documentType
                                        )}
                                    />
                                </div>
                                <span className="text-500 text-sm">
                                    {formatFileSize(doc.sizeBytes)} •{" "}
                                    {formatDate(doc.createdAt)}
                                    {doc.uploadedByName
                                        ? ` • por ${doc.uploadedByName}`
                                        : ""}
                                </span>
                            </div>
                            <div className="flex gap-1">
                                <Button
                                    icon="pi pi-download"
                                    rounded
                                    text
                                    severity="info"
                                    tooltip="Baixar"
                                    tooltipOptions={{ position: "top" }}
                                    onClick={() => handleDownload(doc)}
                                />
                                <Button
                                    icon="pi pi-trash"
                                    rounded
                                    text
                                    severity="danger"
                                    tooltip="Remover"
                                    tooltipOptions={{ position: "top" }}
                                    onClick={() => handleDelete(doc)}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
