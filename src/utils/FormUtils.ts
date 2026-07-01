export const PASSWORD_CRITERIA = [
    { label: "Pelo menos 6 caracteres", regex: /.{6,}/ },
    { label: "Pelo menos uma letra minúscula (a-z)", regex: /[a-z]/ },
    { label: "Pelo menos uma letra maiúscula (A-Z)", regex: /[A-Z]/ },
    { label: "Pelo menos um número (0-9)", regex: /\d/ },
    {
        label: "Pelo menos um caractere especial (@, $, !, %, *, ?, &)",
        regex: /[@$!%*?&]/,
    },
] as const;

type ValidationType = 'email' | 'cpf' | 'password' | 'numeric';

export interface ValidationOptions {
    label?: string; // e.g. "Nome", "Senha"
    required?: boolean | string;
    minLength?: number | { value: number; message: string };
    maxLength?: number | { value: number; message: string };
    min?: number | { value: number; message: string };
    max?: number | { value: number; message: string };
    type?: ValidationType;
    custom?: (value: any) => boolean | string;
    pattern?: { value: RegExp; message: string };
}

export const createValidationRules = (options: ValidationOptions) => {
    const rules: any = {};
    const label = options.label || "Campo";

    // Required
    if (options.required) {
        rules.required = typeof options.required === 'string'
            ? options.required
            : `${label} é obrigatório(a)`;
    }

    // MinLength
    if (options.minLength) {
        if (typeof options.minLength === 'number') {
            rules.minLength = {
                value: options.minLength,
                message: `${label} deve ter no mínimo ${options.minLength} caracteres`
            };
        } else {
            rules.minLength = options.minLength;
        }
    }

    // MaxLength
    if (options.maxLength) {
        if (typeof options.maxLength === 'number') {
            rules.maxLength = {
                value: options.maxLength,
                message: `${label} deve ter no máximo ${options.maxLength} caracteres`
            };
        } else {
            rules.maxLength = options.maxLength;
        }
    }

    // Min
    if (options.min) {
        if (typeof options.min === 'number') {
            rules.min = {
                value: options.min,
                message: `${label} deve ser no mínimo ${options.min}`
            };
        } else {
            rules.min = options.min;
        }
    }

    // Max
    if (options.max) {
        if (typeof options.max === 'number') {
            rules.max = {
                value: options.max,
                message: `${label} deve ser no máximo ${options.max}`
            };
        } else {
            rules.max = options.max;
        }
    }

    // Patterns / Types
    if (options.type === 'email') {
        rules.pattern = {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "Email inválido"
        };
    }

    if (options.type === 'cpf') {
        rules.pattern = {
            value: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
            message: "CPF inválido"
        };
    }

    if (options.type === 'password') {
        // Complex password validation
        rules.validate = (value: string) => {
            if (!value) return true; // Let required handle empty
            for (const criteria of PASSWORD_CRITERIA) {
                if (!criteria.regex.test(value))
                    return "A senha não atende a todos os critérios.";
            }
            return true;
        };
    }

    if (options.pattern) {
        rules.pattern = options.pattern;
    }

    if (options.custom) {
        const existingValidate = rules.validate;
        rules.validate = (value: any) => {
            if (existingValidate) {
                const result = existingValidate(value);
                if (result !== true) return result;
            }
            return options.custom!(value);
        };
    }

    return rules;
};

// Backward compatibility (optional, or refactor usages)
export const VALIDATION_RULES = {
    displayName: createValidationRules({ label: "Nome", required: true, minLength: 3 }),
    email: createValidationRules({ label: "Email", required: true, type: 'email' }),
    cpf: createValidationRules({ label: "CPF", required: "Cpf é obrigatório", type: 'cpf' }),
    password: {
        ...createValidationRules({ label: "Senha", required: true, minLength: 6 }),
        validate: (value: string) => {
            for (const criteria of PASSWORD_CRITERIA) {
                if (!criteria.regex.test(value))
                    return "A senha não atende a todos os critérios.";
            }
            return true;
        }
    }
} as const;
