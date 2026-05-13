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
            <div className="min-h-screen bg-bg-main flex items-center justify-center p-6 relative overflow-hidden font-sans">
                {/* Background */}
                <div className="fixed inset-0 z-0 pointer-events-none">
                    <img src="/assets/tech_award_bg.png" alt="Background" className="w-full h-full object-cover opacity-100" />
                </div>

                <div className="w-full max-w-md text-center relative z-10 animate-fade-in">
                    <div className="mb-8 text-brand-blue">
                        <span className="material-symbols-outlined text-[64px] animate-bounce">check_circle</span>
                    </div>
                    <h1 className="text-[32px] font-[800] text-brand-dark tracking-tight mb-4">Senha Alterada</h1>
                    <p className="text-brand-text-secondary text-[15px] mb-8 leading-relaxed">
                        Sua senha foi redefinida com sucesso. Você será redirecionado para o painel em instantes.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate('/admin')}
                            className="btn-premium w-full sm:w-auto"
                        >
                            Ir para o Painel Agora
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="text-[12px] font-bold uppercase tracking-widest text-brand-text-secondary hover:text-brand-blue transition-colors w-full sm:w-auto"
                        >
                            Voltar para o Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg-main flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <img src="/assets/tech_award_bg.png" alt="Background" className="w-full h-full object-cover opacity-100" />
            </div>

            <div className="w-full max-w-md relative z-10 animate-fade-in">
                <div className="text-center mb-10">
                    <div className="h-24 flex items-center justify-center mb-8">
                        <img
                            alt="Ser Educacional"
                            className="h-full w-auto object-contain brightness-0"
                            src="/assets/logo-ser.png"
                        />
                    </div>
                    <h1 className="text-[32px] font-[800] text-brand-dark tracking-tight mb-2">Redefinir Senha</h1>
                    <p className="text-brand-text-secondary text-[14px] font-medium uppercase tracking-widest opacity-60">
                        Crie sua nova chave de acesso
                    </p>
                </div>

                <div className="card-static p-8 md:p-10">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-[13px] font-bold text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleUpdatePassword} className="space-y-6">
                        <div className="space-y-3">
                            <label className="block text-[11px] font-bold uppercase tracking-[0.2em] text-brand-text-secondary">Código de Verificação</label>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-brand-text-secondary/50 group-focus-within:text-brand-blue transition-colors">pin</span>
                                <input
                                    required
                                    className="w-full bg-bg-main border border-brand-gray pl-14 pr-4 py-4 rounded-xl text-brand-dark focus:border-brand-blue/50 outline-none transition-all placeholder:text-brand-text-secondary/50 font-medium"
                                    placeholder="Código enviado por e-mail"
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                />
                            </div>
                        </div>

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
                            disabled={isLoading || !isLoaded}
                            className="btn-premium w-full mt-4 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Atualizando...
                                </>
                            ) : (
                                <>
                                    Atualizar Senha
                                    <span className="material-symbols-outlined text-[18px]">published_with_changes</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center mt-12 text-[10px] font-bold text-brand-text-secondary/50 uppercase tracking-[0.3em]">
                    © 2026 Ser Educacional • Recuperação de Identidade
                </p>
            </div>
        </div>
    );
};

export default UpdatePasswordPage;
