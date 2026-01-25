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
        <div className="min-h-screen mesh-gradient-premium flex items-center justify-center p-6">
            <div className="w-full max-w-xl animate-fade-in">
                <div className="text-center mb-12">
                    <button
                        onClick={handleBackToLogin}
                        className="mb-8 text-gold text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-2 mx-auto hover:opacity-70 transition-opacity"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Voltar para o login
                    </button>
                    <div className="h-48 flex items-center justify-center mb-12">
                        <img
                            alt="Ser Educacional"
                            className="h-full w-auto object-contain drop-shadow-[0_0_40px_rgba(212,175,55,0.4)]"
                            src="/assets/logo-ser.png"
                        />
                    </div>
                    <h1 className="text-4xl font-bold font-serif text-off-white italic mb-4">Primeiro <span className="text-gold-gradient">Acesso</span></h1>
                    <p className="text-off-white/40 text-sm font-light tracking-widest uppercase">Defina sua senha de segurança</p>
                </div>

                <GlassCard className="p-12 rounded-[3rem] border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold uppercase tracking-widest text-center">
                            {error}
                        </div>
                    )}

                    <div className="mb-8 p-6 bg-gold/5 border border-gold/10 rounded-2xl">
                        <p className="text-gold/80 text-xs leading-relaxed text-center">
                            Olá <span className="font-bold">{profile?.full_name || user?.primaryEmailAddress?.emailAddress}</span>, para sua segurança, você precisa definir uma nova senha em seu primeiro acesso ao sistema.
                        </p>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="space-y-8">
                        <div className="space-y-4">
                            <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-off-white/30 ml-2">Nova Senha</label>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-off-white/20 group-focus-within:text-gold transition-colors">lock</span>
                                <input
                                    required
                                    className="w-full bg-white/[0.03] border border-white/10 pl-16 pr-8 py-5 rounded-2xl text-off-white focus:border-gold/50 outline-none transition-all placeholder:text-off-white/10"
                                    placeholder="••••••••••••"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-off-white/30 ml-2">Confirmar Nova Senha</label>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-off-white/20 group-focus-within:text-gold transition-colors">lock_reset</span>
                                <input
                                    required
                                    className="w-full bg-white/[0.03] border border-white/10 pl-16 pr-8 py-5 rounded-2xl text-off-white focus:border-gold/50 outline-none transition-all placeholder:text-off-white/10"
                                    placeholder="••••••••••••"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            disabled={isLoading || !isUserLoaded}
                            className="w-full bg-gold hover:bg-gold-light text-navy-deep py-6 rounded-2xl font-bold text-[11px] uppercase tracking-[0.4em] shadow-2xl shadow-gold/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-3">
                                    <div className="size-4 border-2 border-navy-deep/30 border-t-navy-deep rounded-full animate-spin"></div>
                                    <span>Atualizando...</span>
                                </div>
                            ) : (
                                <span className="flex items-center justify-center gap-3">
                                    Confirmar Nova Senha
                                    <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">check_circle</span>
                                </span>
                            )}
                        </button>
                    </form>
                </GlassCard>

                <p className="text-center mt-12 text-[10px] font-bold text-off-white/20 uppercase tracking-[0.3em]">
                    © 2026 Ser Educacional • Segurança da Informação
                </p>
            </div>
        </div>
    );
};

export default FirstAccessPage;
