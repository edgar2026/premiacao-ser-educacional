import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignIn, useUser } from '@clerk/clerk-react';
import { translateClerkError } from '../../utils/clerkTranslations';
import { motion } from 'framer-motion';

const LoginPage: React.FC = () => {
    const { isLoaded, signIn, setActive } = useSignIn();
    const { isSignedIn } = useUser();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showResetForm, setShowResetForm] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    
    const navigate = useNavigate();

    // Redireciona se já estiver logado
    React.useEffect(() => {
        if (isLoaded && isSignedIn) {
            navigate('/admin');
        }
    }, [isLoaded, isSignedIn, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoaded) return;

        setIsLoading(true);
        setError(null);

        try {
            const result = await signIn.create({
                strategy: 'password',
                identifier: email,
                password,
            });

            if (result.status === 'complete') {
                await setActive({ session: result.createdSessionId });
                navigate('/admin');
            } else {
                setError('Login incompleto. Verifique suas credenciais.');
            }
        } catch (err: any) {
            console.error('Erro no login:', err);
            setError(translateClerkError(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isLoaded) return;

        setIsLoading(true);
        setError(null);

        try {
            await signIn.create({
                strategy: 'reset_password_email_code',
                identifier: email,
            });
            setResetSent(true);
        } catch (err: any) {
            console.error('Erro na recuperação:', err);
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

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-10">
                    <button
                        onClick={() => navigate('/')}
                        className="mb-8 text-brand-text-secondary text-[12px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 mx-auto hover:text-brand-blue transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                        Voltar para o site
                    </button>
                    <div className="h-24 flex items-center justify-center mb-8">
                        <img
                            alt="Ser Educacional"
                            className="h-full w-auto object-contain brightness-0"
                            src="/assets/logo-ser.png"
                        />
                    </div>
                    <h1 className="text-[32px] font-[800] text-brand-dark tracking-tight mb-2">
                        {showResetForm ? 'Recuperar Acesso' : 'Área Restrita'}
                    </h1>
                    <p className="text-brand-text-secondary text-[14px] font-medium uppercase tracking-widest opacity-60">
                        {showResetForm ? 'Portal de Segurança' : 'Painel Administrativo'}
                    </p>
                </div>

                <div className="card-static p-8 md:p-10">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-[13px] font-bold text-center">
                            {error}
                        </div>
                    )}

                    {showResetForm ? (
                        resetSent ? (
                            <div className="text-center space-y-6">
                                <div className="size-16 bg-brand-blue/10 flex items-center justify-center mx-auto mb-6">
                                    <span className="material-symbols-outlined text-brand-blue text-3xl">mail</span>
                                </div>
                                <h2 className="text-xl font-bold text-brand-dark">Código Enviado!</h2>
                                <p className="text-brand-text-secondary text-sm leading-relaxed">
                                    Verifique seu e-mail institucional. Enviamos um código para redefinição de senha.
                                </p>
                                <button
                                    onClick={() => navigate('/redefinir-senha', { state: { email } })}
                                    className="btn-premium w-full"
                                >
                                    Inserir Código
                                </button>
                                <button
                                    onClick={() => setShowResetForm(false)}
                                    className="text-[12px] font-bold uppercase tracking-widest text-brand-text-secondary hover:text-brand-blue transition-colors"
                                >
                                    Voltar para Login
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleResetPassword} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-[700] uppercase tracking-[0.1em] text-brand-text-secondary ml-1">E-mail Institucional</label>
                                    <div className="relative group">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-secondary/40 group-focus-within:text-brand-blue transition-colors">alternate_email</span>
                                        <input
                                            required
                                            className="w-full bg-white border border-brand-gray pl-12 pr-4 py-4 text-brand-dark focus:border-brand-blue outline-none transition-all placeholder:text-brand-text-secondary/30 text-[15px]"
                                            placeholder="seu.email@sereducacional.com"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <button
                                    disabled={isLoading}
                                    className="btn-premium w-full"
                                >
                                    {isLoading ? 'Enviando...' : 'Solicitar Código'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowResetForm(false)}
                                    className="w-full text-center text-[12px] font-bold uppercase tracking-widest text-brand-text-secondary hover:text-brand-blue transition-colors"
                                >
                                    Cancelar
                                </button>
                            </form>
                        )
                    ) : (
                        <form onSubmit={handleLogin} className="space-y-6" autoComplete="off">
                            <div className="space-y-2">
                                <label className="block text-[11px] font-[700] uppercase tracking-[0.1em] text-brand-text-secondary ml-1">E-mail</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-secondary/40 group-focus-within:text-brand-blue transition-colors text-[20px]">alternate_email</span>
                                    <input
                                        required
                                        className="w-full bg-white border border-brand-gray pl-12 pr-4 py-4 text-brand-dark focus:border-brand-blue outline-none transition-all placeholder:text-brand-text-secondary/30 text-[15px]"
                                        placeholder="seu.email@sereducacional.com"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[11px] font-[700] uppercase tracking-[0.1em] text-brand-text-secondary ml-1">Senha</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-secondary/40 group-focus-within:text-brand-blue transition-colors text-[20px]">lock</span>
                                    <input
                                        required
                                        className="w-full bg-white border border-brand-gray pl-12 pr-4 py-4 text-brand-dark focus:border-brand-blue outline-none transition-all placeholder:text-brand-text-secondary/30 text-[15px]"
                                        placeholder="••••••••••••"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={() => setShowResetForm(true)}
                                    className="text-[11px] font-bold uppercase tracking-widest text-brand-text-secondary hover:text-brand-blue transition-colors"
                                >
                                    Esqueci minha senha
                                </button>
                            </div>

                            <button
                                disabled={isLoading}
                                className="btn-premium w-full flex items-center justify-center gap-3"
                            >
                                {isLoading ? (
                                    <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Entrar no Painel
                                        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>

                <p className="text-center mt-10 text-[10px] font-bold text-brand-text-secondary/30 uppercase tracking-[0.3em]">
                    © 2026 Ser Educacional • Plataforma Institucional
                </p>
            </motion.div>
        </div>
    );
};

export default LoginPage;
