import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSignIn } from '@clerk/clerk-react';
import GlassCard from '../../components/ui/GlassCard';
import { sendPasswordChangedEmail } from '../../utils/notifications';
import { translateClerkError } from '../../utils/clerkTranslations';

const UpdatePasswordPage: React.FC = () => {
    const { isLoaded, signIn, setActive } = useSignIn();
    const location = useLocation();
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const email = location.state?.email || '';

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoaded) return;

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
            const result = await signIn.attemptFirstFactor({
                strategy: 'reset_password_email_code',
                code,
                password,
            });

            if (result.status === 'complete') {
                await setActive({ session: result.createdSessionId });
                setSuccess(true);

                // Envia e-mail de confirmação (Fire and Forget)
                sendPasswordChangedEmail({
                    email: email,
                    context: 'reset_password'
                });

                setTimeout(() => {
                    navigate('/admin');
                }, 3000);
            } else {
                console.log(result);
                setError('Erro ao redefinir senha. Verifique o código.');
            }
        } catch (err: any) {
            console.error('Erro ao redefinir senha:', err);
            setError(translateClerkError(err));
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen mesh-gradient-premium flex items-center justify-center p-6">
                <div className="w-full max-w-xl text-center animate-fade-in">
                    <div className="mb-8 text-gold">
                        <span className="material-symbols-outlined text-8xl animate-bounce">check_circle</span>
                    </div>
                    <h1 className="text-4xl font-bold font-serif text-off-white italic mb-4">Senha <span className="text-gold-gradient">Alterada</span></h1>
                    <p className="text-off-white/60 mb-8">Sua senha foi redefinida com sucesso. Você será redirecionado para o painel em instantes.</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate('/admin')}
                            className="w-full sm:w-auto bg-gold text-navy-deep px-8 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-gold-light transition-all shadow-lg shadow-gold/20"
                        >
                            Ir para o Painel Agora
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full sm:w-auto bg-white/5 border border-white/10 text-off-white/60 px-8 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-white/10 hover:text-off-white transition-all"
                        >
                            Voltar para o Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen mesh-gradient-premium flex items-center justify-center p-6">
            <div className="w-full max-w-xl animate-fade-in">
                <div className="text-center mb-12">
                    <div className="h-48 flex items-center justify-center mb-12">
                        <img
                            alt="Ser Educacional"
                            className="h-full w-auto object-contain drop-shadow-[0_0_40px_rgba(212,175,55,0.4)]"
                            src="/assets/logo-ser.png"
                        />
                    </div>
                    <h1 className="text-4xl font-bold font-serif text-off-white italic mb-4">Redefinir <span className="text-gold-gradient">Senha</span></h1>
                    <p className="text-off-white/40 text-sm font-light tracking-widest uppercase">Crie sua nova chave de acesso</p>
                </div>

                <GlassCard className="p-12 rounded-[3rem] border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold uppercase tracking-widest text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleUpdatePassword} className="space-y-8">
                        <div className="space-y-4">
                            <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-off-white/30 ml-2">Código de Verificação</label>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-off-white/20 group-focus-within:text-gold transition-colors">pin</span>
                                <input
                                    required
                                    className="w-full bg-white/[0.03] border border-white/10 pl-16 pr-8 py-5 rounded-2xl text-off-white focus:border-gold/50 outline-none transition-all placeholder:text-off-white/10"
                                    placeholder="Digite o código enviado por e-mail"
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                />
                            </div>
                        </div>

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
                            disabled={isLoading || !isLoaded}
                            className="w-full bg-gold hover:bg-gold-light text-navy-deep py-6 rounded-2xl font-bold text-[11px] uppercase tracking-[0.4em] shadow-2xl shadow-gold/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-3">
                                    <div className="size-4 border-2 border-navy-deep/30 border-t-navy-deep rounded-full animate-spin"></div>
                                    <span>Atualizando...</span>
                                </div>
                            ) : (
                                <span className="flex items-center justify-center gap-3">
                                    Atualizar Senha
                                    <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">published_with_changes</span>
                                </span>
                            )}
                        </button>
                    </form>
                </GlassCard>

                <p className="text-center mt-12 text-[10px] font-bold text-off-white/20 uppercase tracking-[0.3em]">
                    © 2026 Ser Educacional • Recuperação de Identidade
                </p>
            </div>
        </div>
    );
};

export default UpdatePasswordPage;
