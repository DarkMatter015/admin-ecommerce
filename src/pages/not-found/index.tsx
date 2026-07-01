import { useAuth } from "@/context/hooks/use-auth";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";

export const NotFoundPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    return (
        <main className="flex flex-column align-items-center justify-content-center h-screen w-full text-center gap-3 p-4">
            <i
                className="pi pi-compass text-primary"
                style={{ fontSize: "4rem" }}
                aria-hidden="true"
            ></i>
            <h1 className="m-0 text-6xl font-bold">404</h1>
            <h2 className="m-0 text-2xl font-medium">Página não encontrada</h2>
            <p className="text-color-secondary max-w-30rem">
                A página que você tentou acessar não existe ou foi movida.
            </p>
            <Button
                label={isAuthenticated ? "Voltar ao início" : "Ir para o login"}
                icon="pi pi-home"
                onClick={() => navigate(isAuthenticated ? "/" : "/login")}
            />
        </main>
    );
};
