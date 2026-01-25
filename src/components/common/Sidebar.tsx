import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';

interface SidebarProps {
    variant?: 'dashboard' | 'admin';
}

const Sidebar: React.FC<SidebarProps> = ({ variant = 'dashboard' }) => {
    const navigate = useNavigate();
    const { signOut, user, profile } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    interface SidebarLink {
        to: string;
        icon: string;
        label: string;
        fill?: boolean;
    }

    const dashboardLinks: SidebarLink[] = [
        { to: '/admin/dashboard', icon: 'bar_chart', label: 'Dashboard Estratégico' },
        { to: '/dashboard', icon: 'grid_view', label: 'Dashboard Executivo' },
        { to: '/admin', icon: 'stars', label: 'Gestão de Homenageados' },
    ];

    const adminLinks: SidebarLink[] = [
        { to: '/admin/dashboard', icon: 'bar_chart', label: 'Dashboard' },
        { to: '/admin', icon: 'grid_view', label: 'Painel de Controle' },
        { to: '/admin/homenageados', icon: 'stars', label: 'Homenageados', fill: true },
        { to: '/admin/premios', icon: 'military_tech', label: 'Prêmios' },
        { to: '/admin/geografia', icon: 'map', label: 'Gestão Regional' },
        { to: '/admin/home-media', icon: 'home_app_logo', label: 'Mídia Home' },
    ];

    const links: SidebarLink[] = variant === 'dashboard' ? dashboardLinks : adminLinks;

    const closeMobileMenu = () => setIsMobileMenuOpen(false);

    return (
        <>
            {/* Mobile Hamburger Button */}
            <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 size-12 rounded-xl bg-navy-deep/90 backdrop-blur-md border border-white/10 flex items-center justify-center text-gold hover:bg-navy-deep transition-all shadow-lg no-print"
                aria-label="Abrir menu"
            >
                <span className="material-symbols-outlined text-2xl">menu</span>
            </button>

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    onClick={closeMobileMenu}
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
                />
            )}

            {/* Sidebar */}
            <aside className={`
                w-72 flex-shrink-0 flex flex-col justify-between py-8 no-print
                ${variant === 'dashboard' ? 'glass-sidebar' : 'glass-panel h-screen sticky top-0 rounded-r-[3rem] my-0 shadow-2xl'}
                
                ${/* Mobile styles */ ''}
                lg:flex
                ${isMobileMenuOpen ? 'flex' : 'hidden'}
                lg:relative fixed inset-y-0 left-0 z-50
                lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
                transition-transform duration-300 ease-in-out
            `}>
                {/* Mobile Close Button */}
                <button
                    onClick={closeMobileMenu}
                    className="lg:hidden absolute top-4 right-4 size-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                    aria-label="Fechar menu"
                >
                    <span className="material-symbols-outlined text-xl">close</span>
                </button>

                <div className="flex flex-col gap-10 px-6">
                    <div className="flex justify-center w-full">
                        <div className="size-32 flex items-center justify-center transition-transform hover:scale-105">
                            <img
                                alt="Ser Educacional Logo"
                                className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                                src="/assets/logo-ser.png"
                            />
                        </div>
                    </div>
                    <nav className="flex flex-col gap-2">
                        {links.map((link) => (
                            <NavLink
                                key={link.label}
                                to={link.to}
                                onClick={closeMobileMenu}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                                        ? (variant === 'dashboard' ? 'bg-vibrant-blue text-white shadow-lg shadow-blue-500/30' : 'bg-white/30 text-white border border-white/20 shadow-xl shadow-blue-800/10')
                                        : 'text-blue-200 hover:text-white hover:bg-white/10'
                                    }`
                                }
                            >
                                <span className="material-symbols-outlined text-[22px]" style={link.fill ? { fontVariationSettings: "'FILL' 1" } : {}}>
                                    {link.icon}
                                </span>
                                <span className={`text-sm ${variant === 'dashboard' ? (variant === 'dashboard' ? 'font-semibold' : 'font-medium') : 'font-semibold'}`}>
                                    {link.label}
                                </span>
                            </NavLink>
                        ))}
                    </nav>
                </div>
                <div className="px-6 flex flex-col gap-4">

                    {variant === 'dashboard' ? (
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10">
                            <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-1">Dica do Sistema</p>
                            <p className="text-[11px] text-blue-100 leading-relaxed">Dados consolidados do último fechamento semestral disponíveis para exportação.</p>
                        </div>
                    ) : (
                        <div className="glass-card p-4 rounded-2xl flex items-center gap-3 bg-white/10">
                            <div className="size-10 rounded-full border-2 border-white/50 overflow-hidden shadow-lg">
                                <img
                                    alt="Avatar"
                                    src={user?.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuDMzxYcUQNZxOGOzfzAGQJ1veHo1hN84QUYbJ44t5URgJujaznSIEv3Ie0RuihBgoHvvYRwAxLNw0esVokRLIq1aJWo0swGP67izF3yxzC9j19MebEyzNBmg-1lD3t3-H8c-id-KtatqWRgz6xSHyQ8XbNMwzMY1yb7pgl8mGh3IhNAxt5B79a0Cbn2PmYo0mssLChqjanM9AyUMznL-yaC11FNjHqxn4aFTb_oCfx0XDUBdOj5YE1fcLjol53OaWxtFdKrwObZ8E3x"}
                                />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-xs font-black truncate text-white">
                                    {profile?.full_name || user?.fullName || "Usuário"}
                                </p>
                                <p className="text-[10px] text-soft-cyan/80 truncate uppercase tracking-tighter">
                                    {profile?.role || "Gestão Ser Educacional"}
                                </p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={async () => {
                            closeMobileMenu();
                            navigate('/');
                            await signOut();
                        }}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-300 hover:bg-red-500/20 transition-colors"
                    >
                        <span className="material-symbols-outlined text-[22px]">logout</span>
                        <span className="text-sm font-bold tracking-wide">Encerrar Sessão</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
