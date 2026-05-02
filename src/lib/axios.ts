import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
});

api.interceptors.request.use(
    function (config) {
        const token = localStorage.getItem("token");

        if (token) {
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }

        api.defaults.headers.common["X-App-Source"] = "admin";

        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error(`Erro na requisição ${error.config.url}:`, error);
        return Promise.reject(error);
    }
);