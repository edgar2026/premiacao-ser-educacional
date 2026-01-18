import React from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
    variant?: 'public' | 'admin' | 'dashboard';
    userName?: string;
    userRole?: string;
    userPhoto?: string;
}

const Header: React.FC<HeaderProps> = ({ variant = 'public', userName, userRole, userPhoto }) => {
    if (variant === 'dashboard' || variant === 'admin') {
        return (
            <header className="flex items-center justify-between h-24 px-10 glass-header sticky top-0 z-20">
                <div className="flex items-center gap-8">
                    <div>
                        <h2 className="text-2xl font-extrabold tracking-tight text-white text-glow">
                            {variant === 'dashboard' ? 'Visão Estratégica' : 'Painel de Gestão'}
                        </h2>
                        <p className="text-xs text-blue-200 mt-0.5 font-medium">
                            {variant === 'dashboard' ? 'Performance institucional consolidada' : 'Administração Central'}
                        </p>
                    </div>
                    <div className="hidden xl:flex items-center bg-white/10 border border-white/10 px-5 py-2.5 rounded-full gap-3 min-w-[400px]">
                        <span className="material-symbols-outlined text-blue-200 text-[20px]">search</span>
                        <input
                            className="bg-transparent border-none focus:ring-0 text-sm w-full text-white placeholder:text-blue-200/50"
                            placeholder="Pesquisar métricas, unidades ou premiações..."
                            type="text"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 pr-6 border-r border-white/10">
                        <button className="size-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-all relative text-white">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-3 right-3 size-2 bg-blue-400 rounded-full ring-2 ring-navy-vibrant"></span>
                        </button>
                        <button className="size-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/10 transition-all text-white">
                            <span className="material-symbols-outlined">help</span>
                        </button>
                    </div>
                    <div className="flex items-center gap-4 pl-2">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-white leading-none">{userName || 'Dr. Janguiê Diniz'}</p>
                            <p className="text-[10px] text-blue-300 mt-1.5 uppercase font-bold tracking-widest">{userRole || 'Presidente Executivo'}</p>
                        </div>
                        <div
                            className="size-12 rounded-2xl bg-cover bg-center ring-2 ring-white/50 p-0.5 overflow-hidden"
                            style={{ backgroundImage: `url('${userPhoto || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBRsRpX1QSpbBqcP6OPtpT5s8j9EVGiFDWqABt0f1ty4XhpSqaY2_L8P5ByKSq6mwRBEFRAY6FZs68j9w6-eVsJAbLR_fp4J3j9cmx3D0cPZxwpTVsXu43aHAbI9RBPZKakwLjx3H5C8_jjKm8pbjC0JKQ_Z9c-Hv4PG4Ln5TyDXxBMUxkKvGwcV6hlmwf0stLiZa_gRdCAJuD9QDCZHrDo4W1Dz2wXiIhWaRDOQ_QqgqHQszP28HAy10Ir7GdUc1PlF5xan_v6CFhc'}')` }}
                        >
                            <div className="w-full h-full rounded-2xl border-2 border-transparent"></div>
                        </div>
                    </div>
                </div>
            </header>
        );
    }

    return (
        <header className="sticky top-0 z-50 w-full glass-header border-b border-white/5">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/" className="flex items-center gap-4 group">
                        <div className="h-20 flex items-center justify-center transition-transform group-hover:scale-105">
                            <img
                                alt="Ser Educacional"
                                className="h-full w-auto object-contain"
                                src="/assets/logo-final.png"
                            />
                        </div>
                    </Link>
                </div>

                <nav className="hidden md:flex items-center gap-12">
                    <Link
                        to="/"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="text-[10px] font-bold uppercase tracking-[0.3em] text-off-white/60 hover:text-gold transition-colors"
                    >
                        Início
                    </Link>
                    <Link to="/#premios" className="text-[10px] font-bold uppercase tracking-[0.3em] text-off-white/60 hover:text-gold transition-colors">Prêmios</Link>
                    <Link to="/#homenageados" className="text-[10px] font-bold uppercase tracking-[0.3em] text-off-white/60 hover:text-gold transition-colors">Homenageados</Link>
                </nav>

                <div className="flex items-center gap-6">
                    <Link
                        to="/login"
                        className="flex items-center justify-center size-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-off-white/40 hover:text-gold group"
                        title="Portal Administrativo"
                    >
                        <span className="material-symbols-outlined text-[20px] transition-transform group-hover:rotate-90">settings</span>
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;
