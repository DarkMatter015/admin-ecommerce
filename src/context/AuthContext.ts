import { createContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

import { api } from "@/lib/axios";
import { useNavigate } from "react-router-dom";
import type { IAuthenticatedUser, IAuthenticationResponse } from "@/commons/auth_types";
import { validateToken } from "@/services/auth_service";

interface AuthContextType {
    isAuthenticated: boolean;
    authenticatedUser?: IAuthenticatedUser;
    handleLogin: (
        authenticationResponse: IAuthenticationResponse,
    ) => Promise<any>;
    handleLogout: () => void;
    updateUserProfile: (user: IAuthenticatedUser) => void;
}

const AuthContext = createContext({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [authenticatedUser, setAuthenticatedUser] = useState<IAuthenticatedUser | undefined>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(() => {
        const token = localStorage.getItem("token");
        return !!token; // Se tem token, começa true (carregando validação). Se não tem, começa false.
    });
    const [authenticated, setAuthenticated] = useState(() => {
        const token = localStorage.getItem("token");
        return !!token; // Se tem token, começa true (autenticado). Se não tem, começa false.
    }
    );

    useEffect(() => {
        const initSession = async () => {
            const storedToken = localStorage.getItem("token");

            if (!storedToken) {
                setLoading(false);
                return;
            }

            try {
                const userResponse = await validateToken(storedToken);

                setAuthenticatedUser(userResponse);

                localStorage.setItem("user", JSON.stringify(userResponse));
            } catch (error) {
                console.warn("Sessão inválida ou expirada:", error);
                handleLogout();
            } finally {
                setLoading(false);
            }
        };

        initSession();
    }, []);

    const handleLogin = async ({ token, user }: IAuthenticationResponse) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        setAuthenticatedUser(user);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        delete api.defaults.headers.common["Authorization"];
        setAuthenticatedUser(undefined);

        navigate("/", { replace: true });
    };

    const updateUserProfile = (newUser: IAuthenticatedUser) => {
        setAuthenticatedUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
    };

    const handleLoginSocial = async () => {
        const response = await api.post("/auth-social");
        console.log(response);
        localStorage.setItem("token", JSON.stringify(response.data.token));
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setAuthenticatedUser(response.data.user);
        setAuthenticated(true)
        navigate("/");
    }

    const contextValue = useMemo(
        () => ({
            isAuthenticated,
            authenticatedUser,
            loading,
            handleLogin,
            handleLogout,
            updateUserProfile,
        }),
        [authenticatedUser, loading, isAuthenticated],
    );

    return <AuthContext.Provider value={ contextValue }> { children } </AuthContext.Provider>;
};

export { AuthContext };
