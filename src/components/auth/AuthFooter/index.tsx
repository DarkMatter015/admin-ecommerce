import { Link } from "react-router-dom";

interface AuthFooterProps {
    text: string;
    linkText: string;
    to: string;
}

export const AuthFooter = ({ text, linkText, to }: AuthFooterProps) => {
    return (
        <div>
            <div className="text-center flex flex-column lg:flex-row justify-content-center align-items-center gap-3">
                <span className="text-lg">{text}</span>
                <Link to={to} className="link text-xl" aria-label={linkText}>
                    {linkText}
                </Link>
            </div>
        </div>
    );
};
