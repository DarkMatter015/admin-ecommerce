import type { ReactNode } from "react";

interface AuthLayoutProps {
    children: ReactNode;
    backgroundImage: string;
    backgroundAlt?: string;
}

export const AuthLayout = ({
    children,
    backgroundImage,
    backgroundAlt = "background image",
}: AuthLayoutProps) => {
    return (
        <div className="flex align-items-center justify-content-center min-h-screen">
            <div className="lg:min-h-screen my-5 lg:my-0 bg-white col-10 lg:col-7 p-4 shadow-2 border-round-sm lg:border-noround flex flex-column xl:justify-content-center">
                {children}
            </div>

            <aside
                className="hidden lg:flex col-5 align-items-center justify-content-center"
                aria-hidden="true"
            >
                <img
                    src={backgroundImage}
                    className="image-background-forms"
                    alt={backgroundAlt}
                    role="presentation"
                />
            </aside>
        </div>
    );
};
