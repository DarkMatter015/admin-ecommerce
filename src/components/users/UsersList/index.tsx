import { ROLES } from "@/commons/roles_types";
import type { IUserResponse } from "@/commons/user_types";
import { useAuth } from "@/context/hooks/use-auth";
import { useToast } from "@/context/hooks/use-toast";
import { ToastSeverity } from "@/context/ToastContext";
import {
    activateUser,
    getUsers,
    inactivateUser,
    updateUser,
} from "@/services/user_service";
import {
    formatCpf,
    getRoleSeverity,
    getUserRoleLabel,
    isAdminUser,
} from "@/utils/UserUtils";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable, type DataTablePageEvent } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { useCallback, useEffect, useMemo, useState } from "react";
import { UserFormModal } from "../UserFormModal";

const PAGE_SIZE = 10;

const ROLE_FILTER_OPTIONS = [
    { label: "Administradores", value: ROLES.Admin },
    { label: "Clientes", value: ROLES.User },
];

export const UsersList = () => {
    const { authenticatedUser } = useAuth();
    const { showToast, showConfirmDialog } = useToast();

    const [users, setUsers] = useState<IUserResponse[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(false);
    const [actionId, setActionId] = useState<number | null>(null);

    const [roleFilter, setRoleFilter] = useState<string | null>(null);
    const [searchFilter, setSearchFilter] = useState("");

    const [createModalVisible, setCreateModalVisible] = useState(false);

    const fetchUsers = useCallback(async (pageNumber: number) => {
        setLoading(true);
        try {
            const data = await getUsers(pageNumber, PAGE_SIZE);
            setUsers(data.content);
            setTotalRecords(data.totalElements);
        } catch (error) {
            console.error("Erro ao buscar usuários:", error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers(page);
    }, [fetchUsers, page]);

    const handleRefresh = useCallback(() => {
        fetchUsers(page);
    }, [fetchUsers, page]);

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const matchesRole = roleFilter
                ? roleFilter === ROLES.Admin
                    ? isAdminUser(user)
                    : !isAdminUser(user)
                : true;
            const term = searchFilter.trim().toLowerCase();
            const matchesSearch = term
                ? user.displayName.toLowerCase().includes(term) ||
                  user.email.toLowerCase().includes(term) ||
                  user.cpf.includes(term.replace(/\D/g, ""))
                : true;
            return matchesRole && matchesSearch;
        });
    }, [users, roleFilter, searchFilter]);

    const handlePage = (event: DataTablePageEvent) => {
        setPage(event.page ?? 0);
    };

    const clearFilters = () => {
        setRoleFilter(null);
        setSearchFilter("");
    };

    const handleToggleRole = (user: IUserResponse) => {
        const makeAdmin = !isAdminUser(user);
        const newRole = makeAdmin ? ROLES.Admin : ROLES.User;
        showConfirmDialog(
            makeAdmin ? "Promover a administrador" : "Tornar cliente",
            makeAdmin
                ? `Conceder acesso administrativo para "${user.displayName}"?`
                : `Remover o acesso administrativo de "${user.displayName}"?`,
            "pi pi-exclamation-triangle",
            makeAdmin ? "p-button-warning" : "p-button-danger",
            async () => {
                setActionId(user.id);
                try {
                    await updateUser(user.id, { roles: [newRole] });
                    showToast(
                        ToastSeverity.SUCCESS,
                        "Sucesso",
                        "Perfil do usuário atualizado!",
                    );
                    handleRefresh();
                } catch (error: any) {
                    console.error("Erro ao atualizar perfil:", error);
                    showToast(
                        ToastSeverity.ERROR,
                        "Erro",
                        error.response?.data?.message ||
                            "Erro ao atualizar perfil do usuário.",
                    );
                } finally {
                    setActionId(null);
                }
            },
        );
    };

    const handleToggleActive = (user: IUserResponse) => {
        const inactivate = user.active;
        showConfirmDialog(
            inactivate ? "Inativar usuário" : "Reativar usuário",
            inactivate
                ? `Deseja inativar o acesso de "${user.displayName}"?`
                : `Deseja reativar o acesso de "${user.displayName}"?`,
            "pi pi-exclamation-triangle",
            inactivate ? "p-button-danger" : "p-button-success",
            async () => {
                setActionId(user.id);
                try {
                    if (inactivate) {
                        await inactivateUser(user.id);
                    } else {
                        await activateUser(user.id);
                    }
                    showToast(
                        ToastSeverity.SUCCESS,
                        "Sucesso",
                        inactivate
                            ? "Usuário inativado com sucesso!"
                            : "Usuário reativado com sucesso!",
                    );
                    handleRefresh();
                } catch (error: any) {
                    console.error("Erro ao alterar status:", error);
                    showToast(
                        ToastSeverity.ERROR,
                        "Erro",
                        error.response?.data?.message ||
                            "Erro ao alterar status do usuário.",
                    );
                } finally {
                    setActionId(null);
                }
            },
        );
    };

    const userBody = (user: IUserResponse) => (
        <div className="flex flex-column">
            <span className="font-medium text-900">{user.displayName}</span>
            <span className="text-500 text-sm">{user.email}</span>
        </div>
    );

    const cpfBody = (user: IUserResponse) => formatCpf(user.cpf);

    const roleBody = (user: IUserResponse) => (
        <Tag value={getUserRoleLabel(user)} severity={getRoleSeverity(user)} />
    );

    const statusBody = (user: IUserResponse) => (
        <Tag
            value={user.active ? "Ativo" : "Inativo"}
            severity={user.active ? "success" : "danger"}
        />
    );

    const actionsBody = (user: IUserResponse) => {
        const isSelf = user.id === authenticatedUser?.id;
        const busy = actionId === user.id;
        return (
            <div className="flex gap-1 justify-content-center">
                <Button
                    icon={
                        isAdminUser(user)
                            ? "pi pi-user-minus"
                            : "pi pi-user-plus"
                    }
                    rounded
                    text
                    severity={isAdminUser(user) ? "danger" : "warning"}
                    tooltip={
                        isAdminUser(user)
                            ? "Tornar cliente"
                            : "Promover a administrador"
                    }
                    tooltipOptions={{ position: "top" }}
                    loading={busy}
                    disabled={isSelf || busy}
                    onClick={() => handleToggleRole(user)}
                />
                <Button
                    icon={user.active ? "pi pi-ban" : "pi pi-check-circle"}
                    rounded
                    text
                    severity={user.active ? "danger" : "success"}
                    tooltip={user.active ? "Inativar" : "Reativar"}
                    tooltipOptions={{ position: "top" }}
                    loading={busy}
                    disabled={isSelf || busy}
                    onClick={() => handleToggleActive(user)}
                />
            </div>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row gap-3 md:align-items-end justify-content-between">
            <div className="flex flex-column md:flex-row gap-3">
                <div className="flex flex-column">
                    <label className="text-sm text-500 mb-1">
                        <i className="pi pi-id-card mr-1" />
                        Perfil
                    </label>
                    <Dropdown
                        value={roleFilter}
                        options={ROLE_FILTER_OPTIONS}
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Todos"
                        showClear
                        className="w-12rem"
                        onChange={(e) => setRoleFilter(e.value)}
                    />
                </div>
                <div className="flex flex-column">
                    <label className="text-sm text-500 mb-1">
                        <i className="pi pi-search mr-1" />
                        Buscar
                    </label>
                    <span className="p-input-icon-left">
                        <i className="pi pi-search" />
                        <InputText
                            value={searchFilter}
                            placeholder="Nome, e-mail ou CPF"
                            onChange={(e) => setSearchFilter(e.target.value)}
                        />
                    </span>
                </div>
            </div>
            <div className="flex gap-2 align-items-end">
                {(roleFilter || searchFilter) && (
                    <Button
                        label="Limpar"
                        icon="pi pi-filter-slash"
                        outlined
                        onClick={clearFilters}
                    />
                )}
                <Button
                    label="Novo Usuário"
                    icon="pi pi-user-plus"
                    severity="success"
                    onClick={() => setCreateModalVisible(true)}
                />
            </div>
        </div>
    );

    return (
        <div className="users-list">
            <UserFormModal
                visible={createModalVisible}
                setVisible={setCreateModalVisible}
                onSuccess={handleRefresh}
            />

            <DataTable
                value={filteredUsers}
                header={header}
                loading={loading}
                lazy
                paginator
                rows={PAGE_SIZE}
                totalRecords={totalRecords}
                first={page * PAGE_SIZE}
                onPage={handlePage}
                dataKey="id"
                emptyMessage="Nenhum usuário encontrado"
                responsiveLayout="scroll"
            >
                <Column
                    field="id"
                    header="ID"
                    body={(user: IUserResponse) => `#${user.id}`}
                    style={{ width: "5rem" }}
                />
                <Column header="Usuário" body={userBody} />
                <Column header="CPF" body={cpfBody} />
                <Column header="Perfil" body={roleBody} />
                <Column header="Status" body={statusBody} />
                <Column
                    header="Ações"
                    body={actionsBody}
                    style={{ width: "8rem", textAlign: "center" }}
                />
            </DataTable>
        </div>
    );
};
