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

    const isAdmin = profile?.role === 'super_admin' || profile?.role === 'admin';
    const isExecutivo = profile?.role === 'diretor_executivo';
    const isDiretor = profile?.role === 'diretor';

    const dashboardLinks: SidebarLink[] = [
        ...(isAdmin || isExecutivo ? [{ to: '/admin/dashboard', icon: 'bar_chart', label: 'Dashboard Estratégico' }] : []),
        ...(isAdmin ? [{ to: '/dashboard', icon: 'grid_view', label: 'Dashboard Executivo' }] : []),
        { to: '/admin/homenageados', icon: 'stars', label: 'Homenageados' },
    ];

    const adminLinks: SidebarLink[] = [
        ...(isAdmin || isExecutivo ? [{ to: '/admin/dashboard', icon: 'bar_chart', label: 'Dashboard Estratégico' }] : []),
        ...(isAdmin ? [{ to: '/admin', icon: 'grid_view', label: 'Painel de Controle' }] : []),
        ...(isAdmin || isDiretor ? [{ to: '/admin/solicitacoes', icon: 'mark_email_unread', label: isDiretor ? 'Minhas Solicitações' : 'Solicitações Pendentes' }] : []),
        { to: '/admin/homenageados', icon: 'stars', label: 'Homenageados', fill: true },
        // Links exclusivos para Administradores
        ...(isAdmin ? [
            { to: '/admin/premios', icon: 'military_tech', label: 'Prêmios' },
            { to: '/admin/geografia', icon: 'map', label: 'Gestão Regional' },
            { to: '/admin/home-media', icon: 'home_app_logo', label: 'Mídia Home' },
            { to: '/admin/usuarios', icon: 'manage_accounts', label: 'Gestão de Usuários' },
        ] : [])
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
                w-72 flex-shrink-0 flex flex-col justify-between py-8 no-print bg-white border-r border-brand-gray
                ${variant === 'dashboard' ? 'h-screen sticky top-0' : 'h-screen sticky top-0'}
                
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
                    className="lg:hidden absolute top-4 right-4 size-10 rounded-xl bg-brand-gray/50 hover:bg-brand-gray flex items-center justify-center text-brand-dark transition-colors"
                    aria-label="Fechar menu"
                >
                    <span className="material-symbols-outlined text-xl">close</span>
                </button>

                <div className="flex flex-col gap-10 px-6">
                    <div className="flex justify-center w-full">
                        <button 
                            onClick={() => navigate('/')}
                            className="h-20 flex items-center justify-center transition-transform hover:scale-105"
                        >
                            <img
                                alt="Ser Educacional Logo"
                                className="h-full w-auto object-contain brightness-0"
                                src="/assets/logo-ser.png"
                            />
                        </button>
                    </div>
                    <nav className="flex flex-col gap-1">
                        {links.map((link) => (
                            <NavLink
                                key={link.label}
                                to={link.to}
                                onClick={closeMobileMenu}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 relative group ${isActive
                                        ? 'bg-brand-blue/5 text-brand-blue font-[800]'
                                        : 'text-brand-text-secondary hover:text-brand-blue hover:bg-brand-blue/5'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        {isActive && <div className="absolute left-0 top-3 bottom-3 w-1 bg-brand-blue rounded-r-full" />}
                                        <span className="material-symbols-outlined text-[22px]" style={link.fill || isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>
                                            {link.icon}
                                        </span>
                                        <span className={`text-[13px] uppercase tracking-wide ${isActive ? 'font-[800]' : 'font-[600]'}`}>
                                            {link.label}
                                        </span>
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>
                </div>
                
                <div className="px-6 flex flex-col gap-4">
                    <div className="p-4 rounded-2xl flex items-center gap-3 bg-brand-gray/30 border border-brand-gray/50">
                        <div className="size-10 rounded-full border-2 border-white overflow-hidden shadow-sm flex-shrink-0 bg-white">
                            <img
                                alt="Avatar"
                                className="w-full h-full object-cover"
                                src={user?.imageUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuDMzxYcUQNZxOGOzfzAGQJ1veHo1hN84QUYbJ44t5URgJujaznSIEv3Ie0RuihBgoHvvYRwAxLNw0esVokRLIq1aJWo0swGP67izF3yxzC9j19MebEyzNBmg-1lD3t3-H8c-id-KtatqWRgz6xSHyQ8XbNMwzMY1yb7pgl8mGh3IhNAxt5B79a0Cbn2PmYo0mssLChqjanM9AyUMznL-yaC11FNjHqxn4aFTb_oCfx0XDUBdOj5YE1fcLjol53OaWxtFdKrwObZ8E3x"}
                            />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-[12px] font-[800] truncate text-brand-dark leading-tight">
                                {profile?.full_name || user?.fullName || "Usuário"}
                            </p>
                            <p className="text-[9px] text-brand-text-secondary font-[700] truncate uppercase tracking-widest mt-0.5">
                                {profile?.role === 'super_admin' ? 'Super Admin' : profile?.role === 'admin' ? 'Administrador' : profile?.role === 'diretor_executivo' ? 'Dir. Executivo' : profile?.role === 'diretor' ? 'Dir. de Unidade' : 'Novo Usuário'}
                            </p>
                        </div>
                    </div>
                    
                    <button
                        onClick={async () => {
                            closeMobileMenu();
                            navigate('/');
                            await signOut();
                        }}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 font-[800] transition-colors text-[12px] uppercase tracking-widest group"
                    >
                        <span className="material-symbols-outlined text-[22px] group-hover:translate-x-1 transition-transform">logout</span>
                        <span>Encerrar Sessão</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;