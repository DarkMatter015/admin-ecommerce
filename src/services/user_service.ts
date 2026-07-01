import type {
    IUserCreate,
    IUserResponse,
    IUserUpdatePayload,
} from "@/commons/user_types";
import { api } from "@/lib/axios";
import { normalizePage } from "@/utils/ServiceUtils";
import type { IPage, IResponse } from "./types/service_types";

const ROUTE = "/users";

type ApiUser = Record<string, any>;

const mapApiToUser = (item: ApiUser): IUserResponse => ({
    id: item.id,
    displayName: item.displayName ?? "",
    email: item.email ?? "",
    cpf: item.cpf ?? "",
    active: item.active ?? true,
    roles: Array.isArray(item.roles)
        ? item.roles.map((role: ApiUser) => ({
              id: role.id ?? null,
              active: role.active ?? null,
              name: role.name,
          }))
        : [],
});

/** Lista paginada de usuários (admin enxerga todos: clientes e administradores). */
export const getUsers = async (
    page = 0,
    size = 10,
): Promise<IPage<IUserResponse>> => {
    const { data } = await api.get(`${ROUTE}/page?page=${page}&size=${size}`);
    return normalizePage(data, mapApiToUser);
};

export const getUserById = async (id: number): Promise<IUserResponse> => {
    const { data } = await api.get(`${ROUTE}/${id}`);
    return mapApiToUser(data);
};

/**
 * Cria um novo usuário. Para criar um administrador, envie roles: ["ADMIN"].
 * A API só permite definir o perfil ADMIN se o solicitante for um admin autenticado.
 */
export const createUser = async (
    payload: IUserCreate,
): Promise<IUserResponse> => {
    const { data } = await api.post(ROUTE, {
        ...payload,
        cpf: payload.cpf.replace(/\D/g, ""),
    });
    return mapApiToUser(data);
};

export const updateUser = async (
    id: number,
    payload: IUserUpdatePayload,
): Promise<IUserResponse> => {
    const { data } = await api.patch(`${ROUTE}/${id}`, payload);
    return mapApiToUser(data);
};

/** Reativa um usuário inativado (soft delete). */
export const activateUser = async (id: number): Promise<IUserResponse> => {
    const { data } = await api.post(`${ROUTE}/activate/${id}`);
    return mapApiToUser(data);
};

/** Inativa (soft delete) um usuário. */
export const inactivateUser = async (
    id: number,
): Promise<IResponse | void> => {
    return await api.delete(`${ROUTE}/inactivate/${id}`);
};
