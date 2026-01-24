export const translateClerkError = (err: any): string => {
    const error = err.errors?.[0];
    if (!error) return 'Erro ao realizar operação';

    const code = error.code;
    const message = error.message;

    // Mapeamento de códigos comuns do Clerk
    const translations: Record<string, string> = {
        'form_password_pwned': 'Esta senha foi encontrada em um vazamento de dados na internet. Por segurança, escolha uma senha diferente.',
        'form_identifier_not_found': 'E-mail ou usuário não encontrado.',
        'form_password_incorrect': 'Senha incorreta. Tente novamente.',
        'form_param_format_invalid': 'Formato de e-mail inválido.',
        'user_not_found': 'Usuário não encontrado.',
        'form_identifier_not_found_in_instance': 'Usuário não encontrado neste sistema.',
        'strategy_for_user_invalid': 'Método de login inválido para este usuário.',
        'form_password_length_too_short': 'A senha deve ter pelo menos 8 caracteres.',
        'form_param_nil': 'Por favor, preencha todos os campos.',
        'session_exists': 'Você já possui uma sessão ativa. Por favor, recarregue a página ou faça logout.',
    };

    if (translations[code]) {
        return translations[code];
    }

    // Se for a mensagem específica de vazamento mas o código for diferente
    if (message?.toLowerCase().includes('data breach')) {
        return 'Esta senha foi encontrada em um vazamento de dados na internet. Por segurança, escolha uma senha diferente.';
    }

    // Fallback para a mensagem original ou uma genérica
    return message || 'Erro ao realizar login';
};
