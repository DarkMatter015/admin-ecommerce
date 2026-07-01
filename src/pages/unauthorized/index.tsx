import { useAuth } from "@/context/hooks/use-auth";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";

export const UnauthorizedPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, handleLogout } = useAuth();

    return (
        <main className="flex flex-column align-items-center justify-content-center h-screen w-full text-center gap-3 p-4">
            <i
                className="pi pi-lock text-orange-500"
                style={{ fontSize: "4rem" }}
                aria-hidden="true"
            ></i>
            <h1 className="m-0 text-6xl font-bold">403</h1>
            <h2 className="m-0 text-2xl font-medium">Acesso negado</h2>
            <p className="text-color-secondary max-w-30rem">
                Você não possui permissão de administrador para acessar esta
                área. Caso acredite que isso é um engano, entre em contato com um
                administrador.
            </p>

            <div className="flex gap-2 flex-wrap justify-content-center">
                {isAuthenticated ? (
                    <Button
                        label="Sair"
                        icon="pi pi-sign-out"
                        severity="secondary"
                        onClick={handleLogout}
                    />
                ) : (
                    <Button
                        label="Ir para o login"
                        icon="pi pi-sign-in"
                        onClick={() => navigate("/login")}
                    />
                )}
            </div>
        </main>
    );
};
