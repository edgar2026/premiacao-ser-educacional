import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';

interface HeaderProps {
    variant?: 'public' | 'admin' | 'dashboard';
    userName?: string;
    userRole?: string;
    userPhoto?: string;
}

const Header: React.FC<HeaderProps> = ({ variant = 'public', userName, userRole, userPhoto }) => {
    if (variant === 'dashboard' || variant === 'admin') {
        return (
            <header className="flex items-center justify-between h-24 px-10 bg-white border-b border-brand-gray sticky top-0 z-20">
                <div className="flex items-center gap-8">
                    <div>
                        <h2 className="text-2xl font-[800] tracking-tight text-brand-dark">
                            {variant === 'dashboard' ? 'Visão Estratégica' : 'Painel de Gestão'}
                        </h2>
                        <p className="text-[11px] text-brand-blue mt-0.5 font-[800] uppercase tracking-widest opacity-70">
                            {variant === 'dashboard' ? 'Performance institucional consolidada' : 'Administração Central'}
                        </p>
                    </div>
                    <div className="hidden xl:flex items-center bg-bg-main border border-brand-gray px-6 py-3 rounded-2xl gap-3 min-w-[450px] shadow-sm">
                        <span className="material-symbols-outlined text-brand-text-secondary/40 text-[20px] font-bold">search</span>
                        <input
                            className="bg-transparent border-none focus:ring-0 text-sm w-full text-brand-dark placeholder:text-brand-text-secondary/30 font-medium"
                            placeholder="Pesquisar métricas, unidades ou premiações..."
                            type="text"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 pr-6 border-r border-brand-gray">
                        <button className="size-12 flex items-center justify-center rounded-2xl bg-bg-main hover:bg-white border border-brand-gray transition-all relative text-brand-text-secondary shadow-sm">
                            <span className="material-symbols-outlined font-bold">notifications</span>
                            <span className="absolute top-3 right-3 size-2 bg-brand-blue rounded-full ring-2 ring-white"></span>
                        </button>
                        <button className="size-12 flex items-center justify-center rounded-2xl bg-bg-main hover:bg-white border border-brand-gray transition-all text-brand-text-secondary shadow-sm">
                            <span className="material-symbols-outlined font-bold">help</span>
                        </button>
                    </div>
                    <div className="flex items-center gap-4 pl-2">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-[800] text-brand-dark leading-none">{userName || 'Dr. Janguiê Diniz'}</p>
                            <p className="text-[10px] text-brand-blue mt-1.5 uppercase font-[800] tracking-widest opacity-60">{userRole || 'Presidente Executivo'}</p>
                        </div>
                        <div
                            className="size-13 rounded-2xl bg-cover bg-center border-2 border-brand-gray p-0.5 overflow-hidden shadow-md"
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
        <header className="sticky top-0 z-50 w-full glass-header">
            <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/" className="flex items-center gap-4 group">
                        <div className="h-16 flex items-center justify-center transition-transform group-hover:scale-105">
                            <img
                                alt="Ser Educacional"
                                className="h-full w-auto object-contain brightness-0 opacity-80 group-hover:opacity-100 transition-opacity"
                                src="/assets/logo-ser.png"
                            />
                        </div>
                    </Link>
                </div>

                <nav className="hidden md:flex items-center gap-2">
                    <Link
                        to="/"
                        onClick={(e) => {
                            if (window.location.pathname === '/') {
                                e.preventDefault();
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }
                        }}
                        className="px-5 py-2.5 text-[13px] font-bold uppercase tracking-[0.12em] text-brand-dark hover:text-brand-blue hover:bg-brand-blue/5 transition-all duration-200"
                    >
                        Início
                    </Link>
                    <Link 
                        to="/#premios" 
                        className="px-5 py-2.5 text-[13px] font-bold uppercase tracking-[0.12em] text-brand-dark/70 hover:text-brand-blue hover:bg-brand-blue/5 transition-all duration-200"
                    >
                        Prêmios
                    </Link>
                    <Link 
                        to="/#homenageados" 
                        className="px-5 py-2.5 text-[13px] font-bold uppercase tracking-[0.12em] text-brand-dark/70 hover:text-brand-blue hover:bg-brand-blue/5 transition-all duration-200"
                    >
                        Homenageados
                    </Link>
                </nav>

                <div className="flex items-center">
                    <Link
                        to="/login"
                        className="text-[9px] font-bold uppercase tracking-[0.25em] text-brand-text-secondary/40 hover:text-brand-blue transition-all px-3 py-1.5 border border-brand-gray hover:border-brand-blue"
                    >
                        Administrativo
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;