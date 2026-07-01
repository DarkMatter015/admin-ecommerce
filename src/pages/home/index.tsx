import type { IDashboardMetrics } from "@/commons/dashboard_types";
import { StatCard } from "@/components/dashboard/StatCard";
import { getDashboardMetrics } from "@/services/dashboard_service";
import {
    buildOrdersChart,
    buildRevenueChart,
    buildStatusChart,
    buildTopProductsChart,
    doughnutOptions,
    formatCurrency,
    monthlyTrend,
    ordersOptions,
    revenueOptions,
    topProductsOptions,
} from "@/utils/DashboardUtils";
import { getStatusSeverity } from "@/utils/OrderUtils";
import { Button } from "primereact/button";
import { Chart } from "primereact/chart";
import { Tag } from "primereact/tag";
import { useCallback, useEffect, useMemo, useState } from "react";
import "./home.css";

export const HomePage = () => {
    const [metrics, setMetrics] = useState<IDashboardMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMetrics = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setMetrics(await getDashboardMetrics());
        } catch (err) {
            console.error("Erro ao carregar o painel:", err);
            setError("Não foi possível carregar as métricas do painel.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMetrics();
    }, [fetchMetrics]);

    const trend = useMemo(
        () => (metrics ? monthlyTrend(metrics.monthly) : null),
        [metrics]
    );

    const charts = useMemo(() => {
        if (!metrics) return null;
        return {
            revenue: buildRevenueChart(metrics),
            status: buildStatusChart(metrics),
            orders: buildOrdersChart(metrics),
            topProducts: buildTopProductsChart(metrics),
        };
    }, [metrics]);

    return (
        <div className="dashboard">
            <header className="dashboard__header">
                <div>
                    <h1 className="dashboard__title">Painel Administrativo</h1>
                    <p className="dashboard__subtitle">
                        Visão geral de vendas, financeiro e operação da loja.
                    </p>
                </div>
                <Button
                    icon="pi pi-refresh"
                    label="Atualizar"
                    outlined
                    loading={loading}
                    onClick={fetchMetrics}
                />
            </header>

            {error && (
                <div className="dashboard__error">
                    <i className="pi pi-exclamation-triangle" />
                    <span>{error}</span>
                </div>
            )}

            {/* KPIs principais */}
            <section className="dashboard__kpis">
                <StatCard
                    label="Faturamento"
                    icon="pi pi-wallet"
                    accent="green"
                    loading={loading}
                    trend={trend}
                    value={formatCurrency(metrics?.totalRevenue)}
                    hint="Pedidos não cancelados"
                />
                <StatCard
                    label="Pedidos"
                    icon="pi pi-shopping-bag"
                    accent="purple"
                    loading={loading}
                    value={metrics?.totalOrders ?? 0}
                    hint={`${metrics?.pendingOrders ?? 0} pendentes`}
                />
                <StatCard
                    label="Ticket Médio"
                    icon="pi pi-chart-line"
                    accent="blue"
                    loading={loading}
                    value={formatCurrency(metrics?.averageTicket)}
                    hint="Por pedido válido"
                />
                <StatCard
                    label="Receita Realizada"
                    icon="pi pi-check-circle"
                    accent="cyan"
                    loading={loading}
                    value={formatCurrency(metrics?.paidRevenue)}
                    hint="Pedidos entregues"
                />
                <StatCard
                    label="Produtos"
                    icon="pi pi-box"
                    accent="purple"
                    loading={loading}
                    value={metrics?.totalProducts ?? 0}
                    hint={`${metrics?.outOfStockCount ?? 0} sem estoque`}
                />
                <StatCard
                    label="Clientes"
                    icon="pi pi-users"
                    accent="blue"
                    loading={loading}
                    value={metrics?.totalCustomers ?? 0}
                    hint={`${metrics?.totalAdmins ?? 0} administradores`}
                />
                <StatCard
                    label="Cancelamentos"
                    icon="pi pi-times-circle"
                    accent="red"
                    loading={loading}
                    value={metrics?.canceledOrders ?? 0}
                    hint={`${(metrics?.canceledRate ?? 0).toFixed(1)}% do total`}
                />
                <StatCard
                    label="Valor em Estoque"
                    icon="pi pi-database"
                    accent="amber"
                    loading={loading}
                    value={formatCurrency(metrics?.inventoryValue)}
                    hint={`${metrics?.lowStockCount ?? 0} com estoque baixo`}
                />
            </section>

            {/* Gráficos */}
            <section className="dashboard__grid">
                <article className="dashboard__panel dashboard__panel--wide">
                    <div className="dashboard__panel-head">
                        <h2>Faturamento nos últimos 6 meses</h2>
                        <i className="pi pi-chart-line" />
                    </div>
                    <div className="dashboard__chart">
                        {charts && (
                            <Chart
                                type="line"
                                data={charts.revenue}
                                options={revenueOptions}
                            />
                        )}
                    </div>
                </article>

                <article className="dashboard__panel">
                    <div className="dashboard__panel-head">
                        <h2>Pedidos por status</h2>
                        <i className="pi pi-chart-pie" />
                    </div>
                    <div className="dashboard__chart">
                        {charts && (
                            <Chart
                                type="doughnut"
                                data={charts.status}
                                options={doughnutOptions}
                            />
                        )}
                    </div>
                </article>

                <article className="dashboard__panel">
                    <div className="dashboard__panel-head">
                        <h2>Pedidos por mês</h2>
                        <i className="pi pi-chart-bar" />
                    </div>
                    <div className="dashboard__chart">
                        {charts && (
                            <Chart
                                type="bar"
                                data={charts.orders}
                                options={ordersOptions}
                            />
                        )}
                    </div>
                </article>

                <article className="dashboard__panel">
                    <div className="dashboard__panel-head">
                        <h2>Produtos mais vendidos</h2>
                        <i className="pi pi-star" />
                    </div>
                    <div className="dashboard__chart">
                        {charts && metrics?.topProducts.length ? (
                            <Chart
                                type="bar"
                                data={charts.topProducts}
                                options={topProductsOptions}
                            />
                        ) : (
                            <p className="dashboard__empty">
                                Ainda não há vendas registradas.
                            </p>
                        )}
                    </div>
                </article>
            </section>

            {/* Listas operacionais */}
            <section className="dashboard__lists">
                <article className="dashboard__panel">
                    <div className="dashboard__panel-head">
                        <h2>Resumo por status</h2>
                        <i className="pi pi-list" />
                    </div>
                    <ul className="dashboard__status-list">
                        {metrics?.statusBreakdown.length ? (
                            metrics.statusBreakdown.map((item) => (
                                <li key={item.status}>
                                    <Tag
                                        value={item.status}
                                        severity={getStatusSeverity(item.status)}
                                    />
                                    <span className="dashboard__status-count">
                                        {item.count} pedido
                                        {item.count === 1 ? "" : "s"}
                                    </span>
                                    <span className="dashboard__status-revenue">
                                        {formatCurrency(item.revenue)}
                                    </span>
                                </li>
                            ))
                        ) : (
                            <li className="dashboard__empty-row">
                                Nenhum pedido encontrado.
                            </li>
                        )}
                    </ul>
                </article>

                <article className="dashboard__panel">
                    <div className="dashboard__panel-head">
                        <h2>Estoque baixo</h2>
                        <i className="pi pi-exclamation-triangle" />
                    </div>
                    <ul className="dashboard__stock-list">
                        {metrics?.lowStockProducts.length ? (
                            metrics.lowStockProducts.map((product) => (
                                <li key={product.id}>
                                    <span className="dashboard__stock-name">
                                        {product.name}
                                    </span>
                                    <Tag
                                        value={`${product.stock} un.`}
                                        severity={
                                            product.stock === 0
                                                ? "danger"
                                                : "warning"
                                        }
                                    />
                                </li>
                            ))
                        ) : (
                            <li className="dashboard__empty-row">
                                Todos os produtos com estoque saudável.
                            </li>
                        )}
                    </ul>
                </article>
            </section>
        </div>
    );
};
