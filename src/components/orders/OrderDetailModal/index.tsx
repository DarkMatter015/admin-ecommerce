import type { IOrder, IOrderStatus } from "@/commons/order_types";
import type { IOrderDocument } from "@/commons/order_document_types";
import { useToast } from "@/context/hooks/use-toast";
import { ToastSeverity } from "@/context/ToastContext";
import { updateOrderStatus } from "@/services/order_service";
import {
    formatCep,
    formatCpf,
    formatCurrency,
    formatDate,
    getCustomerName,
    getOrderTotal,
    getStatusSeverity,
    resolveProductImage,
} from "@/utils/OrderUtils";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { Tag } from "primereact/tag";
import { useEffect, useState, type ReactNode } from "react";
import { OrderDocuments } from "../OrderDocuments";

interface OrderDetailModalProps {
    visible: boolean;
    onHide: () => void;
    order: IOrder | null;
    statuses: IOrderStatus[];
    onUpdated: (order: IOrder) => void;
}

const SectionTitle = ({ icon, title }: { icon: string; title: string }) => (
    <div className="flex align-items-center gap-2 mb-3">
        <span className="flex align-items-center justify-content-center bg-primary-100 text-primary-700 border-round w-2rem h-2rem">
            <i className={icon} />
        </span>
        <h3 className="text-lg font-semibold text-900 m-0">{title}</h3>
    </div>
);

const InfoItem = ({
    icon,
    label,
    value,
}: {
    icon: string;
    label: string;
    value: ReactNode;
}) => (
    <div className="flex align-items-start gap-2">
        <i className={`${icon} text-500 mt-1`} />
        <div className="flex flex-column">
            <span className="text-500 text-sm">{label}</span>
            <span className="font-medium text-900">{value}</span>
        </div>
    </div>
);

const ProductThumb = ({ url, alt }: { url?: string; alt: string }) => {
    const [src, setSrc] = useState(resolveProductImage(url));
    return (
        <img
            src={src}
            alt={alt}
            className="w-3rem h-3rem border-round shadow-1 surface-100"
            style={{ objectFit: "cover" }}
            onError={() => setSrc(resolveProductImage(undefined))}
        />
    );
};

