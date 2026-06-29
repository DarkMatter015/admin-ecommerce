import { TitlePage } from "@/components/layout/TitlePage";
import { UsersList } from "@/components/users/UsersList";

export const UsersPage = () => {
    return (
        <>
            <TitlePage title="Usuários" />
            <div className="users-page mx-4">
                <p>
                    Gerencie os usuários da plataforma. Cadastre novos
                    administradores e controle o acesso de clientes e
                    administradores.
                </p>
                <UsersList />
            </div>
        </>
    );
};
