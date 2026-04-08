import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../components/ui/GlassCard';
import { supabase } from '../../lib/supabase';
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

    useEffect(() => {
        if (isDiretor) {
            navigate('/admin/homenageados', { replace: true });
        } else {
            fetchStats();
        }
    }, [isDiretor, navigate]);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const queries = [
                supabase.from('honorees').select('*', { count: 'exact', head: true })
            ];

            if (!isDiretor) {
                queries.push(
                    supabase.from('awards').select('*', { count: 'exact', head: true }),
                    supabase.from('regionals').select('*', { count: 'exact', head: true })
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
        <div className="space-y-12 animate-fade-in pb-20 px-6 md:px-10 lg:px-16 pt-20 lg:pt-8">
            <div className="flex flex-wrap justify-between items-end gap-8 mb-16">
                <div className="space-y-4">
                    <span className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] block">Gestão de Excelência</span>
                    <h2 className="text-5xl font-bold font-serif text-off-white italic">Painel de <span className="text-gold-gradient">Controle</span></h2>
                    <p className="text-off-white/40 max-w-2xl text-lg font-light italic">
                        Supervisão central de honrarias e mérito institucional Ser Educacional.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/admin/homenageados/novo')}
                    className="bg-gold hover:bg-gold-light hover:scale-[1.02] active:scale-[0.98] transition-all text-navy-deep px-8 py-5 rounded-full font-bold text-[10px] uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(212,175,55,0.2)] group"
                >
                    <span className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-lg">person_add</span>
                        Novo Homenageado
                    </span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className={`grid grid-cols-1 ${isDiretor ? 'md:grid-cols-1 max-w-sm' : 'md:grid-cols-3'} gap-6`}>
                {isLoading ? (
                    <div className="col-span-full flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold"></div>
                    </div>
                ) : (
                    statsConfig.map((stat, i) => (
                        <GlassCard
                            key={i}
                            className="p-8 rounded-3xl group border-white/5 cursor-pointer hover:border-gold/20 transition-all bg-gradient-to-br from-white/[0.02] to-transparent"
                            onClick={() => stat.link !== '#' && navigate(stat.link)}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <p className="text-[10px] font-bold text-off-white/40 uppercase tracking-[0.3em]">{stat.label}</p>
                                <span className="material-symbols-outlined text-gold/50 group-hover:text-gold transition-colors">{stat.icon}</span>
                            </div>
                            <div className="flex items-end gap-4">
                                <span className="text-4xl font-bold font-serif text-off-white italic">{stat.value}</span>
                                <span className="text-gold text-[8px] font-bold mb-1 px-3 py-1 rounded-full border border-gold/20 bg-gold/5 uppercase tracking-widest">
                                    {stat.change}
                                </span>
                            </div>
                        </GlassCard>
                    ))
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <GlassCard className="p-10 rounded-[3rem] border-white/5">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-xl font-serif italic text-off-white">Atividades Recentes</h3>
                        {!isDiretor && (
                            <button
                                onClick={() => navigate('/admin/dashboard')}
                                className="text-gold text-[9px] font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
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
                            <div key={i} className="flex gap-4 p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                                <div className="size-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                                    <span className="material-symbols-outlined text-lg">history</span>
                                </div>
                                <div>
                                    <p className="text-sm text-off-white/80"><span className="font-bold text-off-white">{activity.user}</span> {activity.action}</p>
                                    <p className="text-xs text-gold/60 italic">{activity.target}</p>
                                    <p className="text-[9px] text-off-white/20 uppercase tracking-tighter mt-1">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                <GlassCard className="p-10 rounded-[3rem] border-white/5">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-xl font-serif italic text-off-white">Ações Rápidas</h3>
                        <span className="material-symbols-outlined text-gold/30">bolt</span>
                    </div>
                    <div className={`grid grid-cols-1 ${isDiretor ? '' : 'sm:grid-cols-2'} gap-6`}>
                        {quickActions.map((action, i) => (
                            <button
                                key={i}
                                onClick={() => navigate(action.link)}
                                className="p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-gold/30 hover:bg-gold/5 transition-all text-left group"
                            >
                                <span className="material-symbols-outlined text-gold/40 group-hover:text-gold transition-colors mb-4 block text-3xl">{action.icon}</span>
                                <p className="text-sm font-bold text-off-white">{action.label}</p>
                                <p className="text-[10px] text-off-white/30 uppercase tracking-widest mt-1">{action.desc}</p>
                            </button>
                        ))}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export default AdminPanel;
