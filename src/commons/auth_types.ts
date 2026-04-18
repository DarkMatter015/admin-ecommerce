export interface IUserRegister {
    email: string;
    displayName: string;
    cpf: string;
    password: string;
    confirmPassword: string;
}

export interface IUserLogin {
    email: string;
    password: string;
}

export interface IForgotPassword {
    email: string;
}

export interface IResetPassword {
    token: string;
    newPassword: string;
    confirmPassword: string;
}

// Interfaces para os dados de autenticação
export interface IAuthorities {
    authority: string;
}

export interface IAuthenticatedUser {
    id: number;
    email: string;
    displayName: string;
    authorities: IAuthorities[];
}

export interface IUserUpdate {
    id?: number;
    displayName?: string | null;
    email?: string | null;
}

export interface IChangePassword {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface IAuthenticationResponse {
    token: string;
    user: IAuthenticatedUser;
}