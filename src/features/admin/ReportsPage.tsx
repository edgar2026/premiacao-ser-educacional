import React, { useEffect, useState } from 'react';
import GlassCard from '../../components/ui/GlassCard';
import { supabase } from '../../lib/supabase';

const ReportsPage: React.FC = () => {
    const [stats, setStats] = useState({
        awards: 0,
        honorees: 0,
        units: 0,
        publishedHonorees: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            const [awardsRes, honoreesRes, unitsRes, publishedRes] = await Promise.all([
                supabase.from('awards').select('*', { count: 'exact', head: true }),
                supabase.from('honorees').select('*', { count: 'exact', head: true }),
                supabase.from('units').select('*', { count: 'exact', head: true }),
                supabase.from('honorees').select('*', { count: 'exact', head: true }).eq('is_published', true)
            ]);

            setStats({
                awards: awardsRes.count || 0,
                honorees: honoreesRes.count || 0,
                units: unitsRes.count || 0,
                publishedHonorees: publishedRes.count || 0
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const reportTypes = [
        { title: 'Relatório de Impacto Acadêmico', icon: 'auto_graph', description: `Análise detalhada do crescimento e impacto das ${stats.awards} premiações no corpo docente e discente.` },
        { title: 'Consolidado de Meritocracia', icon: 'military_tech', description: `Visão macro sobre a distribuição de láureas pelas ${stats.units} unidades e categorias de excelência.` },
        { title: 'Engajamento Institucional', icon: 'hub', description: `Métricas de participação e reconhecimento de ${stats.honorees} homenageados nas iniciativas de inovação e gestão.` },
        { title: 'Histórico de Premiações', icon: 'history', description: `Arquivo completo de todas as edições, com ${stats.publishedHonorees} registros publicados e critérios aplicados.` },
    ];

    return (
        <div className="space-y-12 animate-fade-in">
            <div className="flex flex-wrap justify-between items-end gap-8 mb-16">
                <div className="space-y-4">
                    <span className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] block">Inteligência de Dados</span>
                    <h2 className="text-5xl font-bold font-serif text-off-white italic">Relatórios <span className="text-gold-gradient">Estratégicos</span></h2>
                    <p className="text-off-white/40 max-w-2xl text-lg font-light italic">
                        Extração de insights e métricas consolidadas para suporte à decisão executiva.
                    </p>
                </div>
                <div className="flex gap-4">
                    <button className="bg-white/5 hover:bg-white/10 transition-all text-gold px-8 py-5 rounded-full font-bold text-[10px] uppercase tracking-[0.3em] border border-gold/30">
                        <span className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-lg">download</span>
                            Exportar Tudo
                        </span>
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {reportTypes.map((report, i) => (
                        <GlassCard key={i} className="p-10 rounded-[3rem] border-white/5 hover:border-gold/20 transition-all group cursor-pointer">
                            <div className="flex gap-8 items-start">
                                <div className="size-20 rounded-[2rem] bg-gold/5 flex items-center justify-center group-hover:bg-gold transition-all duration-700 border border-gold/10 flex-shrink-0">
                                    <span className="material-symbols-outlined text-gold group-hover:text-navy-deep text-4xl">{report.icon}</span>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-bold text-off-white font-serif italic">{report.title}</h3>
                                    <p className="text-off-white/40 text-sm leading-relaxed font-light">
                                        {report.description}
                                    </p>
                                    <div className="flex gap-4 pt-4">
                                        <button className="text-gold text-[9px] font-bold uppercase tracking-[0.3em] flex items-center gap-2 hover:gap-4 transition-all">
                                            Gerar PDF <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                                        </button>
                                        <button className="text-off-white/30 text-[9px] font-bold uppercase tracking-[0.3em] flex items-center gap-2 hover:text-off-white transition-all">
                                            Visualizar <span className="material-symbols-outlined text-sm">visibility</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}

            <GlassCard className="p-12 rounded-[3rem] border-white/5 bg-gradient-to-br from-gold/5 to-transparent">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 space-y-6">
                        <h3 className="text-3xl font-bold font-serif text-off-white italic">Relatório <span className="text-gold">Customizado</span></h3>
                        <p className="text-off-white/50 text-lg font-light leading-relaxed">
                            Precisa de uma análise específica? Utilize nossa ferramenta de filtros avançados para gerar um relatório sob medida para suas necessidades.
                        </p>
                        <button className="bg-gold text-navy-deep px-10 py-4 rounded-full font-bold text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-gold/10 hover:scale-105 transition-all">
                            Configurar Filtros
                        </button>
                    </div>
                    <div className="size-48 rounded-full border-8 border-gold/10 flex items-center justify-center relative">
                        <div className="absolute inset-0 border-t-8 border-gold rounded-full animate-spin duration-[3s]"></div>
                        <span className="material-symbols-outlined text-gold text-6xl">query_stats</span>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
};

export default ReportsPage;