export const OrderDetailModal = ({
    visible,
    onHide,
    order,
    statuses,
    onUpdated,
}: OrderDetailModalProps) => {
    const { showToast } = useToast();
    const [selectedStatusId, setSelectedStatusId] = useState<number | null>(
        null
    );
    const [statusMessage, setStatusMessage] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);
    const [hasNotaFiscal, setHasNotaFiscal] = useState(false);

    const handleDocumentsChange = (documents: IOrderDocument[]) => {
        setHasNotaFiscal(
            documents.some((doc) => doc.documentType === "NOTA_FISCAL")
        );
    };

    useEffect(() => {
        if (order) {
            const current = statuses.find((s) => s.name === order.status);
            setSelectedStatusId(current ? current.id : null);
            setStatusMessage(order.statusMessage ?? "");
        }
    }, [order, statuses]);

    if (!order) return null;

    const currentStatus = statuses.find((s) => s.name === order.status);
    const isStatusChanged =
        selectedStatusId !== null && selectedStatusId !== currentStatus?.id;

    const handleSave = async () => {
        if (selectedStatusId === null) return;

        const targetStatus = statuses.find((s) => s.id === selectedStatusId);
        if (
            targetStatus?.name?.toUpperCase() === "ENVIADO" &&
            !hasNotaFiscal
        ) {
            showToast(
                ToastSeverity.WARN,
                "Nota fiscal obrigatória",
                "Anexe a nota fiscal antes de marcar o pedido como enviado."
            );
            return;
        }

        setIsSaving(true);
        try {
            const updated = await updateOrderStatus(order.id, {
                statusId: selectedStatusId,
                statusMessage: statusMessage.trim() || undefined,
            });
            showToast(
                ToastSeverity.SUCCESS,
                "Sucesso",
                `Status do pedido #${order.id} atualizado.`
            );
            onUpdated(updated);
            onHide();
        } catch (error: any) {
            console.error("Erro ao atualizar status do pedido:", error);
            const message =
                error.response?.data?.message ||
                "Não foi possível atualizar o status do pedido.";
            showToast(ToastSeverity.ERROR, "Erro", message);
        } finally {
            setIsSaving(false);
        }
    };

    const total = getOrderTotal(order.orderItems);
    const shipmentPrice = Number(order.shipment?.price ?? 0);
    const customer = order.customer;

    const header = (
        <div className="flex align-items-center gap-3 flex-wrap">
            <span className="flex align-items-center gap-2">
                <i className="pi pi-receipt text-primary text-xl" />
                <span className="text-xl font-bold">Pedido #{order.id}</span>
            </span>
            <Tag
                value={order.status}
                severity={getStatusSeverity(order.status)}
            />
        </div>
    );

    const footer = (
        <div className="flex justify-content-end gap-2">
            <Button
                label="Fechar"
                icon="pi pi-times"
                outlined
                onClick={onHide}
                disabled={isSaving}
            />
            <Button
                label="Salvar status"
                icon="pi pi-check"
                onClick={handleSave}
                loading={isSaving}
                disabled={!isStatusChanged || isSaving}
            />
        </div>
    );

    const productBody = (item: IOrder["orderItems"][number]) => (
        <div className="flex align-items-center gap-3">
            <ProductThumb
                url={item.product?.urlImage}
                alt={item.product?.name ?? "Produto"}
            />
            <div className="flex flex-column">
                <span className="font-medium text-900">
                    {item.product?.name ?? "-"}
                </span>
                {item.product?.category?.name && (
                    <span className="text-500 text-sm">
                        {item.product.category.name}
                    </span>
                )}
            </div>
        </div>
    );

    return (
        <Dialog
            header={header}
            visible={visible}
            onHide={onHide}
            draggable={false}
            footer={footer}
            className="w-11 md:w-9 lg:w-8"
            contentClassName="pt-2"
        >
            <div className="flex flex-column gap-4">
                {/* Resumo */}
                <section className="surface-50 border-round p-3">
                    <div className="grid">
                        <div className="col-12 sm:col-6 lg:col-3">
                            <InfoItem
                                icon="pi pi-calendar"
                                label="Data do pedido"
                                value={formatDate(order.data)}
                            />
                        </div>
                        <div className="col-12 sm:col-6 lg:col-3">
                            <InfoItem
                                icon="pi pi-user"
                                label="Cliente"
                                value={getCustomerName(customer)}
                            />
                        </div>
                        <div className="col-12 sm:col-6 lg:col-3">
                            <InfoItem
                                icon="pi pi-credit-card"
                                label="Pagamento"
                                value={order.payment?.name ?? "-"}
                            />
                        </div>
                        <div className="col-12 sm:col-6 lg:col-3">
                            <InfoItem
                                icon="pi pi-truck"
                                label="Frete"
                                value={
                                    order.shipment?.name
                                        ? `${order.shipment.name} • ${formatCurrency(
                                              shipmentPrice
                                          )}`
                                        : "-"
                                }
                            />
                        </div>
                    </div>
                </section>

                <div className="grid">
                    {/* Cliente */}
                    <div className="col-12 lg:col-6">
                        <section className="border-1 surface-border border-round p-3 h-full">
                            <SectionTitle
                                icon="pi pi-user"
                                title="Dados do cliente"
                            />
                            <div className="flex flex-column gap-3">
                                <InfoItem
                                    icon="pi pi-id-card"
                                    label="Nome"
                                    value={getCustomerName(customer)}
                                />
                                <InfoItem
                                    icon="pi pi-envelope"
                                    label="E-mail"
                                    value={customer?.email || "-"}
                                />
                                <InfoItem
                                    icon="pi pi-hashtag"
                                    label="CPF"
                                    value={formatCpf(customer?.cpf)}
                                />
                            </div>
                        </section>
                    </div>

                    {/* Endereço */}
                    <div className="col-12 lg:col-6">
                        <section className="border-1 surface-border border-round p-3 h-full">
                            <SectionTitle
                                icon="pi pi-map-marker"
                                title="Endereço de entrega"
                            />
                            {order.address?.street ? (
                                <div className="flex flex-column gap-2 text-700">
                                    <span>
                                        {order.address.street}
                                        {order.address.number
                                            ? `, ${order.address.number}`
                                            : ""}
                                        {order.address.complement
                                            ? ` - ${order.address.complement}`
                                            : ""}
                                    </span>
                                    {order.address.neighborhood && (
                                        <span>{order.address.neighborhood}</span>
                                    )}
                                    <span>
                                        {[
                                            order.address.city,
                                            order.address.state,
                                        ]
                                            .filter(Boolean)
                                            .join(" / ")}
                                    </span>
                                    {order.address.cep && (
                                        <span className="text-500">
                                            CEP {formatCep(order.address.cep)}
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <span className="text-500">
                                    Endereço não informado
                                </span>
                            )}
                        </section>
                    </div>
                </div>

                {/* Itens */}
                <section className="border-1 surface-border border-round p-3">
                    <SectionTitle
                        icon="pi pi-shopping-bag"
                        title={`Itens do pedido (${order.orderItems.length})`}
                    />
                    <DataTable
                        value={order.orderItems}
                        size="small"
                        emptyMessage="Sem itens"
                        responsiveLayout="scroll"
                    >
                        <Column header="Produto" body={productBody} />
                        <Column
                            header="Qtd."
                            body={(item) => item.quantity}
                            style={{ width: "5rem", textAlign: "center" }}
                        />
                        <Column
                            header="Preço unit."
                            body={(item) => formatCurrency(item.product?.price)}
                            style={{ width: "9rem" }}
                        />
                        <Column
                            header="Subtotal"
                            body={(item) => (
                                <span className="font-semibold">
                                    {formatCurrency(item.totalPrice)}
                                </span>
                            )}
                            style={{ width: "9rem" }}
                        />
                    </DataTable>

                    <div className="flex flex-column align-items-end gap-1 mt-3">
                        <span className="text-700">
                            Subtotal: {formatCurrency(total)}
                        </span>
                        <span className="text-700">
                            Frete: {formatCurrency(shipmentPrice)}
                        </span>
                        <span className="text-xl font-bold text-900">
                            Total: {formatCurrency(total + shipmentPrice)}
                        </span>
                    </div>
                </section>

                {/* Anexos */}
                <section className="border-1 surface-border border-round p-3">
                    <SectionTitle
                        icon="pi pi-paperclip"
                        title="Anexos do pedido"
                    />
                    <OrderDocuments
                        orderId={order.id}
                        onDocumentsChange={handleDocumentsChange}
                    />
                </section>

                {/* Alterar status */}
                <section className="surface-50 border-round p-3">
                    <SectionTitle icon="pi pi-sync" title="Atualizar status" />
                    <div className="grid">
                        <div className="col-12 md:col-5">
                            <label
                                htmlFor="order-status"
                                className="block mb-2 text-sm text-500"
                            >
                                Novo status
                            </label>
                            <Dropdown
                                inputId="order-status"
                                className="w-full"
                                value={selectedStatusId}
                                options={statuses}
                                optionLabel="name"
                                optionValue="id"
                                placeholder="Selecione o status"
                                onChange={(e) => setSelectedStatusId(e.value)}
                            />
                        </div>
                        <div className="col-12 md:col-7">
                            <label
                                htmlFor="order-status-message"
                                className="block mb-2 text-sm text-500"
                            >
                                Mensagem (opcional)
                            </label>
                            <InputTextarea
                                id="order-status-message"
                                className="w-full"
                                rows={2}
                                maxLength={255}
                                value={statusMessage}
                                placeholder="Mensagem associada à mudança de status"
                                onChange={(e) =>
                                    setStatusMessage(e.target.value)
                                }
                            />
                        </div>
                    </div>
                </section>
            </div>
        </Dialog>
    );
};
