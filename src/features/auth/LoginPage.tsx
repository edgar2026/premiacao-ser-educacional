import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../components/ui/GlassCard';
import { supabase } from '../../lib/supabase';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            navigate('/admin');
        } catch (err: any) {
            setError(err.message || 'Erro ao realizar login');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen mesh-gradient-premium flex items-center justify-center p-6">
            <div className="w-full max-w-xl animate-fade-in">
                <div className="text-center mb-12">
                    <button
                        onClick={() => navigate('/')}
                        className="mb-8 text-gold text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-2 mx-auto hover:opacity-70 transition-opacity"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Voltar para o site
                    </button>
                    <div className="h-48 flex items-center justify-center mb-12">
                        <img
                            alt="Ser Educacional"
                            className="h-full w-auto object-contain drop-shadow-[0_0_40px_rgba(212,175,55,0.4)]"
                            src="/assets/logo-ser.png"
                        />
                    </div>
                    <h1 className="text-4xl font-bold font-serif text-off-white italic mb-4">Acesso <span className="text-gold-gradient">Restrito</span></h1>
                    <p className="text-off-white/40 text-sm font-light tracking-widest uppercase">Portal Administrativo Ser Educacional</p>
                </div>

                <GlassCard className="p-12 rounded-[3rem] border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold uppercase tracking-widest text-center">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleLogin} className="space-y-8">
                        <div className="space-y-4">
                            <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-off-white/30 ml-2">Identificação Institucional</label>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-off-white/20 group-focus-within:text-gold transition-colors">alternate_email</span>
                                <input
                                    required
                                    className="w-full bg-white/[0.03] border border-white/10 pl-16 pr-8 py-5 rounded-2xl text-off-white focus:border-gold/50 outline-none transition-all placeholder:text-off-white/10"
                                    placeholder="seu.email@sereducacional.com"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-off-white/30 ml-2">Chave de Segurança</label>
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

                        <div className="flex items-center justify-between px-2">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <input type="checkbox" className="size-5 rounded-lg bg-white/5 border-white/10 text-gold focus:ring-gold/20 transition-all" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-off-white/40 group-hover:text-off-white/60 transition-colors">Lembrar acesso</span>
                            </label>
                            <button type="button" className="text-[10px] font-bold uppercase tracking-widest text-gold/60 hover:text-gold transition-colors">Esqueci minha senha</button>
                        </div>

                        <button
                            disabled={isLoading}
                            className="w-full bg-gold hover:bg-gold-light text-navy-deep py-6 rounded-2xl font-bold text-[11px] uppercase tracking-[0.4em] shadow-2xl shadow-gold/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-3">
                                    <div className="size-4 border-2 border-navy-deep/30 border-t-navy-deep rounded-full animate-spin"></div>
                                    <span>Autenticando...</span>
                                </div>
                            ) : (
                                <span className="flex items-center justify-center gap-3">
                                    Entrar no Sistema
                                    <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">login</span>
                                </span>
                            )}
                        </button>
                    </form>
                </GlassCard>

                <p className="text-center mt-12 text-[10px] font-bold text-off-white/20 uppercase tracking-[0.3em]">
                    © 2026 Ser Educacional • Sistema de Gestão de Mérito
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
