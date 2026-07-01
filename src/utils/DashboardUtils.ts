import type {
    IDashboardMetrics,
    IMonthlyPoint,
} from "@/commons/dashboard_types";
import type { ChartData, ChartOptions } from "chart.js";

/** Paleta alinhada ao tema Riff House (roxo/índigo + estados). */
export const CHART_COLORS = {
    primary: "#8b5cf6",
    indigo: "#6366f1",
    cyan: "#22d3ee",
    green: "#22c55e",
    amber: "#fcd34d",
    red: "#ef4444",
    grid: "rgba(255, 255, 255, 0.06)",
    text: "rgba(226, 222, 240, 0.75)",
};

const STATUS_COLOR: Record<string, string> = {
    ENTREGUE: CHART_COLORS.green,
    ENVIADO: CHART_COLORS.indigo,
    PROCESSANDO: CHART_COLORS.amber,
    CANCELADO: CHART_COLORS.red,
    PENDENTE: CHART_COLORS.primary,
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});

export const formatCurrency = (value?: number | null): string =>
    currencyFormatter.format(Number(value ?? 0));

export const formatCompact = (value?: number | null): string =>
    new Intl.NumberFormat("pt-BR", {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(Number(value ?? 0));

/** Variação percentual entre o último e o penúltimo mês de faturamento. */
export const monthlyTrend = (monthly: IMonthlyPoint[]): number | null => {
    if (monthly.length < 2) return null;
    const current = monthly[monthly.length - 1].revenue;
    const previous = monthly[monthly.length - 2].revenue;
    if (previous <= 0) return current > 0 ? 100 : null;
    return ((current - previous) / previous) * 100;
};

/** Dataset (doughnut) da distribuição de pedidos por status. */
export const buildStatusChart = (
    metrics: IDashboardMetrics
): ChartData<"doughnut"> => ({
    labels: metrics.statusBreakdown.map((item) => item.status),
    datasets: [
        {
            data: metrics.statusBreakdown.map((item) => item.count),
            backgroundColor: metrics.statusBreakdown.map(
                (item) => STATUS_COLOR[item.status?.toUpperCase()] ?? CHART_COLORS.primary
            ),
            borderColor: "rgba(15, 12, 29, 0.9)",
            borderWidth: 2,
            hoverOffset: 6,
        },
    ],
});

/** Dataset (line) de evolução do faturamento mensal. */
export const buildRevenueChart = (
    metrics: IDashboardMetrics
): ChartData<"line"> => ({
    labels: metrics.monthly.map((point) => point.label),
    datasets: [
        {
            label: "Faturamento",
            data: metrics.monthly.map((point) => point.revenue),
            borderColor: CHART_COLORS.primary,
            backgroundColor: "rgba(139, 92, 246, 0.18)",
            fill: true,
            tension: 0.4,
            pointBackgroundColor: CHART_COLORS.primary,
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2,
        },
    ],
});

/** Dataset (bar) de pedidos por mês. */
export const buildOrdersChart = (
    metrics: IDashboardMetrics
): ChartData<"bar"> => ({
    labels: metrics.monthly.map((point) => point.label),
    datasets: [
        {
            label: "Pedidos",
            data: metrics.monthly.map((point) => point.orders),
            backgroundColor: CHART_COLORS.indigo,
            borderRadius: 6,
            maxBarThickness: 34,
        },
    ],
});

/** Dataset (bar horizontal) dos produtos mais vendidos. */
export const buildTopProductsChart = (
    metrics: IDashboardMetrics
): ChartData<"bar"> => ({
    labels: metrics.topProducts.map((product) => product.name),
    datasets: [
        {
            label: "Unidades vendidas",
            data: metrics.topProducts.map((product) => product.quantity),
            backgroundColor: CHART_COLORS.cyan,
            borderRadius: 6,
            maxBarThickness: 26,
        },
    ],
});

const baseLegend = {
    labels: {
        color: CHART_COLORS.text,
        usePointStyle: true,
        padding: 16,
        font: { family: "Poppins", size: 12 },
    },
};

export const doughnutOptions: ChartOptions<"doughnut"> = {
    maintainAspectRatio: false,
    cutout: "62%",
    plugins: {
        legend: { position: "bottom", ...baseLegend },
    },
};

const cartesianScales = {
    x: {
        ticks: { color: CHART_COLORS.text, font: { family: "Poppins" } },
        grid: { color: CHART_COLORS.grid },
    },
    y: {
        ticks: { color: CHART_COLORS.text, font: { family: "Poppins" } },
        grid: { color: CHART_COLORS.grid },
        beginAtZero: true,
    },
};

export const revenueOptions: ChartOptions<"line"> = {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
        ...cartesianScales,
        y: {
            ...cartesianScales.y,
            ticks: {
                color: CHART_COLORS.text,
                font: { family: "Poppins" },
                callback: (value) => formatCompact(Number(value)),
            },
        },
    },
};

export const ordersOptions: ChartOptions<"bar"> = {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: cartesianScales,
};

export const topProductsOptions: ChartOptions<"bar"> = {
    maintainAspectRatio: false,
    indexAxis: "y",
    plugins: { legend: { display: false } },
    scales: cartesianScales,
};
