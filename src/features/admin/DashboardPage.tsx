import React, { useEffect, useState, useMemo } from 'react';
import GlassCard from '../../components/ui/GlassCard';
import { supabase } from '../../lib/supabase';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { parseISO } from 'date-fns';

// Types
interface Brand {
    id: string;
    name: string;
}

interface Unit {
    id: string;
    name: string;
    brand_id: string;
}

interface Honoree {
    id: string;
    name: string;
    brand_id: string;
    unit_id: string;
    awarded_at: string;
    is_published: boolean;
}

const DashboardPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [honorees, setHonorees] = useState<Honoree[]>([]);

    // Filters
    const [selectedBrandId, setSelectedBrandId] = useState<string>('all');
    const [selectedUnitId, setSelectedUnitId] = useState<string>('all');
    const [periodType, setPeriodType] = useState<'month' | 'semester' | 'year'>('year');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [brandsRes, unitsRes, honoreesRes] = await Promise.all([
                supabase.from('brands').select('*').order('name'),
                supabase.from('units').select('*').order('name'),
                supabase.from('honorees').select('*').eq('is_published', true)
            ]);

            if (brandsRes.data) setBrands(brandsRes.data);
            if (unitsRes.data) setUnits(unitsRes.data);
            if (honoreesRes.data) setHonorees(honoreesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Apply filters
    const filteredHonorees = useMemo(() => {
        let filtered = [...honorees];

        // Brand filter
        if (selectedBrandId !== 'all') {
            filtered = filtered.filter(h => h.brand_id === selectedBrandId);
        }

        // Unit filter
        if (selectedUnitId !== 'all') {
            filtered = filtered.filter(h => h.unit_id === selectedUnitId);
        }

        // Period filter
        if (filtered.length > 0) {
            const now = new Date();
            filtered = filtered.filter(h => {
                const awardedDate = parseISO(h.awarded_at);

                if (periodType === 'month') {
                    return awardedDate.getMonth() === now.getMonth() &&
                        awardedDate.getFullYear() === now.getFullYear();
                } else if (periodType === 'semester') {
                    const currentSemester = now.getMonth() < 6 ? 1 : 2;
                    const awardSemester = awardedDate.getMonth() < 6 ? 1 : 2;
                    return awardSemester === currentSemester &&
                        awardedDate.getFullYear() === now.getFullYear();
                } else {
                    return awardedDate.getFullYear() === now.getFullYear();
                }
            });
        }

        return filtered;
    }, [honorees, selectedBrandId, selectedUnitId, periodType]);

    // Calculate metrics
    const metrics = useMemo(() => {
        const byBrand: { [key: string]: { name: string; count: number } } = {};
        const byUnit: { [key: string]: { name: string; count: number } } = {};

        filteredHonorees.forEach(h => {
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
            total: filteredHonorees.length,
            byBrand: brandArray,
            byUnit: unitArray,
            topBrand: brandArray.sort((a, b) => b.count - a.count)[0],
            topUnit: unitArray.sort((a, b) => b.count - a.count)[0]
        };
    }, [filteredHonorees, brands, units]);

    // Chart Data: Top 10 Units
    const unitChartData = useMemo(() => {
        return metrics.byUnit
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }, [metrics.byUnit]);

    // Chart Data: Awards by Brand
    const brandChartData = useMemo(() => {
        return metrics.byBrand.sort((a, b) => b.count - a.count);
    }, [metrics.byBrand]);



    const handleExportJSON = () => {
        const data = {
            exportDate: new Date().toISOString(),
            metrics,
            honorees: filteredHonorees
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

    const handleExportPDF = () => {
        window.print();
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
            {/* Header & Global Filters */}
            <div className="flex flex-wrap justify-between items-end gap-8 mb-6">
                <div className="space-y-4">
                    <h2 className="text-4xl md:text-5xl font-bold font-serif italic">
                        <span className="text-gold-gradient">Dashboard Estratégico</span>
                    </h2>
                    <p className="text-off-white/40 max-w-2xl text-lg font-light italic">
                        Análise consolidada de mérito institucional e distribuição de láureas.
                    </p>
                </div>

                <div className="flex flex-wrap gap-4 bg-white/5 p-4 rounded-[2rem] border border-white/10 backdrop-blur-md">
                    <div className="flex flex-col gap-2">
                        <label className="text-[8px] font-bold text-gold uppercase tracking-widest ml-2">Marca</label>
                        <select
                            className="bg-navy-deep border border-white/10 text-off-white text-xs rounded-xl px-4 py-2 outline-none focus:border-gold/50"
                            value={selectedBrandId}
                            onChange={(e) => {
                                setSelectedBrandId(e.target.value);
                                setSelectedUnitId('all');
                            }}
                        >
                            <option value="all">Todas as Marcas</option>
                            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[8px] font-bold text-gold uppercase tracking-widest ml-2">Unidade</label>
                        <select
                            className="bg-navy-deep border border-white/10 text-off-white text-xs rounded-xl px-4 py-2 outline-none focus:border-gold/50 disabled:opacity-30"
                            value={selectedUnitId}
                            onChange={(e) => setSelectedUnitId(e.target.value)}
                            disabled={selectedBrandId === 'all'}
                        >
                            <option value="all">Todas as Unidades</option>
                            {units.filter(u => u.brand_id === selectedBrandId).map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[8px] font-bold text-gold uppercase tracking-widest ml-2">Período</label>
                        <div className="flex bg-navy-deep rounded-xl border border-white/10 p-1">
                            {(['month', 'semester', 'year'] as const).map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPeriodType(p)}
                                    className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-tighter transition-all ${periodType === p ? 'bg-gold text-navy-deep' : 'text-off-white/40 hover:text-off-white'}`}
                                >
                                    {p === 'month' ? 'Mês' : p === 'semester' ? 'Sem' : 'Ano'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Empty State */}
            {filteredHonorees.length === 0 ? (
                <GlassCard className="p-20 rounded-[3rem] border-white/5 text-center">
                    <div className="max-w-md mx-auto space-y-6">
                        <div className="size-24 mx-auto rounded-full bg-gold/5 flex items-center justify-center">
                            <span className="material-symbols-outlined text-5xl text-gold/30">analytics</span>
                        </div>
                        <h3 className="text-2xl font-serif italic text-off-white">Nenhum Dado Disponível</h3>
                        <p className="text-off-white/40 max-w-sm mx-auto">
                            {honorees.length === 0
                                ? "Nenhuma premiação foi cadastrada ainda. Comece cadastrando marcas, unidades e homenageados para visualizar os dados."
                                : "Nenhum resultado encontrado para os filtros selecionados. Tente ajustar marca, unidade ou período."}
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
            ) : (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        <GlassCard className="p-8 rounded-3xl border-white/5 bg-gradient-to-br from-gold/10 to-transparent">
                            <p className="text-[9px] font-bold text-off-white/40 uppercase tracking-[0.2em] mb-4">Total de Premiações</p>
                            <div className="flex items-end gap-3">
                                <span className="text-4xl font-bold font-serif text-off-white italic">{metrics.total}</span>
                                <span className="material-symbols-outlined text-gold mb-1">military_tech</span>
                            </div>
                        </GlassCard>

                        <GlassCard className="p-8 rounded-3xl border-white/5">
                            <p className="text-[9px] font-bold text-off-white/40 uppercase tracking-[0.2em] mb-4">Marcas Ativas</p>
                            <div className="flex items-end gap-3">
                                <span className="text-4xl font-bold font-serif text-off-white italic">{metrics.byBrand.length}</span>
                                <span className="material-symbols-outlined text-gold/50 mb-1">hub</span>
                            </div>
                        </GlassCard>

                        <GlassCard className="p-8 rounded-3xl border-white/5">
                            <p className="text-[9px] font-bold text-off-white/40 uppercase tracking-[0.2em] mb-4">Unidades Premiadas</p>
                            <div className="flex items-end gap-3">
                                <span className="text-4xl font-bold font-serif text-off-white italic">{metrics.byUnit.length}</span>
                                <span className="material-symbols-outlined text-gold/50 mb-1">location_city</span>
                            </div>
                        </GlassCard>

                        <GlassCard className="p-8 rounded-3xl border-white/5 border-gold/20 bg-gold/5">
                            <p className="text-[9px] font-bold text-gold uppercase tracking-[0.2em] mb-4">Top Marca</p>
                            <div className="space-y-1" title={metrics.topBrand?.name || ''}>
                                <p className="text-xl font-bold text-off-white truncate">{metrics.topBrand?.name || 'N/A'}</p>
                                <p className="text-[10px] text-gold/60 uppercase tracking-widest">{metrics.topBrand?.count || 0} prêmios</p>
                            </div>
                        </GlassCard>

                        <GlassCard className="p-8 rounded-3xl border-white/5 border-gold/20 bg-gold/5">
                            <p className="text-[9px] font-bold text-gold uppercase tracking-[0.2em] mb-4">Top Unidade</p>
                            <div className="space-y-1" title={metrics.topUnit?.name || ''}>
                                <p className="text-xl font-bold text-off-white truncate">{metrics.topUnit?.name || 'N/A'}</p>
                                <p className="text-[10px] text-gold/60 uppercase tracking-widest">{metrics.topUnit?.count || 0} prêmios</p>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Charts Row 1 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <GlassCard className="p-10 rounded-[3rem] border-white/5">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-xl font-serif italic text-off-white">Premiações por Unidade (Top 10)</h3>
                                <span className="material-symbols-outlined text-gold/30">bar_chart</span>
                            </div>
                            <div className="h-[400px] w-full">
                                {unitChartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={unitChartData} layout="vertical" margin={{ left: 40 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={false} />
                                            <XAxis type="number" hide />
                                            <YAxis
                                                dataKey="name"
                                                type="category"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#ffffff40', fontSize: 10 }}
                                                width={120}
                                            />
                                            <Tooltip
                                                cursor={{ fill: '#ffffff05' }}
                                                contentStyle={{ backgroundColor: '#0A1128', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                                itemStyle={{ color: '#D4AF37', fontWeight: 'bold' }}
                                            />
                                            <Bar dataKey="count" fill="#D4AF37" radius={[0, 10, 10, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-off-white/30 text-sm italic">
                                        Nenhum dado disponível
                                    </div>
                                )}
                            </div>
                        </GlassCard>

                        <GlassCard className="p-10 rounded-[3rem] border-white/5">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-xl font-serif italic text-off-white">Distribuição por Marca</h3>
                                <span className="material-symbols-outlined text-gold/30">pie_chart</span>
                            </div>
                            <div className="h-[400px] w-full flex items-center">
                                {brandChartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={brandChartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={80}
                                                outerRadius={140}
                                                paddingAngle={5}
                                                dataKey="count"
                                            >
                                                {brandChartData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#0A1128', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                                itemStyle={{ color: '#D4AF37', fontWeight: 'bold' }}
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
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <GlassCard className="p-10 rounded-[3rem] border-white/5 lg:col-span-2">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xl font-serif italic text-off-white">Ranking de Performance (Unidades)</h3>
                                <button className="text-gold text-[9px] font-bold uppercase tracking-widest hover:opacity-70 transition-opacity">Ver Tudo</button>
                            </div>
                            <div className="space-y-4">
                                {metrics.byUnit.length > 0 ? (
                                    metrics.byUnit.sort((a, b) => b.count - a.count).slice(0, 5).map((unit, i) => (
                                        <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-gold/30 transition-all">
                                            <div className="flex items-center gap-6">
                                                <span className="text-2xl font-serif italic text-gold/20 group-hover:text-gold transition-colors">#{(i + 1).toString().padStart(2, '0')}</span>
                                                <div title={unit.name}>
                                                    <p className="text-off-white font-medium truncate max-w-[150px] md:max-w-[200px]">{unit.name}</p>
                                                    <p className="text-[10px] text-off-white/20 uppercase tracking-widest">Excelência Institucional</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xl font-bold text-gold">{unit.count}</p>
                                                <p className="text-[9px] text-off-white/20 uppercase tracking-tighter">Prêmios</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10">
                                        <p className="text-off-white/30 text-sm italic">Nenhuma unidade premiada no período selecionado</p>
                                    </div>
                                )}
                            </div>
                        </GlassCard>

                        <GlassCard className="p-10 rounded-[3rem] border-white/5 bg-gradient-to-br from-gold/5 to-transparent flex flex-col justify-between">
                            <div className="space-y-6">
                                <div className="size-16 rounded-2xl bg-gold/10 flex items-center justify-center text-gold mb-8">
                                    <span className="material-symbols-outlined text-3xl">ios_share</span>
                                </div>
                                <h3 className="text-2xl font-serif italic text-off-white">Exportação Executiva</h3>
                                <p className="text-off-white/40 text-sm leading-relaxed">
                                    Gere relatórios consolidados em PDF ou Excel para apresentações e reuniões de conselho.
                                </p>
                            </div>

                            <div className="space-y-4 mt-10">
                                <button
                                    onClick={handleExportPDF}
                                    className="w-full bg-gold text-navy-deep py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                                >
                                    <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                                    Exportar PDF
                                </button>
                                <button
                                    onClick={handleExportJSON}
                                    className="w-full bg-white/5 text-off-white/60 py-4 rounded-2xl font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-white/10 hover:text-off-white transition-all flex items-center justify-center gap-3 border border-white/10"
                                >
                                    <span className="material-symbols-outlined text-lg">database</span>
                                    Exportar JSON
                                </button>
                            </div>
                        </GlassCard>
                    </div>
                </>
            )}
        </div>
    );
};

export default DashboardPage;
