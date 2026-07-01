import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
    headers: {
        "X-App-Source": "admin",
    },
});

/**
 * Filtro de requisição: injeta o token JWT (quando existe) no header
 * Authorization de cada requisição, sem mutar os defaults globais do axios.
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error),
);

/**
 * Filtro de resposta: trata sessões expiradas/inválidas (401).
 * Em caso de 401, limpa a sessão e redireciona para o login.
 * O 403 (sem permissão) é tratado na camada de rotas (RequireAuth).
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const requestUrl: string = error.config?.url ?? "";

        const isLoginRequest = requestUrl.includes("/auth/login");
        const isTokenValidation = requestUrl.includes("/auth/validate");

        if (status === 401 && !isLoginRequest) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            delete api.defaults.headers.common["Authorization"];

            // Evita redirecionar durante a validação inicial (tratada no
            // AuthContext) e evita loop quando já estamos na tela de login.
            if (!isTokenValidation && window.location.pathname !== "/login") {
                window.location.assign("/login");
            }
        }

        console.error(`Erro na requisição ${requestUrl}:`, error);

        return Promise.reject(error);
    },
);