import type {
    IDashboardMetrics,
    ILowStockProduct,
    IMonthlyPoint,
    IStatusBreakdown,
    ITopProduct,
} from "@/commons/dashboard_types";
import type { IOrder } from "@/commons/order_types";
import type { IProduct } from "@/commons/product_types";
import type { IUserResponse } from "@/commons/user_types";
import { getOrders } from "./order_service";
import { getProducts } from "./product_service";
import { getUsers } from "./user_service";

/** Limite abaixo do qual um produto é considerado com estoque baixo. */
const LOW_STOCK_THRESHOLD = 5;

/** Tamanho de página amplo para agregação client-side das métricas. */
const AGGREGATION_SIZE = 500;

const MONTH_LABELS = [
    "jan", "fev", "mar", "abr", "mai", "jun",
    "jul", "ago", "set", "out", "nov", "dez",
];

const isCanceled = (status: string) => status?.toUpperCase() === "CANCELADO";
const isPending = (status: string) => status?.toUpperCase() === "PENDENTE";
const isDelivered = (status: string) => status?.toUpperCase() === "ENTREGUE";

/** Soma o valor total de um pedido a partir dos seus itens. */
const orderTotal = (order: IOrder): number =>
    order.orderItems.reduce(
        (acc, item) => acc + Number(item.totalPrice ?? 0),
        0
    );

/** Agrupa pedidos por status, contabilizando quantidade e faturamento. */
const buildStatusBreakdown = (orders: IOrder[]): IStatusBreakdown[] => {
    const map = new Map<string, IStatusBreakdown>();
    for (const order of orders) {
        const status = order.status || "PENDENTE";
        const current = map.get(status) ?? { status, count: 0, revenue: 0 };
        current.count += 1;
        current.revenue += orderTotal(order);
        map.set(status, current);
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
};

/** Constrói a série mensal (últimos 6 meses) de faturamento e pedidos. */
const buildMonthly = (orders: IOrder[]): IMonthlyPoint[] => {
    const now = new Date();
    const buckets: IMonthlyPoint[] = [];
    const index = new Map<string, IMonthlyPoint>();

    for (let i = 5; i >= 0; i -= 1) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${date.getFullYear()}-${String(
            date.getMonth() + 1
        ).padStart(2, "0")}`;
        const point: IMonthlyPoint = {
            key,
            label: `${MONTH_LABELS[date.getMonth()]}/${String(
                date.getFullYear()
            ).slice(-2)}`,
            revenue: 0,
            orders: 0,
        };
        buckets.push(point);
        index.set(key, point);
    }

    for (const order of orders) {
        if (isCanceled(order.status) || !order.data) continue;
        const date = new Date(order.data);
        if (Number.isNaN(date.getTime())) continue;
        const key = `${date.getFullYear()}-${String(
            date.getMonth() + 1
        ).padStart(2, "0")}`;
        const point = index.get(key);
        if (!point) continue;
        point.revenue += orderTotal(order);
        point.orders += 1;
    }

    return buckets;
};

/** Ranking dos produtos mais vendidos por quantidade. */
const buildTopProducts = (orders: IOrder[]): ITopProduct[] => {
    const map = new Map<number, ITopProduct>();
    for (const order of orders) {
        if (isCanceled(order.status)) continue;
        for (const item of order.orderItems) {
            const id = item.product?.id;
            if (id == null) continue;
            const current = map.get(id) ?? {
                id,
                name: item.product?.name || `Produto #${id}`,
                quantity: 0,
                revenue: 0,
            };
            current.quantity += Number(item.quantity ?? 0);
            current.revenue += Number(item.totalPrice ?? 0);
            map.set(id, current);
        }
    }
    return Array.from(map.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
};

/** Produtos com estoque baixo (abaixo do limite). */
const buildLowStock = (products: IProduct[]): ILowStockProduct[] =>
    products
        .filter(
            (product) =>
                Number(product.quantityAvailableInStock ?? 0) <=
                LOW_STOCK_THRESHOLD
        )
        .map((product) => ({
            id: product.id,
            name: product.name,
            stock: Number(product.quantityAvailableInStock ?? 0),
        }))
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 6);

const countCustomers = (users: IUserResponse[]) =>
    users.filter(
        (user) => !user.roles.some((role) => role.name === "ADMIN")
    ).length;

const countAdmins = (users: IUserResponse[]) =>
    users.filter((user) => user.roles.some((role) => role.name === "ADMIN"))
        .length;

/**
 * Busca pedidos, produtos e usuários e agrega todas as métricas exibidas
 * no painel administrativo da home.
 */
export const getDashboardMetrics = async (): Promise<IDashboardMetrics> => {
    const [ordersPage, productsPage, usersPage] = await Promise.all([
        getOrders(0, AGGREGATION_SIZE),
        getProducts(0, AGGREGATION_SIZE),
        getUsers(0, AGGREGATION_SIZE),
    ]);

    const orders = ordersPage.content;
    const products = productsPage.content;
    const users = usersPage.content;

    const activeOrders = orders.filter((order) => !isCanceled(order.status));
    const totalRevenue = activeOrders.reduce(
        (acc, order) => acc + orderTotal(order),
        0
    );
    const paidRevenue = orders
        .filter((order) => isDelivered(order.status))
        .reduce((acc, order) => acc + orderTotal(order), 0);

    const canceledOrders = orders.filter((order) =>
        isCanceled(order.status)
    ).length;
    const pendingOrders = orders.filter((order) =>
        isPending(order.status)
    ).length;

    const totalOrders = ordersPage.totalElements || orders.length;
    const averageTicket =
        activeOrders.length > 0 ? totalRevenue / activeOrders.length : 0;

    const lowStockProducts = buildLowStock(products);
    const outOfStockCount = products.filter(
        (product) => Number(product.quantityAvailableInStock ?? 0) === 0
    ).length;
    const inventoryValue = products.reduce(
        (acc, product) =>
            acc +
            Number(product.price ?? 0) *
                Number(product.quantityAvailableInStock ?? 0),
        0
    );

    return {
        totalRevenue,
        totalOrders,
        averageTicket,
        totalProducts: productsPage.totalElements || products.length,
        totalCustomers: countCustomers(users),
        totalAdmins: countAdmins(users),

        paidRevenue,
        canceledOrders,
        canceledRate:
            totalOrders > 0 ? (canceledOrders / totalOrders) * 100 : 0,
        pendingOrders,

        lowStockCount: lowStockProducts.length,
        outOfStockCount,
        inventoryValue,

        statusBreakdown: buildStatusBreakdown(orders),
        monthly: buildMonthly(orders),
        topProducts: buildTopProducts(orders),
        lowStockProducts,
    };
};
