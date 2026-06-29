import type { IOrder, IOrderStatus } from "@/commons/order_types";
import { getOrders, getOrderStatuses } from "@/services/order_service";
import {
    formatCurrency,
    formatDate,
    getCustomerName,
    getOrderTotal,
    getStatusSeverity,
} from "@/utils/OrderUtils";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable, type DataTablePageEvent } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { useCallback, useEffect, useMemo, useState } from "react";
import { OrderDetailModal } from "../OrderDetailModal";

const PAGE_SIZE = 10;

export const OrdersList = () => {
    const [orders, setOrders] = useState<IOrder[]>([]);
    const [statuses, setStatuses] = useState<IOrderStatus[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);

    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [customerFilter, setCustomerFilter] = useState<string>("");

    const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
    const [detailVisible, setDetailVisible] = useState(false);

    const fetchOrders = useCallback(async (pageNumber: number) => {
        setLoading(true);
        try {
            const data = await getOrders(pageNumber, PAGE_SIZE);
            setOrders(data.content);
            setTotalRecords(data.totalElements);
        } catch (error) {
            console.error("Erro ao buscar pedidos:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStatuses = useCallback(async () => {
        try {
            setStatuses(await getOrderStatuses());
        } catch (error) {
            console.error("Erro ao buscar status:", error);
        }
    }, []);

    useEffect(() => {
        fetchOrders(page);
    }, [fetchOrders, page]);

    useEffect(() => {
        fetchStatuses();
    }, [fetchStatuses]);

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const matchesStatus = statusFilter
                ? order.status === statusFilter
                : true;
            const term = customerFilter.trim().toLowerCase();
            const matchesCustomer = term
                ? String(order.userId).includes(term) ||
                  (order.customer?.name ?? "")
                      .toLowerCase()
                      .includes(term) ||
                  (order.customer?.email ?? "")
                      .toLowerCase()
                      .includes(term)
                : true;
            return matchesStatus && matchesCustomer;
        });
    }, [orders, statusFilter, customerFilter]);

    const handlePage = (event: DataTablePageEvent) => {
        setPage(event.page ?? 0);
    };

    const openDetail = (order: IOrder) => {
        setSelectedOrder(order);
        setDetailVisible(true);
    };

    const handleOrderUpdated = (updated: IOrder) => {
        setOrders((prev) =>
            prev.map((o) => (o.id === updated.id ? updated : o))
        );
        setSelectedOrder(updated);
    };

    const clearFilters = () => {
        setStatusFilter(null);
        setCustomerFilter("");
    };

    const statusBody = (order: IOrder) => (
        <Tag
            value={order.status}
            severity={getStatusSeverity(order.status)}
        />
    );

    const customerBody = (order: IOrder) => (
        <div className="flex flex-column">
            <span className="font-medium text-900">
                {getCustomerName(order.customer)}
            </span>
            <span className="text-500 text-sm">
                {order.customer?.email || `ID #${order.userId}`}
            </span>
        </div>
    );

    const dateBody = (order: IOrder) => (
        <span className="flex align-items-center gap-2">
            <i className="pi pi-calendar text-500" />
            {formatDate(order.data)}
        </span>
    );

    const idBody = (order: IOrder) => (
        <span className="font-semibold">#{order.id}</span>
    );

    const totalBody = (order: IOrder) => {
        const shipment = Number(order.shipment?.price ?? 0);
        return formatCurrency(getOrderTotal(order.orderItems) + shipment);
    };

    const actionsBody = (order: IOrder) => (
        <Button
            icon="pi pi-eye"
            rounded
            text
            aria-label="Ver detalhes"
            onClick={() => openDetail(order)}
        />
    );

    const header = (
        <div className="flex flex-column md:flex-row gap-3 md:align-items-end justify-content-between">
            <div className="flex flex-column md:flex-row gap-3">
                <div className="flex flex-column">
                    <label className="text-sm text-500 mb-1">
                        <i className="pi pi-flag mr-1" />
                        Status
                    </label>
                    <Dropdown
                        value={statusFilter}
                        options={statuses}
                        optionLabel="name"
                        optionValue="name"
                        placeholder="Todos"
                        showClear
                        className="w-12rem"
                        onChange={(e) => setStatusFilter(e.value)}
                    />
                </div>
                <div className="flex flex-column">
                    <label className="text-sm text-500 mb-1">
                        <i className="pi pi-user mr-1" />
                        Cliente
                    </label>
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText
                            value={customerFilter}
                            placeholder="Nome, e-mail ou ID"
                            onChange={(e) => setCustomerFilter(e.target.value)}
                        />
                    </span>
                </div>
            </div>
            <Button
                label="Limpar filtros"
                icon="pi pi-filter-slash"
                outlined
                onClick={clearFilters}
            />
        </div>
    );

    return (
        <div className="orders-list">
            <DataTable
                value={filteredOrders}
                header={header}
                loading={loading}
                lazy
                paginator
                rows={PAGE_SIZE}
                totalRecords={totalRecords}
                first={page * PAGE_SIZE}
                onPage={handlePage}
                dataKey="id"
                emptyMessage="Nenhum pedido encontrado"
                responsiveLayout="scroll"
            >
                <Column field="id" header="Pedido" body={idBody} sortable />
                <Column header="Data" body={dateBody} />
                <Column header="Cliente" body={customerBody} />
                <Column header="Status" body={statusBody} />
                <Column header="Total" body={totalBody} />
                <Column
                    header="Ações"
                    body={actionsBody}
                    style={{ width: "6rem", textAlign: "center" }}
                />
            </DataTable>

            <OrderDetailModal
                visible={detailVisible}
                onHide={() => setDetailVisible(false)}
                order={selectedOrder}
                statuses={statuses}
                onUpdated={handleOrderUpdated}
            />
        </div>
    );
};
