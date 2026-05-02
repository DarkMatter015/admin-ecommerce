import { PrimeReactProvider } from "primereact/api";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import "primereact/resources/primereact.min.css"; // 1. Estrutura core
import "primereact/resources/themes/lara-dark-purple/theme.css"; // 2. Cores do tema (Lara)
import "primeicons/primeicons.css"; // 3. Ícones
import "primeflex/primeflex.css"; // 4. Classes utilitárias com precedência de sobreposição
import "./index.css"; // 5. Suas customizações (atualmente vazio)
import { ToastProvider } from "./context/ToastContext.tsx";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <PrimeReactProvider>
                <AuthProvider>
                    <ToastProvider>
                        <App />
                    </ToastProvider>
                </AuthProvider>
            </PrimeReactProvider>
        </BrowserRouter>
    </StrictMode>,
);
