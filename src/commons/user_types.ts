import type { IRole } from "./auth_types";

export interface IUser {
    id?: number;
    displayName?: string | null;
    password?: string | null;
}

/** Usuário retornado pela API (GET /users, /users/page, /users/{id}). */
export interface IUserResponse {
    id: number;
    displayName: string;
    email: string;
    cpf: string;
    active: boolean;
    roles: IRole[];
}

/** Payload para criação de usuário/administrador (POST /users). */
export interface IUserCreate {
    email: string;
    displayName: string;
    cpf: string;
    password: string;
    roles: string[];
}

/** Payload para atualização de usuário (PATCH /users/{id}). */
export interface IUserUpdatePayload {
    displayName?: string;
    email?: string;
    roles?: string[];
}

/** Modelo do formulário de criação de administrador/usuário. */
export interface IUserForm {
    displayName: string;
    email: string;
    cpf: string;
    password: string;
    confirmPassword: string;
    role: string;
}