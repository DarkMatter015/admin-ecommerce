import type { ReactNode } from "react";
import { createContext, useEffect, useMemo, useState } from "react";

import type {
    IAuthenticatedUser,
    IAuthenticationResponse,
} from "@/commons/auth_types";
import { api } from "@/lib/axios";
import { validateToken } from "@/services/auth_service";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
    isAuthenticated: boolean;
    authenticatedUser?: IAuthenticatedUser;
    loading: boolean;
    handleLogin: (
        authenticationResponse: IAuthenticationResponse,
    ) => Promise<any>;
    handleLoginSocial: (response: any) => Promise<any>;
    handleLogout: () => void;
    updateUserProfile: (user: IAuthenticatedUser) => void;
}

const AuthContext = createContext({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [authenticatedUser, setAuthenticatedUser] = useState<
        IAuthenticatedUser | undefined
    >();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(() => {
        const token = localStorage.getItem("token");
        return !!token; // Se tem token, começa true (carregando validação). Se não tem, começa false.
    });
    const isAuthenticated = !!authenticatedUser;

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

    const setLocalStorageUserData = (
        token: string,
        user: IAuthenticatedUser,
    ) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        setAuthenticatedUser(user);
    };

    const handleLogin = async ({ token, user }: IAuthenticationResponse) => {
        setLocalStorageUserData(token, user);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        delete api.defaults.headers.common["Authorization"];
        setAuthenticatedUser(undefined);

        navigate("/login", { replace: true });
    };

    const updateUserProfile = (newUser: IAuthenticatedUser) => {
        setAuthenticatedUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
    };

    const handleLoginSocial = async (response: any) => {
        console.log(response);
        setLocalStorageUserData(response.data.token, response.data.user);
    };

    const contextValue = useMemo(
        () => ({
            isAuthenticated,
            authenticatedUser,
            loading,
            handleLogin,
            handleLoginSocial,
            handleLogout,
            updateUserProfile,
        }),
        [authenticatedUser, loading, isAuthenticated],
    );

    return <AuthContext value={contextValue}> {children} </AuthContext>;
};

export { AuthContext };
