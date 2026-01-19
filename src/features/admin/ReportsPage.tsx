import React, { useEffect, useState } from 'react';
import GlassCard from '../../components/ui/GlassCard';
import { supabase } from '../../lib/supabase';

import ReportTemplate from './components/ReportTemplate';

const ReportsPage: React.FC = () => {
    const [stats, setStats] = useState({
        awards: 0,
        honorees: 0,
        units: 0,
        publishedHonorees: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState<{ title: string; description: string } | null>(null);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        categories: [] as string[]
    });

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

    const handleExportAll = async () => {
        setIsExportModalOpen(false);
        setIsExporting(true);
        try {
            const [awards, honorees, units] = await Promise.all([
                supabase.from('awards').select('*'),
                supabase.from('honorees').select('*'),
                supabase.from('units').select('*')
            ]);

            const data = {
                exportDate: new Date().toISOString(),
                awards: awards.data,
                honorees: honorees.data,
                units: units.data
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `backup-sistema-premios-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting data:', error);
            alert('Erro ao exportar dados');
        } finally {
            setIsExporting(false);
        }
    };

    const handleGeneratePDF = (report: { title: string; description: string }) => {
        setSelectedReport(report);
        setIsPreviewMode(false);
        // Wait for state update and render
        setTimeout(() => {
            window.print();
        }, 100);
    };

    const handlePreviewReport = (report: { title: string; description: string }) => {
        setSelectedReport(report);
        setIsPreviewMode(true);
    };

    const toggleCategory = (cat: string) => {
        setFilters(prev => ({
            ...prev,
            categories: prev.categories.includes(cat)
                ? prev.categories.filter(c => c !== cat)
                : [...prev.categories, cat]
        }));
    };

    const reportTypes = [
        { title: 'Relatório de Impacto Acadêmico', icon: 'auto_graph', description: `Análise detalhada do crescimento e impacto das ${stats.awards} premiações no corpo docente e discente.` },
        { title: 'Consolidado de Meritocracia', icon: 'military_tech', description: `Visão macro sobre a distribuição de láureas pelas ${stats.units} unidades e categorias de excelência.` },
        { title: 'Engajamento Institucional', icon: 'hub', description: `Métricas de participação e reconhecimento de ${stats.honorees} homenageados nas iniciativas de inovação e gestão.` },
        { title: 'Histórico de Premiações', icon: 'history', description: `Arquivo completo de todas as edições, com ${stats.publishedHonorees} registros publicados e critérios aplicados.` },
    ];

    return (
        <div className="space-y-12 animate-fade-in pb-20">
            {/* Report Template for Printing */}
            {selectedReport && !isPreviewMode && (
                <ReportTemplate
                    title={selectedReport.title}
                    description={selectedReport.description}
                    stats={stats}
                    date={new Date().toLocaleDateString('pt-BR')}
                />
            )}

            {/* Report Preview Modal */}
            {selectedReport && isPreviewMode && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-8 bg-navy-deep/95 backdrop-blur-2xl overflow-y-auto">
                    <div className="absolute top-8 right-8 flex gap-4">
                        <button
                            onClick={() => handleGeneratePDF(selectedReport)}
                            className="bg-gold text-navy-deep px-6 py-3 rounded-full font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all"
                        >
                            <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                            Imprimir PDF
                        </button>
                        <button
                            onClick={() => setSelectedReport(null)}
                            className="size-12 rounded-full bg-white/5 flex items-center justify-center text-off-white hover:bg-white/10 transition-all"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                    <div className="w-full max-w-[210mm] shadow-2xl shadow-black/50 mt-20">
                        <ReportTemplate
                            title={selectedReport.title}
                            description={selectedReport.description}
                            stats={stats}
                            date={new Date().toLocaleDateString('pt-BR')}
                        />
                    </div>
                </div>
            )}

            <div className="flex flex-wrap justify-between items-end gap-8 mb-16 print:hidden">
                <div className="space-y-4">
                    <span className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] block">Inteligência de Dados</span>
                    <h2 className="text-5xl font-bold font-serif text-off-white italic">Relatórios <span className="text-gold-gradient">Estratégicos</span></h2>
                    <p className="text-off-white/40 max-w-2xl text-lg font-light italic">
                        Extração de insights e métricas consolidadas para suporte à decisão executiva.
                    </p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsExportModalOpen(true)}
                        disabled={isExporting}
                        className="bg-white/5 hover:bg-white/10 transition-all text-gold px-8 py-5 rounded-full font-bold text-[10px] uppercase tracking-[0.3em] border border-gold/30 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        <span className="flex items-center gap-3">
                            <span className={`material-symbols-outlined text-lg ${isExporting ? 'animate-spin' : ''}`}>
                                {isExporting ? 'sync' : 'download'}
                            </span>
                            {isExporting ? 'Exportando...' : 'Exportar Tudo'}
                        </span>
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20 print:hidden">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 print:hidden">
                    {reportTypes.map((report, i) => (
                        <GlassCard key={i} className="p-10 rounded-[3rem] border-white/5 hover:border-gold/20 transition-all group">
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
                                        <button
                                            onClick={() => handleGeneratePDF(report)}
                                            className="text-gold text-[9px] font-bold uppercase tracking-[0.3em] flex items-center gap-2 hover:gap-4 transition-all"
                                        >
                                            Gerar PDF <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                                        </button>
                                        <button
                                            onClick={() => handlePreviewReport(report)}
                                            className="text-off-white/30 text-[9px] font-bold uppercase tracking-[0.3em] flex items-center gap-2 hover:text-off-white transition-all"
                                        >
                                            Visualizar <span className="material-symbols-outlined text-sm">visibility</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}

            <GlassCard className="p-12 rounded-[3rem] border-white/5 bg-gradient-to-br from-gold/5 to-transparent print:hidden">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 space-y-6">
                        <h3 className="text-3xl font-bold font-serif text-off-white italic">Relatório <span className="text-gold">Customizado</span></h3>
                        <p className="text-off-white/50 text-lg font-light leading-relaxed">
                            Precisa de uma análise específica? Utilize nossa ferramenta de filtros avançados para gerar um relatório sob medida para suas necessidades.
                        </p>
                        <button
                            onClick={() => setIsFilterModalOpen(true)}
                            className="bg-gold text-navy-deep px-10 py-4 rounded-full font-bold text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-gold/10 hover:scale-105 transition-all"
                        >
                            Configurar Filtros
                        </button>
                    </div>
                    <div className="size-48 rounded-full border-8 border-gold/10 flex items-center justify-center relative">
                        <div className="absolute inset-0 border-t-8 border-gold rounded-full animate-spin duration-[3s]"></div>
                        <span className="material-symbols-outlined text-gold text-6xl">query_stats</span>
                    </div>
                </div>
            </GlassCard>

            {/* Export Confirmation Modal */}
            {isExportModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-navy-deep/90 backdrop-blur-xl" onClick={() => setIsExportModalOpen(false)}></div>
                    <GlassCard className="relative w-full max-w-lg p-12 rounded-[3rem] border-gold/20 animate-scale-in text-center">
                        <div className="size-24 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-8 border border-gold/20">
                            <span className="material-symbols-outlined text-gold text-5xl">database</span>
                        </div>
                        <h3 className="text-3xl font-serif font-bold text-off-white italic mb-6">Confirmar <span className="text-gold">Exportação</span></h3>
                        <p className="text-off-white/50 text-lg font-light leading-relaxed mb-10">
                            Você está prestes a gerar um arquivo de backup contendo todos os dados de <span className="text-off-white font-medium">Premiações</span>, <span className="text-off-white font-medium">Homenageados</span> e <span className="text-off-white font-medium">Unidades</span> em formato JSON.
                        </p>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={handleExportAll}
                                className="w-full bg-gold text-navy-deep py-5 rounded-2xl font-bold text-[10px] uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Confirmar e Baixar
                            </button>
                            <button
                                onClick={() => setIsExportModalOpen(false)}
                                className="w-full bg-white/5 text-off-white/40 py-5 rounded-2xl font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-white/10 hover:text-off-white transition-all"
                            >
                                Cancelar
                            </button>
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* Filter Modal */}
            {isFilterModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-navy-deep/90 backdrop-blur-xl" onClick={() => setIsFilterModalOpen(false)}></div>
                    <GlassCard className="relative w-full max-w-2xl p-12 rounded-[3rem] border-gold/20 animate-scale-in">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-3xl font-serif font-bold text-off-white italic">Configurar <span className="text-gold">Filtros</span></h3>
                            <button onClick={() => setIsFilterModalOpen(false)} className="size-10 rounded-full bg-white/5 flex items-center justify-center text-off-white hover:bg-white/10 transition-all">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-gold uppercase tracking-[0.3em]">Período</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="date"
                                        value={filters.startDate}
                                        onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                                        className="bg-white/5 border border-white/10 p-4 rounded-xl text-off-white outline-none focus:border-gold/30"
                                    />
                                    <input
                                        type="date"
                                        value={filters.endDate}
                                        onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                                        className="bg-white/5 border border-white/10 p-4 rounded-xl text-off-white outline-none focus:border-gold/30"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-bold text-gold uppercase tracking-[0.3em]">Categorias</label>
                                <div className="flex flex-wrap gap-3">
                                    {['Pesquisa', 'Extensão', 'Gestão', 'Inovação'].map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => toggleCategory(cat)}
                                            className={`px-6 py-3 rounded-full border transition-all text-[10px] font-bold uppercase tracking-widest ${filters.categories.includes(cat) ? 'bg-gold border-gold text-navy-deep' : 'bg-white/5 border-white/10 text-off-white/40 hover:border-gold/30 hover:text-gold'}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setIsFilterModalOpen(false);
                                    const catText = filters.categories.length > 0 ? ` para as categorias ${filters.categories.join(', ')}` : '';
                                    const dateText = filters.startDate && filters.endDate ? ` no período de ${new Date(filters.startDate).toLocaleDateString('pt-BR')} a ${new Date(filters.endDate).toLocaleDateString('pt-BR')}` : '';

                                    handlePreviewReport({
                                        title: 'Relatório Customizado',
                                        description: `Relatório gerado com base nos filtros personalizados${catText}${dateText}.`
                                    });
                                }}
                                className="w-full bg-gold text-navy-deep py-5 rounded-2xl font-bold text-[10px] uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] transition-all"
                            >
                                Gerar Relatório Filtrado
                            </button>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};

export default ReportsPage;
