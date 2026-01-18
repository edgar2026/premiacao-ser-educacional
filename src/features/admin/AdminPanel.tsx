import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../components/ui/GlassCard';
import { supabase } from '../../lib/supabase';

const AdminPanel: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        honorees: '0',
        awards: '0',
        units: '0'
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const [honoreesRes, awardsRes, unitsRes] = await Promise.all([
                supabase.from('honorees').select('*', { count: 'exact', head: true }),
                supabase.from('awards').select('*', { count: 'exact', head: true }),
                supabase.from('units').select('*', { count: 'exact', head: true })
            ]);

            setStats({
                honorees: (honoreesRes.count || 0).toString(),
                awards: (awardsRes.count || 0).toString(),
                units: (unitsRes.count || 0).toString()
            });
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-10 animate-fade-in p-10">
            <div className="flex flex-wrap justify-between items-end gap-8">
                <div className="space-y-4">
                    <span className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] block">Gestão de Excelência</span>
                    <h2 className="text-5xl font-bold font-serif text-off-white italic">Painel de <span className="text-gold-gradient">Controle</span></h2>
                    <p className="text-off-white/40 max-w-2xl text-lg font-light italic">
                        Supervisão central de honrarias e mérito institucional Ser Educacional.
                    </p>
                </div>
                <div className="flex gap-4">
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
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-16 gap-y-6">
                {isLoading ? (
                    <div className="col-span-full flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold"></div>
                    </div>
                ) : (
                    [
                        { label: 'Homenageados', value: stats.honorees, icon: 'groups', change: 'Live', link: '/admin/homenageados' },
                        { label: 'Láureas Ativas', value: stats.awards, icon: 'military_tech', change: 'Live', link: '/admin/premios' },
                        { label: 'Unidades', value: stats.units, icon: 'location_city', change: 'Live', link: '/admin/unidades' }
                    ].map((stat, i) => (
                        <GlassCard
                            key={i}
                            className="p-10 rounded-[2.5rem] group border-white/5 cursor-pointer hover:border-gold/20 transition-all"
                            onClick={() => stat.link !== '#' && navigate(stat.link)}
                        >
                            <div className="flex justify-between items-start mb-6">
                                <p className="text-[10px] font-bold text-off-white/40 uppercase tracking-[0.3em]">{stat.label}</p>
                                <span className="material-symbols-outlined text-gold/50 group-hover:text-gold transition-colors">{stat.icon}</span>
                            </div>
                            <div className="flex items-end gap-4">
                                <span className="text-5xl font-bold font-serif text-off-white italic">{stat.value}</span>
                                <span className="text-gold text-[10px] font-bold mb-2 px-3 py-1 rounded-full border border-gold/20 bg-gold/5 uppercase tracking-widest">
                                    {stat.change}
                                </span>
                            </div>
                        </GlassCard>
                    ))
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <GlassCard className="p-10 rounded-[3rem] border-white/5">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-serif italic text-off-white">Atividades Recentes</h3>
                        <button
                            onClick={() => navigate('/admin/relatorios')}
                            className="text-gold text-[9px] font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
                        >
                            Ver Relatórios
                        </button>
                    </div>
                    <div className="space-y-6">
                        {[
                            { user: 'Admin Master', action: 'Acessou o painel', target: 'Gestão Central', time: 'Agora' },
                            { user: 'Sistema', action: 'Sincronização concluída', target: 'Supabase Cloud', time: 'Há 1 min' }
                        ].map((activity, i) => (
                            <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                <div className="size-10 rounded-full bg-gold/10 flex items-center justify-center text-gold">
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
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-serif italic text-off-white">Ações Rápidas</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <button
                            onClick={() => navigate('/admin/homenageados/novo')}
                            className="p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-gold/30 hover:bg-gold/5 transition-all text-left group"
                        >
                            <span className="material-symbols-outlined text-gold/40 group-hover:text-gold transition-colors mb-4 block text-3xl">person_add</span>
                            <p className="text-sm font-bold text-off-white">Novo Homenageado</p>
                            <p className="text-[10px] text-off-white/30 uppercase tracking-widest mt-1">Registro de talentos</p>
                        </button>
                        <button
                            onClick={() => navigate('/admin/premios/novo')}
                            className="p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-gold/30 hover:bg-gold/5 transition-all text-left group"
                        >
                            <span className="material-symbols-outlined text-gold/40 group-hover:text-gold transition-colors mb-4 block text-3xl">military_tech</span>
                            <p className="text-sm font-bold text-off-white">Configurar Prêmio</p>
                            <p className="text-[10px] text-off-white/30 uppercase tracking-widest mt-1">Gestão de honrarias</p>
                        </button>
                        <button
                            onClick={() => navigate('/admin/unidades')}
                            className="p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-gold/30 hover:bg-gold/5 transition-all text-left group"
                        >
                            <span className="material-symbols-outlined text-gold/40 group-hover:text-gold transition-colors mb-4 block text-3xl">location_city</span>
                            <p className="text-sm font-bold text-off-white">Gerenciar Unidades</p>
                            <p className="text-[10px] text-off-white/30 uppercase tracking-widest mt-1">Campus e polos</p>
                        </button>
                        <button
                            onClick={() => navigate('/admin/relatorios')}
                            className="p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-gold/30 hover:bg-gold/5 transition-all text-left group"
                        >
                            <span className="material-symbols-outlined text-gold/40 group-hover:text-gold transition-colors mb-4 block text-3xl">analytics</span>
                            <p className="text-sm font-bold text-off-white">Relatórios</p>
                            <p className="text-[10px] text-off-white/30 uppercase tracking-widest mt-1">Dados estratégicos</p>
                        </button>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export default AdminPanel;
