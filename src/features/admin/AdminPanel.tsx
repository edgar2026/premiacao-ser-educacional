import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../components/ui/GlassCard';
import { supabase, createAuthClient } from '../../lib/supabase';
import { useAuth } from '../auth/AuthContext';

const AdminPanel: React.FC = () => {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const isDiretor = profile?.role === 'diretor';

    const [stats, setStats] = useState({
        honorees: '0',
        awards: '0',
        regionals: '0'
    });
    const [isLoading, setIsLoading] = useState(true);

    // Cliente Autenticado para forçar os Headers de RLS
    const dbClient = profile?.id ? createAuthClient(profile.id) : supabase;

    useEffect(() => {
        if (profile && isDiretor) {
            navigate('/admin/solicitacoes', { replace: true });
        } else if (profile && profile.role === 'diretor_executivo') {
            navigate('/admin/dashboard', { replace: true });
        } else if (profile) {
            fetchStats();
        }
    }, [profile, isDiretor, navigate]);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const queries = [
                dbClient.from('honorees').select('*', { count: 'exact', head: true })
            ];

            if (!isDiretor) {
                queries.push(
                    dbClient.from('awards').select('*', { count: 'exact', head: true }),
                    dbClient.from('regionals').select('*', { count: 'exact', head: true })
                );
            }

            const results = await Promise.all(queries);

            setStats({
                honorees: (results[0].count || 0).toString(),
                awards: !isDiretor ? (results[1].count || 0).toString() : '0',
                regionals: !isDiretor ? (results[2].count || 0).toString() : '0'
            });
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const statsConfig = [
        { label: 'Homenageados', value: stats.honorees, icon: 'groups', change: 'Live', link: '/admin/homenageados', visible: true },
        { label: 'Láureas Ativas', value: stats.awards, icon: 'military_tech', change: 'Live', link: '/admin/premios', visible: !isDiretor },
        { label: 'Regional', value: stats.regionals, icon: 'map', change: 'Live', link: '/admin/geografia', visible: !isDiretor }
    ].filter(s => s.visible);

    const quickActions = [
        { 
            label: 'Novo Homenageado', 
            desc: 'Registro de talentos', 
            icon: 'person_add', 
            link: '/admin/homenageados/novo',
            visible: true 
        },
        { 
            label: 'Configurar Prêmio', 
            desc: 'Gestão de honrarias', 
            icon: 'military_tech', 
            link: '/admin/premios/novo',
            visible: !isDiretor 
        },
        { 
            label: 'Gestão Regional', 
            desc: 'Regionais, Marcas e Unidades', 
            icon: 'map', 
            link: '/admin/geografia',
            visible: !isDiretor 
        },
        { 
            label: 'Dashboard Estratégico', 
            desc: 'Dados analíticos', 
            icon: 'dashboard', 
            link: '/admin/dashboard',
            visible: !isDiretor 
        }
    ].filter(a => a.visible);

    return (
        <div className="space-y-12 animate-fade-in pb-20 px-6 md:px-10 lg:px-16 pt-16">
            <div className="flex flex-wrap justify-between items-end gap-8 mb-12">
                <div className="space-y-3">
                    <span className="text-brand-blue text-[11px] font-[800] uppercase tracking-[0.4em] block">Gestão de Excelência</span>
                    <h2 className="text-[48px] font-[800] text-brand-dark tracking-tight leading-none">Painel de Controle</h2>
                    <p className="text-brand-text-secondary max-w-2xl text-[16px] font-medium opacity-60">
                        Supervisão central de honrarias e mérito institucional Ser Educacional.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/admin/homenageados/novo')}
                    className="btn-premium !px-10 !py-5"
                >
                    <span className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-lg">person_add</span>
                        Novo Homenageado
                    </span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className={`grid grid-cols-1 ${isDiretor ? 'md:grid-cols-1 max-w-sm' : 'md:grid-cols-3'} gap-8`}>
                {isLoading ? (
                    <div className="col-span-full flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-blue"></div>
                    </div>
                ) : (
                    statsConfig.map((stat, i) => (
                        <div
                            key={i}
                            className="card-static !p-10 group cursor-pointer hover:border-brand-blue transition-all"
                            onClick={() => stat.link !== '#' && navigate(stat.link)}
                        >
                            <div className="flex justify-between items-start mb-8">
                                <p className="text-[11px] font-[800] text-brand-text-secondary uppercase tracking-[0.3em] opacity-40">{stat.label}</p>
                                <div className="size-12 rounded-2xl bg-brand-blue/5 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all">
                                    <span className="material-symbols-outlined">{stat.icon}</span>
                                </div>
                            </div>
                            <div className="flex items-end gap-5">
                                <span className="text-[56px] font-[800] text-brand-dark leading-none tracking-tighter">{stat.value}</span>
                                <span className="text-brand-blue text-[10px] font-[800] mb-2 px-4 py-1.5 rounded-full border border-brand-blue/10 bg-brand-blue/5 uppercase tracking-widest">
                                    {stat.change}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="card-static !p-12">
                    <div className="flex justify-between items-center mb-12">
                        <h3 className="text-[22px] font-[800] text-brand-dark tracking-tight">Atividades Recentes</h3>
                        {!isDiretor && (
                            <button
                                onClick={() => navigate('/admin/dashboard')}
                                className="text-brand-blue text-[10px] font-[800] uppercase tracking-widest hover:opacity-70 transition-opacity"
                            >
                                Ver Dashboard
                            </button>
                        )}
                    </div>
                    <div className="space-y-6">
                        {[
                            { user: 'Admin Master', action: 'Acessou o painel', target: 'Gestão Central', time: 'Agora' },
                            { user: 'Sistema', action: 'Sincronização concluída', target: 'Supabase Cloud', time: 'Há 1 min' }
                        ].map((activity, i) => (
                            <div key={i} className="flex gap-5 p-6 rounded-2xl bg-brand-gray/30 border border-brand-gray/50 hover:border-brand-blue/30 transition-all group">
                                <div className="size-12 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-all">
                                    <span className="material-symbols-outlined text-xl">history</span>
                                </div>
                                <div>
                                    <p className="text-[15px] text-brand-dark leading-tight"><span className="font-[800]">{activity.user}</span> <span className="opacity-60">{activity.action}</span></p>
                                    <p className="text-[12px] text-brand-blue font-[700] uppercase tracking-wide mt-1">{activity.target}</p>
                                    <p className="text-[10px] text-brand-text-secondary/40 font-[800] uppercase tracking-widest mt-2">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card-static !p-12">
                    <div className="flex justify-between items-center mb-12">
                        <h3 className="text-[22px] font-[800] text-brand-dark tracking-tight">Ações Rápidas</h3>
                        <span className="material-symbols-outlined text-brand-blue/30">bolt</span>
                    </div>
                    <div className={`grid grid-cols-1 ${isDiretor ? '' : 'sm:grid-cols-2'} gap-8`}>
                        {quickActions.map((action, i) => (
                            <button
                                key={i}
                                onClick={() => navigate(action.link)}
                                className="p-10 rounded-3xl bg-brand-gray/30 border border-brand-gray/50 hover:border-brand-blue hover:bg-white hover:shadow-xl transition-all text-left group"
                            >
                                <div className="size-14 rounded-2xl bg-white flex items-center justify-center text-brand-blue/40 group-hover:text-brand-blue shadow-sm mb-6 transition-all">
                                    <span className="material-symbols-outlined text-3xl">{action.icon}</span>
                                </div>
                                <p className="text-[16px] font-[800] text-brand-dark tracking-tight">{action.label}</p>
                                <p className="text-[11px] text-brand-text-secondary/60 font-[700] uppercase tracking-widest mt-1.5">{action.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;