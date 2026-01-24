import { supabase } from '../lib/supabase';

interface EmailParams {
    email: string;
    username?: string;
    context: 'first_access' | 'reset_password';
}

/**
 * Envia e-mail de confirmação de troca de senha via Edge Function.
 * Este fluxo é resiliente: falhas no envio de e-mail não devem interromper o fluxo do usuário.
 */
export const sendPasswordChangedEmail = async ({ email, username, context }: EmailParams) => {
    try {
        console.log(`[Email Notification] Iniciando envio para ${email} (Contexto: ${context})`);

        const { data, error } = await supabase.functions.invoke('send-password-changed-email', {
            body: {
                email,
                username: username || email.split('@')[0],
                context
            },
        });

        if (error) {
            throw error;
        }

        console.log('[Email Notification] E-mail enviado com sucesso:', data);
        return { success: true, data };
    } catch (error: any) {
        // Regra Crítica: Falhas no envio de e-mail são apenas logadas internamente
        // Nunca devem ser exibidas ao usuário final ou bloquear o fluxo
        console.error('[Email Notification] Erro crítico ao enviar e-mail:', {
            context,
            timestamp: new Date().toISOString(),
            error: error.message || error,
            email
        });

        return { success: false, error };
    }
};
