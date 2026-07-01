import type { ReactNode } from "react";
import "./stat-card.css";

export interface StatCardProps {
    /** Título curto da métrica. */
    label: string;
    /** Valor principal já formatado. */
    value: ReactNode;
    /** Ícone PrimeIcons, ex.: "pi pi-wallet". */
    icon: string;
    /** Cor de destaque do ícone/detalhe. */
    accent?: "purple" | "green" | "blue" | "amber" | "red" | "cyan";
    /** Texto auxiliar exibido abaixo do valor. */
    hint?: string;
    /** Variação percentual opcional (positiva ou negativa). */
    trend?: number | null;
    /** Estado de carregamento (skeleton). */
    loading?: boolean;
}

export const StatCard = ({
    label,
    value,
    icon,
    accent = "purple",
    hint,
    trend,
    loading = false,
}: StatCardProps) => {
    const hasTrend = typeof trend === "number" && !Number.isNaN(trend);
    const trendUp = hasTrend && (trend as number) >= 0;

    return (
        <div className={`stat-card stat-card--${accent}`}>
            <div className="stat-card__top">
                <span className="stat-card__icon">
                    <i className={icon} />
                </span>
                {hasTrend && (
                    <span
                        className={`stat-card__trend ${
                            trendUp
                                ? "stat-card__trend--up"
                                : "stat-card__trend--down"
                        }`}
                    >
                        <i
                            className={`pi ${
                                trendUp
                                    ? "pi-arrow-up-right"
                                    : "pi-arrow-down-right"
                            }`}
                        />
                        {Math.abs(trend as number).toFixed(1)}%
                    </span>
                )}
            </div>

            <div className="stat-card__body">
                <span className="stat-card__label">{label}</span>
                {loading ? (
                    <span className="stat-card__skeleton" />
                ) : (
                    <span className="stat-card__value">{value}</span>
                )}
                {hint && !loading && (
                    <span className="stat-card__hint">{hint}</span>
                )}
            </div>
        </div>
    );
};
