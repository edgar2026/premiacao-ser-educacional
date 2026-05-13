import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import GlassCard from '../../components/ui/GlassCard';
import { useAuth } from './AuthContext';
import { sendPasswordChangedEmail } from '../../utils/notifications';
import { translateClerkError } from '../../utils/clerkTranslations';

const FirstAccessPage: React.FC = () => {
    const { user, isLoaded: isUserLoaded } = useUser();
    const { signOut } = useClerk();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { profile } = useAuth();
    const navigate = useNavigate();

    const handleBackToLogin = async () => {
        await signOut();
        navigate('/login');
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isUserLoaded || !user) return;

        if (password !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        if (password.length < 8) {
            setError('A senha deve ter pelo menos 8 caracteres');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // 1. Atualiza a senha no Clerk (100% Clerk Auth)
            await user.updatePassword({
                newPassword: password
            });

            // 2. Envia e-mail de confirmação
            sendPasswordChangedEmail({
                email: user.primaryEmailAddress?.emailAddress || '',
                username: profile?.full_name || user.firstName || user.username || user.primaryEmailAddress?.emailAddress?.split('@')[0],
                context: 'first_access'
            });

            // 3. Faz logout e redireciona para o login para validar a nova senha
            setTimeout(async () => {
                await signOut();
                navigate('/login', { state: { message: 'Senha definida com sucesso! Por favor, faça login com sua nova senha.' } });
            }, 1000);

        } catch (err: any) {
            console.error('Erro no fluxo de primeiro acesso:', err);
            setError(translateClerkError(err));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg-main flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <img src="/assets/tech_award_bg.png" alt="Background" className="w-full h-full object-cover opacity-100" />
            </div>

            <div className="w-full max-w-md relative z-10 animate-fade-in">
                <div className="text-center mb-10">
                    <button
                        onClick={handleBackToLogin}
                        className="mb-8 text-brand-text-secondary text-[12px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 mx-auto hover:text-brand-blue transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Voltar para o login
                    </button>
                    <div className="h-24 flex items-center justify-center mb-8">
                        <img
                            alt="Ser Educacional"
                            className="h-full w-auto object-contain brightness-0"
                            src="/assets/logo-ser.png"
                        />
                    </div>
                    <h1 className="text-[32px] font-[800] text-brand-dark tracking-tight mb-2">Primeiro Acesso</h1>
                    <p className="text-brand-text-secondary text-[14px] font-medium uppercase tracking-widest opacity-60">
                        Defina sua senha de segurança
                    </p>
                </div>

                <div className="card-static p-8 md:p-10">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-[13px] font-bold text-center">
                            {error}
                        </div>
                    )}

                    <div className="mb-8 p-4 bg-brand-blue/5 border border-brand-blue/10 rounded-xl">
                        <p className="text-brand-text-secondary text-xs leading-relaxed text-center">
                            Olá <span className="font-bold text-brand-dark">{profile?.full_name || user?.primaryEmailAddress?.emailAddress}</span>, para sua segurança, você precisa definir uma nova senha em seu primeiro acesso ao sistema.
                        </p>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="space-y-6">
                        <div className="space-y-3">
                            <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-brand-text-secondary">Nova Senha</label>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-brand-text-secondary/50 group-focus-within:text-brand-blue transition-colors">lock</span>
                                <input
                                    required
                                    className="w-full bg-bg-main border border-brand-gray pl-14 pr-4 py-4 rounded-xl text-brand-dark focus:border-brand-blue/50 outline-none transition-all placeholder:text-brand-text-secondary/50 font-medium"
                                    placeholder="••••••••••••"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-brand-text-secondary">Confirmar Nova Senha</label>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-brand-text-secondary/50 group-focus-within:text-brand-blue transition-colors">lock_reset</span>
                                <input
                                    required
                                    className="w-full bg-bg-main border border-brand-gray pl-14 pr-4 py-4 rounded-xl text-brand-dark focus:border-brand-blue/50 outline-none transition-all placeholder:text-brand-text-secondary/50 font-medium"
                                    placeholder="••••••••••••"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            disabled={isLoading || !isUserLoaded}
                            className="btn-premium w-full mt-4 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Atualizando...
                                </>
                            ) : (
                                <>
                                    Confirmar Nova Senha
                                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center mt-12 text-[10px] font-bold text-brand-text-secondary/50 uppercase tracking-[0.3em]">
                    © 2026 Ser Educacional • Segurança da Informação
                </p>
            </div>
        </div>
    );
};

export default FirstAccessPage;
