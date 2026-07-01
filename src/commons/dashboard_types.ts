/** Tipos para o painel administrativo (dashboard) da home. */

/** Contagem de pedidos por status. */
export interface IStatusBreakdown {
    status: string;
    count: number;
    revenue: number;
}

/** Faturamento e pedidos agregados por mês. */
export interface IMonthlyPoint {
    /** Rótulo curto do mês, ex.: "jan/26". */
    label: string;
    /** Chave ordenável no formato AAAA-MM. */
    key: string;
    revenue: number;
    orders: number;
}

/** Produto mais vendido (por quantidade). */
export interface ITopProduct {
    id: number;
    name: string;
    quantity: number;
    revenue: number;
}

/** Produto com estoque baixo. */
export interface ILowStockProduct {
    id: number;
    name: string;
    stock: number;
}

/** Conjunto completo de métricas do painel administrativo. */
export interface IDashboardMetrics {
    // KPIs principais
    totalRevenue: number;
    totalOrders: number;
    averageTicket: number;
    totalProducts: number;
    totalCustomers: number;
    totalAdmins: number;

    // Financeiro / operacional
    paidRevenue: number;
    canceledOrders: number;
    canceledRate: number;
    pendingOrders: number;

    // Estoque
    lowStockCount: number;
    outOfStockCount: number;
    inventoryValue: number;

    // Séries para gráficos
    statusBreakdown: IStatusBreakdown[];
    monthly: IMonthlyPoint[];
    topProducts: ITopProduct[];
    lowStockProducts: ILowStockProduct[];
}
