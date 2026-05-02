import { Link } from "react-router-dom";

interface AuthHeaderProps {
    title: string;
    subtitle?: string;
    homeButton?: boolean;
}

export const AuthHeader = ({
    title,
    subtitle,
    homeButton = false,
}: AuthHeaderProps) => {
    return (
        <header className="text-center mb-5">
            {homeButton && (
                <Link to="/" aria-label="Ir para página inicial">
                    <img
                        src="/assets/images/logo/logo_riffhouse_red.png"
                        alt="Logo Riff House"
                        className="w-12rem"
                    />
                </Link>
            )}
            <h1 className="text-5xl font-medium mb-3 mt-0 bg-purple-900">{title}</h1>
            <h1 style={{ color: 'var(--purple-500)', backgroundColor: 'var(--surface-900)' }} className="font-bold mb-3">Teste Crítico</h1>
            {subtitle && (
                <p className="text-600 font-medium line-height-3">{subtitle}</p>
            )}
        </header>
    );
};
