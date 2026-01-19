import React from 'react';

interface ReportTemplateProps {
    title: string;
    description: string;
    stats: {
        awards: number;
        honorees: number;
        units: number;
        publishedHonorees: number;
    };
    date: string;
}

const ReportTemplate: React.FC<ReportTemplateProps> = ({ title, description, stats, date }) => {
    return (
        <div id="report-content" className="hidden print:block bg-white text-navy-deep p-16 w-[210mm] min-h-[297mm] mx-auto relative overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-gold pb-8 mb-12">
                <div>
                    <img src="/assets/logo-ser.png" alt="Ser Educacional" className="h-16 object-contain grayscale mb-4" />
                    <h1 className="text-3xl font-serif font-bold text-navy-deep uppercase tracking-wider">{title}</h1>
                    <p className="text-sm text-navy-deep/60 font-medium uppercase tracking-widest">Relatório Estratégico • {date}</p>
                </div>
                <div className="text-right">
                    <div className="text-[10px] font-bold text-gold uppercase tracking-[0.3em]">Confidencial</div>
                    <div className="text-[10px] font-bold text-navy-deep/40 uppercase tracking-[0.3em]">Uso Executivo</div>
                </div>
            </div>

            {/* Summary */}
            <div className="mb-12">
                <h2 className="text-xl font-serif font-bold text-navy-deep mb-4 italic">Resumo Executivo</h2>
                <p className="text-lg leading-relaxed text-navy-deep/80 italic">
                    {description}
                </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-8 mb-16">
                <div className="p-8 bg-gold/5 border border-gold/10 rounded-3xl">
                    <div className="text-[10px] font-bold text-gold uppercase tracking-[0.3em] mb-2">Total de Premiações</div>
                    <div className="text-5xl font-serif font-bold text-navy-deep">{stats.awards}</div>
                </div>
                <div className="p-8 bg-gold/5 border border-gold/10 rounded-3xl">
                    <div className="text-[10px] font-bold text-gold uppercase tracking-[0.3em] mb-2">Unidades Ativas</div>
                    <div className="text-5xl font-serif font-bold text-navy-deep">{stats.units}</div>
                </div>
                <div className="p-8 bg-gold/5 border border-gold/10 rounded-3xl">
                    <div className="text-[10px] font-bold text-gold uppercase tracking-[0.3em] mb-2">Homenageados Totais</div>
                    <div className="text-5xl font-serif font-bold text-navy-deep">{stats.honorees}</div>
                </div>
                <div className="p-8 bg-gold/5 border border-gold/10 rounded-3xl">
                    <div className="text-[10px] font-bold text-gold uppercase tracking-[0.3em] mb-2">Registros Publicados</div>
                    <div className="text-5xl font-serif font-bold text-navy-deep">{stats.publishedHonorees}</div>
                </div>
            </div>

            {/* Detailed Analysis Placeholder */}
            <div className="space-y-8">
                <h2 className="text-xl font-serif font-bold text-navy-deep italic">Análise Detalhada</h2>
                <div className="space-y-6">
                    <div className="border-l-4 border-gold/30 pl-6 py-2">
                        <h3 className="font-bold text-navy-deep mb-2">Distribuição Geográfica</h3>
                        <p className="text-sm text-navy-deep/60 leading-relaxed">
                            A capilaridade das premiações demonstra um engajamento sólido em todas as {stats.units} unidades, com destaque para os centros de excelência em pesquisa e inovação.
                        </p>
                    </div>
                    <div className="border-l-4 border-gold/30 pl-6 py-2">
                        <h3 className="font-bold text-navy-deep mb-2">Impacto no Reconhecimento</h3>
                        <p className="text-sm text-navy-deep/60 leading-relaxed">
                            Com {stats.publishedHonorees} registros públicos, o sistema de mérito consolida a cultura de excelência do Grupo Ser Educacional, promovendo visibilidade institucional.
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-16 left-16 right-16 border-t border-navy-deep/10 pt-8 flex justify-between items-center text-[10px] font-bold text-navy-deep/30 uppercase tracking-[0.2em]">
                <div>© 2026 Ser Educacional • Sistema de Gestão de Mérito</div>
                <div>Página 01 de 01</div>
            </div>
        </div>
    );
};

export default ReportTemplate;
