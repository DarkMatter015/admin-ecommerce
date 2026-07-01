import { ROLES } from "@/commons/roles_types";
import type { IUserResponse } from "@/commons/user_types";
import type { TagProps } from "primereact/tag";

/** Indica se o usuário possui o perfil de administrador. */
export const isAdminUser = (user: IUserResponse): boolean =>
    user.roles?.some((role) => role.name === ROLES.Admin) ?? false;

/** Rótulo amigável do perfil principal do usuário. */
export const getUserRoleLabel = (user: IUserResponse): string =>
    isAdminUser(user) ? "Administrador" : "Cliente";

/** Severidade visual (Tag PrimeReact) de acordo com o perfil. */
export const getRoleSeverity = (user: IUserResponse): TagProps["severity"] =>
    isAdminUser(user) ? "warning" : "info";

/** Formata um CPF (somente dígitos) no padrão 000.000.000-00. */
export const formatCpf = (cpf?: string | null): string => {
    if (!cpf) return "-";
    const digits = cpf.replace(/\D/g, "");
    if (digits.length !== 11) return cpf;
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};
