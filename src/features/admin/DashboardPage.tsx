import React, { useEffect, useState, useMemo } from 'react';
import GlassCard from '../../components/ui/GlassCard';
import { supabase } from '../../lib/supabase';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LabelList
} from 'recharts';
import { parseISO } from 'date-fns';
import ConfirmModal from '../../components/ui/ConfirmModal';

// Types
interface Brand {
    id: string;
    name: string;
}

interface Unit {
    id: string;
    name: string;
    brand_id: string;
    regional_id?: string;
}

interface Award {
    id: string;
    name: string;
}

interface Regional {
    id: string;
    name: string;
}

interface Honoree {
    id: string;
    name: string;
    brand_id: string;
    unit_id: string;
    award_id: string;
    regional_id?: string;
    awarded_at: string;
    is_published: boolean;
}

const DashboardPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [awards, setAwards] = useState<Award[]>([]);
    const [regionals, setRegionals] = useState<Regional[]>([]);
    const [honorees, setHonorees] = useState<Honoree[]>([]);

    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ title: 'Aviso', message: '', type: 'warning' as 'warning' | 'danger' | 'info' });

    // Global Filters State
    const [filters, setFilters] = useState({
        regionalId: 'all',
        brandId: 'all',
        unitId: 'all',
        awardId: 'all',
        year: 'all' as number | 'all',
        periodType: 'year' as 'month' | 'semester' | 'year'
    });

    // Hierarchical Filtered Lists
    const filteredBrands = useMemo(() => {
        if (filters.regionalId === 'all') return brands;
        const brandIdsInRegional = new Set(units.filter(u => u.regional_id === filters.regionalId).map(u => u.brand_id));
        return brands.filter(b => brandIdsInRegional.has(b.id));
    }, [brands, units, filters.regionalId]);

    const filteredUnits = useMemo(() => {
        return units.filter(u => {
            const matchRegional = filters.regionalId === 'all' || u.regional_id === filters.regionalId;
            const matchBrand = filters.brandId === 'all' || u.brand_id === filters.brandId;
            return matchRegional && matchBrand;
        });
    }, [units, filters.regionalId, filters.brandId]);

    const filteredAwards = useMemo(() => {
        if (filters.unitId === 'all') return awards;
        const awardIdsInUnit = new Set(honorees.filter(h => h.unit_id === filters.unitId).map(h => h.award_id));
        return awards.filter(a => awardIdsInUnit.has(a.id));
    }, [awards, honorees, filters.unitId]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [brandsRes, unitsRes, awardsRes, regionalsRes, honoreesRes] = await Promise.all([
                supabase.from('brands').select('*').order('name'),
                supabase.from('units').select('*').order('name'),
                supabase.from('awards').select('*').order('name'),
                supabase.from('regionals').select('*').order('name'),
                supabase.from('honorees').select('*').eq('is_published', true)
            ]);

            if (brandsRes.data) setBrands(brandsRes.data);
            if (unitsRes.data) setUnits(unitsRes.data);
            if (awardsRes.data) setAwards(awardsRes.data);
            if (regionalsRes.data) setRegionals(regionalsRes.data);
            if (honoreesRes.data) setHonorees(honoreesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const showAlert = (message: string, title = 'Aviso', type: 'warning' | 'danger' | 'info' = 'warning') => {
        setAlertConfig({ title, message, type });
        setIsAlertModalOpen(true);
    };

    // Helper to apply filters
    const getFilteredHonorees = (filters: any) => {
        let filtered = [...honorees];

        if (filters.brandId && filters.brandId !== 'all') {
            filtered = filtered.filter(h => h.brand_id === filters.brandId);
        }
        if (filters.unitId && filters.unitId !== 'all') {
            filtered = filtered.filter(h => h.unit_id === filters.unitId);
        }
        if (filters.regionalId && filters.regionalId !== 'all') {
            filtered = filtered.filter(h => {
                const unit = units.find(u => u.id === h.unit_id);
                return unit?.regional_id === filters.regionalId;
            });
        }
        if (filters.awardId && filters.awardId !== 'all') {
            filtered = filtered.filter(h => h.award_id === filters.awardId);
        }

        if (filtered.length > 0) {
            filtered = filtered.filter(h => {
                const awardedDate = parseISO(h.awarded_at);
                const year = filters.year;
                const periodType = filters.periodType;

                if (year === 'all') return true;

                if (periodType === 'month') {
                    const now = new Date();
                    return awardedDate.getMonth() === now.getMonth() &&
                        awardedDate.getFullYear() === year;
                } else if (periodType === 'semester') {
                    const now = new Date();
                    const currentSemester = now.getMonth() < 6 ? 1 : 2;
                    const awardSemester = awardedDate.getMonth() < 6 ? 1 : 2;
                    return awardSemester === currentSemester &&
                        awardedDate.getFullYear() === year;
                } else {
                    return awardedDate.getFullYear() === year;
                }
            });
        }
        return filtered;
    };

    // Calculate metrics for each section
    const kpiMetrics = useMemo(() => {
        const filtered = getFilteredHonorees(filters);
        const byBrand: { [key: string]: { name: string; count: number } } = {};
        const byUnit: { [key: string]: { name: string; count: number } } = {};

        filtered.forEach(h => {
            const brand = brands.find(b => b.id === h.brand_id);
            const unit = units.find(u => u.id === h.unit_id);
            if (brand) {
                if (!byBrand[brand.id]) byBrand[brand.id] = { name: brand.name, count: 0 };
                byBrand[brand.id].count++;
            }
            if (unit) {
                if (!byUnit[unit.id]) byUnit[unit.id] = { name: unit.name, count: 0 };
                byUnit[unit.id].count++;
            }
        });

        const brandArray = Object.values(byBrand);
        const unitArray = Object.values(byUnit);

        return {
            total: filtered.length,
            brandsCount: brandArray.length,
            unitsCount: unitArray.length,
            topBrand: brandArray.sort((a, b) => b.count - a.count)[0],
            topUnit: unitArray.sort((a, b) => b.count - a.count)[0]
        };
    }, [honorees, filters, brands, units]);

    const barChartData = useMemo(() => {
        const filtered = getFilteredHonorees(filters);
        const byUnit: { [key: string]: { name: string; count: number } } = {};

        filtered.forEach(h => {
            const unit = units.find(u => u.id === h.unit_id);
            if (unit) {
                if (!byUnit[unit.id]) byUnit[unit.id] = { name: unit.name, count: 0 };
                byUnit[unit.id].count++;
            }
        });

        return Object.values(byUnit).sort((a, b) => b.count - a.count).slice(0, 10);
    }, [honorees, filters, units]);

    const pieChartData = useMemo(() => {
        const filtered = getFilteredHonorees(filters);
        const byBrand: { [key: string]: { name: string; count: number } } = {};

        filtered.forEach(h => {
            const brand = brands.find(b => b.id === h.brand_id);
            if (brand) {
                if (!byBrand[brand.id]) byBrand[brand.id] = { name: brand.name, count: 0 };
                byBrand[brand.id].count++;
            }
        });

        return Object.values(byBrand).sort((a, b) => b.count - a.count);
    }, [honorees, filters, brands]);

    const rankingData = useMemo(() => {
        const filtered = getFilteredHonorees(filters);
        const byAward: {
            [key: string]: {
                name: string;
                count: number;
                regionals: { [key: string]: { name: string; count: number } };
                units: { [key: string]: { name: string; count: number } };
                brands: { [key: string]: { name: string; count: number } };
            }
        } = {};

        filtered.forEach(h => {
            const award = awards.find(a => a.id === h.award_id);
            const unit = units.find(u => u.id === h.unit_id);
            const brand = brands.find(b => b.id === h.brand_id);
            const regional = regionals.find(r => r.id === unit?.regional_id);

            if (award) {
                if (!byAward[award.id]) {
                    byAward[award.id] = { name: award.name, count: 0, regionals: {}, units: {}, brands: {} };
                }
                byAward[award.id].count++;

                if (regional) {
                    if (!byAward[award.id].regionals[regional.id]) {
                        byAward[award.id].regionals[regional.id] = { name: regional.name, count: 0 };
                    }
                    byAward[award.id].regionals[regional.id].count++;
                }

                if (unit) {
                    if (!byAward[award.id].units[unit.id]) {
                        byAward[award.id].units[unit.id] = { name: unit.name, count: 0 };
                    }
                    byAward[award.id].units[unit.id].count++;
                }

                if (brand) {
                    if (!byAward[award.id].brands[brand.id]) {
                        byAward[award.id].brands[brand.id] = { name: brand.name, count: 0 };
                    }
                    byAward[award.id].brands[brand.id].count++;
                }
            }
        });

        return Object.values(byAward).sort((a, b) => b.count - a.count).slice(0, 5);
    }, [honorees, filters, awards, units, regionals, brands]);

    const regionalRankingData = useMemo(() => {
        const filtered = getFilteredHonorees(filters);
        const byRegional: {
            [key: string]: {
                name: string;
                count: number;
                brands: { [key: string]: { name: string; count: number } };
                units: { [key: string]: { name: string; count: number } };
                awards: { [key: string]: { name: string; count: number } };
            }
        } = {};

        filtered.forEach(h => {
            const unit = units.find(u => u.id === h.unit_id);
            const brand = brands.find(b => b.id === h.brand_id);
            const award = awards.find(a => a.id === h.award_id);

            if (unit && unit.regional_id) {
                const regional = regionals.find(r => r.id === unit.regional_id);
                if (regional) {
                    if (!byRegional[regional.id]) {
                        byRegional[regional.id] = { name: regional.name, count: 0, brands: {}, units: {}, awards: {} };
                    }
                    byRegional[regional.id].count++;

                    if (brand) {
                        if (!byRegional[regional.id].brands[brand.id]) {
                            byRegional[regional.id].brands[brand.id] = { name: brand.name, count: 0 };
                        }
                        byRegional[regional.id].brands[brand.id].count++;
                    }

                    if (unit) {
                        if (!byRegional[regional.id].units[unit.id]) {
                            byRegional[regional.id].units[unit.id] = { name: unit.name, count: 0 };
                        }
                        byRegional[regional.id].units[unit.id].count++;
                    }

                    if (award) {
                        if (!byRegional[regional.id].awards[award.id]) {
                            byRegional[regional.id].awards[award.id] = { name: award.name, count: 0 };
                        }
                        byRegional[regional.id].awards[award.id].count++;
                    }
                }
            }
        });

        return Object.values(byRegional).sort((a, b) => b.count - a.count);
    }, [honorees, filters, regionals, units, brands, awards]);

    const handleExportJSON = () => {
        const data = {
            exportDate: new Date().toISOString(),
            kpiMetrics,
            barChartData,
            pieChartData,
            rankingData,
            honorees
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleExportPDF = async () => {
        const element = document.getElementById('report-content');
        if (!element) {
            showAlert('Erro: Conteúdo do relatório não encontrado.', 'Erro', 'danger');
            return;
        }

        setIsExporting(true);

        // Reset scroll to top before capture to avoid offsets
        window.scrollTo(0, 0);

        const originalStyle = element.style.cssText;
        try {
            // @ts-ignore
            const html2pdfModule = await import('html2pdf.js');
            const html2pdf = html2pdfModule.default || html2pdfModule;

            if (typeof html2pdf !== 'function') {
                throw new Error('Biblioteca PDF não carregada corretamente.');
            }

            // Temporarily make it visible and properly positioned for capture
            element.style.position = 'fixed';
            element.style.left = '0';
            element.style.top = '0';
            element.style.right = 'auto';
            element.style.bottom = 'auto';
            element.style.zIndex = '99999';
            element.style.width = '210mm';
            element.style.visibility = 'visible';
            element.style.display = 'block';
            element.style.backgroundColor = '#0A1128';

            // Wait longer for browser to paint and images to load
            await new Promise(resolve => setTimeout(resolve, 2000));

            const opt = {
                margin: 0,
                filename: `relatorio-executivo-${filters.year}.pdf`,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    logging: true,
                    backgroundColor: '#0A1128',
                    removeContainer: true
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            };

            // Use the worker interface for better control
            const worker = html2pdf().set(opt).from(element);
            await worker.save();
        } catch (error: any) {
            console.error('Erro detalhado ao gerar PDF:', error);
            showAlert(`Erro ao gerar PDF: ${error?.message || 'Erro de processamento'}. Tente novamente ou use Ctrl+P.`, 'Erro ao gerar PDF', 'danger');
        } finally {
            element.style.cssText = originalStyle;
            setIsExporting(false);
        }
    };

    const COLORS = ['#D4AF37', '#C0C0C0', '#CD7F32', '#1A2B4B', '#2A4B8C'];

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in pb-20 px-6 md:px-10 lg:px-16 pt-20 lg:pt-8">
            <style>
                {`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 0;
                    }
                    body {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        background-color: #0A1128 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        overflow: visible !important;
                    }
                    /* Hide everything except the structured report */
                    #root > *:not(.print-report-container),
                    aside, nav, .no-print, button, select, .sidebar-container, .sidebar {
                        display: none !important;
                    }
                    .print-report-container {
                        display: block !important;
                        background-color: #0A1128 !important;
                        min-height: 100vh;
                        width: 100%;
                        position: absolute;
                        top: 0;
                        left: 0;
                        z-index: 99999;
                    }
                    .print-break-before {
                        break-before: page;
                    }
                    .print-break-inside-avoid {
                        break-inside: avoid;
                    }
                }
                `}
            </style>
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-8 mb-6">
                <div className="space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold font-serif italic">
                        <span className="text-gold-gradient">Dashboard Estratégico</span>
                    </h2>
                    <p className="text-off-white/40 max-w-2xl text-lg font-light italic">
                        Análise consolidada de mérito institucional e distribuição de láureas.
                    </p>
                </div>
                <div className="flex gap-4 no-print">
                    <button
                        onClick={handleExportPDF}
                        disabled={isExporting}
                        className="bg-gold text-navy-deep px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 shadow-lg shadow-gold/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isExporting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-navy-deep border-t-transparent"></div>
                                GERANDO...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                                EXPORTAR PDF
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleExportJSON}
                        className="bg-white/5 text-off-white/60 px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 hover:text-off-white transition-all flex items-center gap-2 border border-white/10"
                    >
                        <span className="material-symbols-outlined text-lg">database</span>
                        DADOS JSON
                    </button>
                </div>
            </div>

            {/* Empty State */}
            {honorees.length === 0 && (
                <GlassCard className="p-20 rounded-[3rem] border-white/5 text-center">
                    <div className="max-w-md mx-auto space-y-6">
                        <div className="size-24 mx-auto rounded-full bg-gold/5 flex items-center justify-center">
                            <span className="material-symbols-outlined text-5xl text-gold/30">analytics</span>
                        </div>
                        <h3 className="text-2xl font-serif italic text-off-white">Nenhum Dado Disponível</h3>
                        <p className="text-off-white/40 max-w-sm mx-auto">
                            Nenhuma premiação foi cadastrada ainda. Comece cadastrando marcas, unidades e homenageados para visualizar os dados.
                        </p>
                        <div className="flex gap-4 justify-center pt-4">
                            <button
                                onClick={() => window.location.href = '/admin/marcas'}
                                className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-off-white hover:border-gold/30 transition-all text-sm font-medium"
                            >
                                Gerenciar Marcas
                            </button>
                            <button
                                onClick={() => window.location.href = '/admin/homenageados/novo'}
                                className="px-6 py-3 rounded-xl bg-gold text-navy-deep hover:bg-gold-light transition-all text-sm font-bold"
                            >
                                Cadastrar Premiação
                            </button>
                        </div>
                    </div>
                </GlassCard>
            )}

            {honorees.length > 0 && (
                <>
                    {/* KPI Section with Filters */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center no-print">
                            <h3 className="text-sm font-bold text-gold uppercase tracking-[0.3em]">Métricas Gerais</h3>
                            <div className="flex gap-3">
                                <select
                                    className="bg-navy-deep border border-white/10 text-off-white text-[10px] rounded-lg px-3 py-1.5 outline-none focus:border-gold/50"
                                    value={filters.regionalId}
                                    onChange={(e) => setFilters({ ...filters, regionalId: e.target.value, brandId: 'all', unitId: 'all', awardId: 'all' })}
                                >
                                    <option value="all">Todas as Regionais</option>
                                    {regionals.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                                <select
                                    className="bg-navy-deep border border-white/10 text-off-white text-[10px] rounded-lg px-3 py-1.5 outline-none focus:border-gold/50"
                                    value={filters.brandId}
                                    onChange={(e) => setFilters({ ...filters, brandId: e.target.value, unitId: 'all', awardId: 'all' })}
                                >
                                    <option value="all">Todas as Marcas</option>
                                    {filteredBrands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                                <select
                                    className="bg-navy-deep border border-white/10 text-off-white text-[10px] rounded-lg px-3 py-1.5 outline-none focus:border-gold/50"
                                    value={filters.unitId}
                                    onChange={(e) => setFilters({ ...filters, unitId: e.target.value, awardId: 'all' })}
                                >
                                    <option value="all">Todas as Unidades</option>
                                    {filteredUnits.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                                </select>
                                <select
                                    className="bg-navy-deep border border-white/10 text-off-white text-[10px] rounded-lg px-3 py-1.5 outline-none focus:border-gold/50"
                                    value={filters.awardId}
                                    onChange={(e) => setFilters({ ...filters, awardId: e.target.value })}
                                >
                                    <option value="all">Todos os Prêmios</option>
                                    {filteredAwards.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                                <div className="flex gap-1 bg-navy-deep rounded-lg border border-white/10 p-0.5">
                                    <select
                                        className="bg-navy-deep border border-white/10 text-off-white text-[10px] outline-none px-1 rounded cursor-pointer hover:border-gold/50 transition-colors"
                                        style={{ backgroundColor: '#0A1128', color: 'white' }}
                                        value={filters.year}
                                        onChange={(e) => setFilters({ ...filters, year: e.target.value === 'all' ? 'all' : Number(e.target.value) })}
                                    >
                                        <option value="all" style={{ backgroundColor: '#0A1128', color: 'white' }}>Todos os Anos</option>
                                        {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(y => (
                                            <option key={y} value={y} style={{ backgroundColor: '#0A1128', color: 'white' }}>{y}</option>
                                        ))}
                                    </select>
                                    {(['month', 'semester', 'year'] as const).map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setFilters({ ...filters, periodType: p })}
                                            disabled={filters.year === 'all' && (p === 'month' || p === 'semester')}
                                            className={`px-2 py-1 rounded-md text-[8px] font-bold uppercase transition-all ${filters.periodType === p ? 'bg-gold text-navy-deep' : 'text-off-white/40 hover:text-off-white'} ${(filters.year === 'all' && (p === 'month' || p === 'semester')) ? 'opacity-20 cursor-not-allowed' : ''}`}
                                        >
                                            {p === 'month' ? 'Mês' : p === 'semester' ? 'Sem' : 'Ano'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 print-break-inside-avoid">
                            <GlassCard className="p-8 rounded-3xl border-white/5 bg-gradient-to-br from-gold/10 to-transparent">
                                <p className="text-[9px] font-bold text-off-white/40 uppercase tracking-[0.2em] mb-4">Total de Premiações</p>
                                <div className="flex items-end gap-3">
                                    <span className="text-4xl font-bold font-serif text-off-white italic">{kpiMetrics.total}</span>
                                    <span className="material-symbols-outlined text-gold mb-1">military_tech</span>
                                </div>
                            </GlassCard>

                            <GlassCard className="p-8 rounded-3xl border-white/5">
                                <p className="text-[9px] font-bold text-off-white/40 uppercase tracking-[0.2em] mb-4">Marcas Ativas</p>
                                <div className="flex items-end gap-3">
                                    <span className="text-4xl font-bold font-serif text-off-white italic">{kpiMetrics.brandsCount}</span>
                                    <span className="material-symbols-outlined text-gold/50 mb-1">hub</span>
                                </div>
                            </GlassCard>

                            <GlassCard className="p-8 rounded-3xl border-white/5">
                                <p className="text-[9px] font-bold text-off-white/40 uppercase tracking-[0.2em] mb-4">Unidades Premiadas</p>
                                <div className="flex items-end gap-3">
                                    <span className="text-4xl font-bold font-serif text-off-white italic">{kpiMetrics.unitsCount}</span>
                                    <span className="material-symbols-outlined text-gold/50 mb-1">location_city</span>
                                </div>
                            </GlassCard>

                            <GlassCard className="p-8 rounded-3xl border-white/5 border-gold/20 bg-gold/5">
                                <p className="text-[9px] font-bold text-gold uppercase tracking-[0.2em] mb-4">Top Marca</p>
                                <div className="space-y-1" title={kpiMetrics.topBrand?.name || ''}>
                                    <p className="text-xl font-bold text-off-white truncate">{kpiMetrics.topBrand?.name || 'N/A'}</p>
                                    <p className="text-[10px] text-gold/60 uppercase tracking-widest">{kpiMetrics.topBrand?.count || 0} prêmios</p>
                                </div>
                            </GlassCard>

                            <GlassCard className="p-8 rounded-3xl border-white/5 border-gold/20 bg-gold/5">
                                <p className="text-[9px] font-bold text-gold uppercase tracking-[0.2em] mb-4">Top Unidade</p>
                                <div className="space-y-1" title={kpiMetrics.topUnit?.name || ''}>
                                    <p className="text-xl font-bold text-off-white truncate">{kpiMetrics.topUnit?.name || 'N/A'}</p>
                                    <p className="text-[10px] text-gold/60 uppercase tracking-widest">{kpiMetrics.topUnit?.count || 0} prêmios</p>
                                </div>
                            </GlassCard>
                        </div>
                    </div>

                    {/* Charts Row 1 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 print-break-inside-avoid">
                        <GlassCard className="p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border-white/5">
                            <div className="flex flex-wrap justify-between items-center gap-4 mb-6 md:mb-10">
                                <h3 className="text-lg md:text-xl font-serif italic text-off-white">Premiações por Unidade (Top 10)</h3>
                                <div className="hidden md:flex gap-2 no-print opacity-50 cursor-not-allowed pointer-events-none">
                                    <span className="text-[9px] text-off-white/40 uppercase tracking-widest">Filtros Globais Ativos</span>
                                </div>
                            </div>
                            <div className="h-[300px] md:h-[400px] w-full">
                                {barChartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={barChartData}
                                            layout="vertical"
                                            margin={{
                                                left: window.innerWidth < 768 ? -20 : 60,
                                                right: window.innerWidth < 768 ? 20 : 60,
                                                top: 5,
                                                bottom: 5
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={false} />
                                            <XAxis type="number" hide />
                                            <YAxis
                                                dataKey="name"
                                                type="category"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#ffffff80', fontSize: window.innerWidth < 768 ? 9 : 11, fontWeight: 500 }}
                                                width={window.innerWidth < 768 ? 100 : 150}
                                            />
                                            <Tooltip
                                                cursor={{ fill: '#ffffff05' }}
                                                contentStyle={{ backgroundColor: '#0A1128', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                                itemStyle={{ color: '#D4AF37', fontWeight: 'bold' }}
                                                formatter={(value: any) => [value, 'Prêmios']}
                                                labelStyle={{ color: '#ffffff40', marginBottom: '4px' }}
                                            />
                                            <Bar dataKey="count" fill="#D4AF37" radius={[0, 10, 10, 0]} barSize={window.innerWidth < 768 ? 12 : 20}>
                                                <LabelList dataKey="count" position="right" fill="#D4AF37" fontSize={window.innerWidth < 768 ? 10 : 12} fontWeight="bold" offset={10} />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-off-white/30 text-sm italic">
                                        Nenhum dado disponível
                                    </div>
                                )}
                            </div>
                        </GlassCard>

                        <GlassCard className="p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border-white/5">
                            <div className="flex flex-wrap justify-between items-center gap-4 mb-6 md:mb-10">
                                <h3 className="text-lg md:text-xl font-serif italic text-off-white">Distribuição por Marca</h3>
                                <div className="hidden md:flex gap-2 no-print opacity-50 cursor-not-allowed pointer-events-none">
                                    <span className="text-[9px] text-off-white/40 uppercase tracking-widest">Filtros Globais Ativos</span>
                                </div>
                            </div>
                            <div className="h-[300px] md:h-[400px] w-full flex items-center">
                                {pieChartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieChartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={window.innerWidth < 768 ? 50 : 70}
                                                outerRadius={window.innerWidth < 768 ? 80 : 120}
                                                paddingAngle={5}
                                                dataKey="count"
                                                label={window.innerWidth < 768 ? false : ({ name, value }) => `${name}: ${value}`}
                                                labelLine={window.innerWidth >= 768}
                                            >
                                                {pieChartData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#0A1128', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                                itemStyle={{ color: '#D4AF37', fontWeight: 'bold' }}
                                                formatter={(value: any) => [value, 'Prêmios']}
                                            />
                                            <Legend
                                                verticalAlign="bottom"
                                                height={36}
                                                formatter={(value) => <span className="text-[10px] text-off-white/40 uppercase tracking-widest">{value}</span>}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center w-full text-off-white/30 text-sm italic">
                                        Nenhum dado disponível
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </div>


                    {/* Rankings & Export */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <GlassCard className="p-10 rounded-[3rem] border-white/5 print-break-inside-avoid">
                            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                                <h3 className="text-xl font-serif italic text-off-white">Ranking por Prêmio</h3>

                                <div className="flex flex-wrap gap-3 no-print opacity-50 cursor-not-allowed pointer-events-none">
                                    <span className="text-[9px] text-off-white/40 uppercase tracking-widest">Filtros Globais Ativos</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {rankingData.length > 0 ? (
                                    rankingData.map((award: any, i: number) => (
                                        <div key={i} className="relative flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-gold/30 transition-all hover:bg-white/[0.05]">
                                            <div className="flex items-center gap-6">
                                                <span className="text-2xl font-serif italic text-gold/20 group-hover:text-gold transition-colors">#{(i + 1).toString().padStart(2, '0')}</span>
                                                <div title={award.name}>
                                                    <p className="text-off-white font-medium truncate max-w-[150px] md:max-w-[300px]">{award.name}</p>
                                                    <p className="text-[10px] text-off-white/20 uppercase tracking-widest">Distribuição de Mérito</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-bold text-gold">{award.count}</p>
                                                <p className="text-[9px] text-off-white/20 uppercase tracking-tighter">Láureas</p>
                                            </div>

                                            {/* Expanded Hover Detail Panel */}
                                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-6 w-[600px] p-10 bg-navy-deep/98 backdrop-blur-3xl border border-gold/40 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.9)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 z-[100] pointer-events-none">
                                                <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                                                    <div>
                                                        <h4 className="text-2xl font-serif italic text-gold mb-1">{award.name}</h4>
                                                        <p className="text-[10px] text-off-white/40 uppercase tracking-[0.3em]">Detalhamento Completo de Distribuição</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-4xl font-bold text-off-white font-serif italic">{award.count}</span>
                                                        <p className="text-[8px] text-gold uppercase tracking-widest font-bold">Láureas Totais</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-6">
                                                    {/* Regionais */}
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="material-symbols-outlined text-gold/60 text-xs">public</span>
                                                            <p className="text-[9px] font-bold text-gold/80 uppercase tracking-widest">Regionais</p>
                                                        </div>
                                                        <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                                                            {Object.values(award.regionals).sort((a: any, b: any) => b.count - a.count).map((reg: any, idx: number) => (
                                                                <div key={idx} className="flex justify-between items-center bg-white/[0.03] p-2.5 rounded-xl border border-white/5 hover:bg-white/[0.06] transition-colors">
                                                                    <p className="text-[10px] text-off-white/80 truncate pr-2">{reg.name}</p>
                                                                    <p className="text-[10px] font-bold text-gold">{reg.count}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Marcas */}
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="material-symbols-outlined text-gold/60 text-xs">hub</span>
                                                            <p className="text-[9px] font-bold text-gold/80 uppercase tracking-widest">Marcas</p>
                                                        </div>
                                                        <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                                                            {Object.values(award.brands).sort((a: any, b: any) => b.count - a.count).map((brand: any, idx: number) => (
                                                                <div key={idx} className="flex justify-between items-center bg-white/[0.03] p-2.5 rounded-xl border border-white/5 hover:bg-white/[0.06] transition-colors">
                                                                    <p className="text-[10px] text-off-white/80 truncate pr-2">{brand.name}</p>
                                                                    <p className="text-[10px] font-bold text-gold">{brand.count}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Unidades */}
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="material-symbols-outlined text-gold/60 text-xs">location_city</span>
                                                            <p className="text-[9px] font-bold text-gold/80 uppercase tracking-widest">Unidades</p>
                                                        </div>
                                                        <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                                                            {Object.values(award.units).sort((a: any, b: any) => b.count - a.count).map((unit: any, idx: number) => (
                                                                <div key={idx} className="flex justify-between items-center bg-white/[0.03] p-2.5 rounded-xl border border-white/5 hover:bg-white/[0.06] transition-colors">
                                                                    <p className="text-[10px] text-off-white/80 truncate pr-2">{unit.name}</p>
                                                                    <p className="text-[10px] font-bold text-gold">{unit.count}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                                                    <p className="text-[8px] text-off-white/20 uppercase tracking-widest italic">Análise baseada no período de {filters.year === 'all' ? 'todo o histórico' : filters.year}</p>
                                                    <div className="flex gap-2">
                                                        <span className="size-1.5 rounded-full bg-gold animate-pulse"></span>
                                                        <span className="size-1.5 rounded-full bg-gold/50"></span>
                                                        <span className="size-1.5 rounded-full bg-gold/20"></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10">
                                        <p className="text-off-white/30 text-sm italic">Nenhum prêmio registrado no período selecionado</p>
                                    </div>
                                )}
                            </div>
                        </GlassCard>

                        <GlassCard className="p-10 rounded-[3rem] border-white/5 print-break-inside-avoid">
                            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                                <h3 className="text-xl font-serif italic text-off-white">Ranking por Regional</h3>
                                <div className="flex flex-wrap gap-3 no-print opacity-50 cursor-not-allowed pointer-events-none">
                                    <span className="text-[9px] text-off-white/40 uppercase tracking-widest">Filtros Globais Ativos</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {regionalRankingData.length > 0 ? (
                                    regionalRankingData.map((reg: any, i: number) => (
                                        <div key={i} className="relative flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-gold/30 transition-all hover:bg-white/[0.05]">
                                            <div className="flex items-center gap-4">
                                                <span className="text-xl font-serif italic text-gold/20 group-hover:text-gold transition-colors">#{(i + 1).toString().padStart(2, '0')}</span>
                                                <span className="text-off-white font-medium">{reg.name}</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-gold">{reg.count}</p>
                                            </div>

                                            {/* Expanded Hover Detail Panel */}
                                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-6 w-[600px] p-10 bg-navy-deep/98 backdrop-blur-3xl border border-gold/40 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.9)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 z-[100] pointer-events-none">
                                                <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
                                                    <div>
                                                        <h4 className="text-2xl font-serif italic text-gold mb-1">{reg.name}</h4>
                                                        <p className="text-[10px] text-off-white/40 uppercase tracking-[0.3em]">Performance Regional Detalhada</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-4xl font-bold text-off-white font-serif italic">{reg.count}</span>
                                                        <p className="text-[8px] text-gold uppercase tracking-widest font-bold">Total</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-6">
                                                    {/* Marcas */}
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="material-symbols-outlined text-gold/60 text-xs">hub</span>
                                                            <p className="text-[9px] font-bold text-gold/80 uppercase tracking-widest">Marcas</p>
                                                        </div>
                                                        <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                                                            {Object.values(reg.brands).sort((a: any, b: any) => b.count - a.count).map((brand: any, idx: number) => (
                                                                <div key={idx} className="flex justify-between items-center bg-white/[0.03] p-2.5 rounded-xl border border-white/5 hover:bg-white/[0.06] transition-colors">
                                                                    <p className="text-[10px] text-off-white/80 truncate pr-2">{brand.name}</p>
                                                                    <p className="text-[10px] font-bold text-gold">{brand.count}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Unidades */}
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="material-symbols-outlined text-gold/60 text-xs">location_city</span>
                                                            <p className="text-[9px] font-bold text-gold/80 uppercase tracking-widest">Unidades</p>
                                                        </div>
                                                        <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                                                            {Object.values(reg.units).sort((a: any, b: any) => b.count - a.count).map((unit: any, idx: number) => (
                                                                <div key={idx} className="flex justify-between items-center bg-white/[0.03] p-2.5 rounded-xl border border-white/5 hover:bg-white/[0.06] transition-colors">
                                                                    <p className="text-[10px] text-off-white/80 truncate pr-2">{unit.name}</p>
                                                                    <p className="text-[10px] font-bold text-gold">{unit.count}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Prêmios */}
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="material-symbols-outlined text-gold/60 text-xs">military_tech</span>
                                                            <p className="text-[9px] font-bold text-gold/80 uppercase tracking-widest">Prêmios</p>
                                                        </div>
                                                        <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                                                            {Object.values(reg.awards).sort((a: any, b: any) => b.count - a.count).map((award: any, idx: number) => (
                                                                <div key={idx} className="flex justify-between items-center bg-white/[0.03] p-2.5 rounded-xl border border-white/5 hover:bg-white/[0.06] transition-colors">
                                                                    <p className="text-[10px] text-off-white/80 truncate pr-2">{award.name}</p>
                                                                    <p className="text-[10px] font-bold text-gold">{award.count}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                                                    <p className="text-[8px] text-off-white/20 uppercase tracking-widest italic">Dados consolidados por regional</p>
                                                    <div className="flex gap-2">
                                                        <span className="size-1.5 rounded-full bg-gold/50"></span>
                                                        <span className="size-1.5 rounded-full bg-gold/30"></span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10">
                                        <p className="text-off-white/30 text-sm italic">Nenhum dado regional disponível</p>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </div>
                </>
            )}

            {/* Print-only structured report - Positioned off-screen for capture but accessible for rendering */}
            <div
                id="report-content"
                className="absolute -left-[5000px] top-0 w-[210mm] bg-navy-deep print:static print:left-0 print:block"
                style={{ zIndex: -1 }}
            >
                {/* Capa */}
                <div className="h-[297mm] flex flex-col justify-center items-center text-center p-20 relative overflow-hidden">
                    {/* Decorative elements for PDF */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gold"></div>
                    <div className="absolute bottom-0 left-0 w-full h-2 bg-gold"></div>

                    <div className="mb-16">
                        <img src="/assets/logo-ser.png" alt="Logo" className="w-64 mx-auto drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]" />
                    </div>

                    <div className="space-y-6 mb-20">
                        <h1 className="text-8xl font-serif italic text-gold font-bold tracking-tight">Relatório Executivo</h1>
                        <div className="h-1 w-32 bg-gold/30 mx-auto"></div>
                        <h2 className="text-4xl text-off-white font-light tracking-widest uppercase">Dashboard Estratégico</h2>
                    </div>

                    <div className="w-full max-w-4xl bg-white/[0.03] p-16 rounded-[3rem] border border-white/10">
                        <div className="grid grid-cols-2 gap-12 text-left">
                            <div className="space-y-3">
                                <p className="text-gold text-[10px] font-bold uppercase tracking-[0.4em]">Período de Análise</p>
                                <p className="text-3xl text-off-white font-serif italic">
                                    {filters.periodType === 'month' ? 'Mensal' : filters.periodType === 'semester' ? 'Semestral' : 'Anual'}
                                    <span className="text-gold/50 ml-3">{filters.year}</span>
                                </p>
                            </div>
                            <div className="space-y-3">
                                <p className="text-gold text-[10px] font-bold uppercase tracking-[0.4em]">Data de Emissão</p>
                                <p className="text-3xl text-off-white font-serif italic">{new Date().toLocaleDateString('pt-BR')}</p>
                            </div>
                            <div className="col-span-2 pt-10 border-t border-white/10">
                                <p className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-6">Parâmetros de Filtro</p>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex items-center gap-3">
                                        <span className="size-2 rounded-full bg-gold"></span>
                                        <p className="text-off-white/60 text-sm uppercase tracking-widest"><span className="text-off-white font-bold">Regional:</span> {regionals.find(r => r.id === filters.regionalId)?.name || 'Todas'}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="size-2 rounded-full bg-gold"></span>
                                        <p className="text-off-white/60 text-sm uppercase tracking-widest"><span className="text-off-white font-bold">Marca:</span> {brands.find(b => b.id === filters.brandId)?.name || 'Todas'}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="size-2 rounded-full bg-gold"></span>
                                        <p className="text-off-white/60 text-sm uppercase tracking-widest"><span className="text-off-white font-bold">Unidade:</span> {units.find(u => u.id === filters.unitId)?.name || 'Todas'}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="size-2 rounded-full bg-gold"></span>
                                        <p className="text-off-white/60 text-sm uppercase tracking-widest"><span className="text-off-white font-bold">Prêmio:</span> {awards.find(a => a.id === filters.awardId)?.name || 'Todos'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KPIs Page */}
                <div className="h-[297mm] p-20 print-break-before">
                    <div className="flex justify-between items-end mb-16 border-b border-gold/20 pb-8">
                        <div>
                            <p className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-2">Seção 01</p>
                            <h3 className="text-4xl font-serif italic text-off-white">Indicadores de Performance</h3>
                        </div>
                        <p className="text-off-white/20 text-xs uppercase tracking-widest">Ser Educacional • {filters.year}</p>
                    </div>

                    {kpiMetrics.total === 0 ? (
                        <div className="h-64 flex items-center justify-center border-2 border-dashed border-white/10 rounded-[2rem]">
                            <p className="text-off-white/40 italic text-xl">Nenhum dado disponível para os filtros selecionados.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-10">
                            <div className="p-12 bg-white/[0.03] rounded-[2.5rem] border border-white/10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <span className="material-symbols-outlined text-6xl text-gold">military_tech</span>
                                </div>
                                <p className="text-gold text-[10px] font-bold uppercase tracking-[0.3em] mb-6">Total de Premiações</p>
                                <p className="text-8xl font-serif italic text-off-white font-bold">{kpiMetrics.total}</p>
                            </div>
                            <div className="p-12 bg-white/[0.03] rounded-[2.5rem] border border-white/10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <span className="material-symbols-outlined text-6xl text-gold">location_city</span>
                                </div>
                                <p className="text-gold text-[10px] font-bold uppercase tracking-[0.3em] mb-6">Unidades Premiadas</p>
                                <p className="text-8xl font-serif italic text-off-white font-bold">{kpiMetrics.unitsCount}</p>
                            </div>
                            <div className="p-12 bg-gold/5 rounded-[2.5rem] border border-gold/20">
                                <p className="text-gold text-[10px] font-bold uppercase tracking-[0.3em] mb-6">Marca em Destaque</p>
                                <p className="text-4xl font-serif italic text-off-white mb-2">{kpiMetrics.topBrand?.name || 'N/A'}</p>
                                <div className="flex items-center gap-2">
                                    <span className="h-px w-8 bg-gold/50"></span>
                                    <p className="text-gold font-bold text-lg">{kpiMetrics.topBrand?.count || 0} <span className="text-[10px] uppercase tracking-widest ml-1">Láureas</span></p>
                                </div>
                            </div>
                            <div className="p-12 bg-gold/5 rounded-[2.5rem] border border-gold/20">
                                <p className="text-gold text-[10px] font-bold uppercase tracking-[0.3em] mb-6">Unidade em Destaque</p>
                                <p className="text-4xl font-serif italic text-off-white mb-2">{kpiMetrics.topUnit?.name || 'N/A'}</p>
                                <div className="flex items-center gap-2">
                                    <span className="h-px w-8 bg-gold/50"></span>
                                    <p className="text-gold font-bold text-lg">{kpiMetrics.topUnit?.count || 0} <span className="text-[10px] uppercase tracking-widest ml-1">Láureas</span></p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Charts Page */}
                <div className="h-[297mm] p-20 print-break-before">
                    <div className="flex justify-between items-end mb-16 border-b border-gold/20 pb-8">
                        <div>
                            <p className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-2">Seção 02</p>
                            <h3 className="text-4xl font-serif italic text-off-white">Análise de Distribuição</h3>
                        </div>
                        <p className="text-off-white/20 text-xs uppercase tracking-widest">Ser Educacional • {filters.year}</p>
                    </div>

                    <div className="space-y-12">
                        <div className="bg-white/[0.03] p-12 rounded-[3rem] border border-white/10">
                            <h4 className="text-2xl text-off-white mb-10 font-serif italic flex items-center gap-4">
                                <span className="size-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center text-sm not-italic font-bold">01</span>
                                Premiações por Unidade (Top 10)
                            </h4>
                            <div className="h-[350px] w-full">
                                {barChartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={barChartData} layout="vertical" margin={{ left: 150, right: 80 }}>
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="name" type="category" tick={{ fill: '#ffffff90', fontSize: 12, fontWeight: 600 }} width={160} axisLine={false} tickLine={false} />
                                            <Bar dataKey="count" fill="#D4AF37" radius={[0, 8, 8, 0]} barSize={24}>
                                                <LabelList dataKey="count" position="right" fill="#D4AF37" fontSize={14} fontWeight="bold" offset={15} />
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : <p className="text-off-white/20 italic text-center py-20">Sem dados para exibição gráfica.</p>}
                            </div>
                        </div>

                        <div className="bg-white/[0.03] p-12 rounded-[3rem] border border-white/10">
                            <h4 className="text-2xl text-off-white mb-10 font-serif italic flex items-center gap-4">
                                <span className="size-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center text-sm not-italic font-bold">02</span>
                                Market Share por Marca
                            </h4>
                            <div className="h-[350px] w-full flex items-center justify-center">
                                {pieChartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieChartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={90}
                                                outerRadius={140}
                                                paddingAngle={8}
                                                dataKey="count"
                                                label={({ name, value, percent }) => `${name}: ${value} (${((percent || 0) * 100).toFixed(0)}%)`}
                                                labelLine={{ stroke: '#ffffff20' }}
                                            >
                                                {pieChartData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : <p className="text-off-white/20 italic text-center py-20">Sem dados para exibição gráfica.</p>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rankings Page */}
                <div className="h-[297mm] p-20 print-break-before">
                    <div className="flex justify-between items-end mb-16 border-b border-gold/20 pb-8">
                        <div>
                            <p className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-2">Seção 03</p>
                            <h3 className="text-4xl font-serif italic text-off-white">Rankings de Mérito</h3>
                        </div>
                        <p className="text-off-white/20 text-xs uppercase tracking-widest">Ser Educacional • {filters.year}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-16">
                        <div className="space-y-8">
                            <h4 className="text-xl text-gold font-bold uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                <span className="material-symbols-outlined text-gold/50">military_tech</span>
                                Por Categoria
                            </h4>
                            <div className="space-y-4">
                                {rankingData.map((award, i) => (
                                    <div key={i} className="flex items-center justify-between p-6 bg-white/[0.03] rounded-2xl border border-white/10">
                                        <div className="flex items-center gap-5">
                                            <span className="text-2xl font-serif italic text-gold/30 font-bold">#{(i + 1).toString().padStart(2, '0')}</span>
                                            <span className="text-off-white font-medium text-lg">{award.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-2xl font-bold text-gold block">{award.count}</span>
                                            <span className="text-[8px] text-off-white/20 uppercase tracking-widest">Láureas</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-8">
                            <h4 className="text-xl text-gold font-bold uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                <span className="material-symbols-outlined text-gold/50">public</span>
                                Por Regional
                            </h4>
                            <div className="space-y-4">
                                {regionalRankingData.map((reg, i) => (
                                    <div key={i} className="flex items-center justify-between p-6 bg-white/[0.03] rounded-2xl border border-white/10">
                                        <div className="flex items-center gap-5">
                                            <span className="text-2xl font-serif italic text-gold/30 font-bold">#{(i + 1).toString().padStart(2, '0')}</span>
                                            <span className="text-off-white font-medium text-lg">{reg.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-2xl font-bold text-gold block">{reg.count}</span>
                                            <span className="text-[8px] text-off-white/20 uppercase tracking-widest">Láureas</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-32 pt-10 border-t border-white/5 text-center">
                        <p className="text-[10px] text-off-white/20 uppercase tracking-[0.5em]">Fim do Relatório Executivo • Ser Educacional</p>
                    </div>
                </div>
            </div>
            <ConfirmModal
                isOpen={isAlertModalOpen}
                onClose={() => setIsAlertModalOpen(false)}
                onConfirm={() => setIsAlertModalOpen(false)}
                title={alertConfig.title}
                message={alertConfig.message}
                confirmLabel="OK"
                type={alertConfig.type}
            />
        </div>
    );
};

export default DashboardPage;
