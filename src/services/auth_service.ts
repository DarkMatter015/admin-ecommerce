import type {
    IAuthenticatedUser,
    IChangePassword,
    IForgotPassword,
    IResetPassword,
    IUserLogin,
    IUserRegister,
} from "@/commons/auth_types";
import type { IUser } from "@/commons/user_types";
import { api } from "@/lib/axios";
import type { IResponse } from "./service_types";

const ROUTE = "/auth";

/**
 * Função para realizar uma requisição HTTP para API para cadastrar um novo usuário
 * @param user - Dados do usuário que será cadastrado do tipo IUserRegister
 * @returns - Retorna a resposta da API
 */
export const signup = async (user: IUserRegister): Promise<IResponse> => {
    const data = await api.post("/users", user);
    return data;
};

/**
 * Função para realizar a autenticação do usuário
 * @param user - Dados do usuário que será autenticado do tipo IUserLogin (username e password)
 * @returns - Retorna a resposta da API
 * Além disso salva o token no localStorage e adiciona o token no cabeçalho da requisição
 */
export const login = async (user: IUserLogin) => {
    const data = await api.post(`${ROUTE}/login`, user);
    return data;
};

export const validateToken = async (
    token: string | null,
): Promise<IAuthenticatedUser> => {
    const { data } = await api.get(`${ROUTE}/validate`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return data.user;
};

export const updateProfile = async (user: IUser): Promise<IResponse> => {
    const data = await api.patch(`/users/${user.id}`, {
        displayName: user.displayName ? user.displayName : null,
        password: user.password ? user.password : null,
    });
    return data;
};

export const changePassword = async (
    changePassword: IChangePassword,
): Promise<void> => {
    await api.post(`${ROUTE}/change-password`, changePassword);
};

export const forgotPassword = async (
    forgotPassword: IForgotPassword,
): Promise<void> => {
    await api.post(`${ROUTE}/forgot-password`, forgotPassword);
};

export const validateResetToken = async (token: string): Promise<void> => {
    await api.get(`${ROUTE}/validate-reset-token?token=${token}`);
};

export const resetPassword = async (
    resetPassword: IResetPassword,
): Promise<void> => {
    await api.post(`${ROUTE}/reset-password`, resetPassword);
};
