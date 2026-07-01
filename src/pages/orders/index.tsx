import { TitlePage } from "@/components/layout/TitlePage";
import { OrdersList } from "@/components/orders/OrdersList";

export const OrdersPage = () => {
    return (
        <>
            <TitlePage title="Pedidos" />
            <div className="orders-page mx-4">
                <p className="flex align-items-center gap-2 text-600 mt-0 mb-4">
                    <i className="pi pi-shopping-bag" />
                    Gerencie os pedidos, acompanhe os clientes e atualize o
                    status de cada compra.
                </p>
                <OrdersList />
            </div>
        </>
    );
};
