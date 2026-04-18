import React, { useEffect, useState, useMemo } from 'react';
import GlassCard from '../../components/ui/GlassCard';
import { supabase } from '../../lib/supabase';
import { useUser } from '@clerk/clerk-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LabelList, LineChart, Line
} from 'recharts';
import ConfirmModal from '../../components/ui/ConfirmModal';

// Interfaces
interface Unit { id: string; name: string; brand_id: string; regional_id?: string; }
interface Regional { id: string; name: string; }
interface Profile { id: string; full_name: string; username: string; }
interface Honoree {
    id: string;
    name: string;
    brand_id: string;
    unit_id: string;
    award_id: string;
    regional_id?: string;
    awarded_at: string;
    created_at: string;
    status: string;
    created_by: string;
    professional_data: string;
}

const DashboardPage: React.FC = () => {
    const { user } = useUser();
    const [isLoading, setIsLoading] = useState(true);
    
    // Data states
    const [units, setUnits] = useState<Unit[]>([]);
    const [regionals, setRegionals] = useState<Regional[]>([]);
    const [honorees, setHonorees] = useState<Honoree[]>([]);
    const [profiles, setProfiles] = useState<Profile[]>([]);

    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ title: 'Aviso', message: '', type: 'warning' as 'warning' | 'danger' | 'info' });

    // Global Filters State
    const [filters, setFilters] = useState({
        regionalId: 'all',
        unitId: 'all',
        status: 'all',
        year: 'all' as number | 'all',
    });

    useEffect(() => {
        if (user?.id) {
            fetchData();
        }
    }, [user?.id]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Chamada Edge Function Mestra para Homenageados! (Burla RLS com segurança p/ Executivo)
            const dashboardRes = await supabase.functions.invoke('get-dashboard-data', {
                body: { userId: user?.id }
            });

            if (dashboardRes.data) {
                if (dashboardRes.data.units) setUnits(dashboardRes.data.units);
                if (dashboardRes.data.regionals) setRegionals(dashboardRes.data.regionals);
                if (dashboardRes.data.profiles) setProfiles(dashboardRes.data.profiles);
                if (dashboardRes.data.honorees) setHonorees(dashboardRes.data.honorees);
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            showAlert('Não foi possível carregar todos os dados.', 'Erro de Conexão', 'danger');
        } finally {
            setIsLoading(false);
        }
    };

    const showAlert = (message: string, title = 'Aviso', type: 'warning' | 'danger' | 'info' = 'warning') => {
        setAlertConfig({ title, message, type });
        setIsAlertModalOpen(true);
    };

    // Derived Filters
    const filteredUnits = useMemo(() => {
        if (filters.regionalId === 'all') return units;
        return units.filter(u => u.regional_id === filters.regionalId);
    }, [units, filters.regionalId]);

    // Apply Global Filters to Honorees
    const filteredHonorees = useMemo(() => {
        return honorees.filter(h => {
            // Unit Filter
            if (filters.unitId !== 'all' && h.unit_id !== filters.unitId) return false;
            
            // Regional Filter
            if (filters.regionalId !== 'all') {
                const unit = units.find(u => u.id === h.unit_id);
                if (unit?.regional_id !== filters.regionalId) return false;
            }

            // Status Filter
            if (filters.status !== 'all') {
                if (filters.status === 'aprovados') {
                    if (h.status !== 'aprovado' && h.status !== 'publicado') return false;
                } else if (h.status !== filters.status) {
                    return false;
                }
            }

            // Year Filter
            if (filters.year !== 'all') {
                const date = new Date(h.created_at || h.awarded_at);
                if (date.getFullYear() !== filters.year) return false;
            }

            return true;
        });
    }, [honorees, filters, units]);

    // --- KPIs Calculations ---
    const metrics = useMemo(() => {
        const counts = { total: 0, pendentes: 0, aprovados: 0, reprovados: 0, publicados: 0 };
        filteredHonorees.forEach(h => {
            counts.total++;
            if (h.status === 'em_analise') counts.pendentes++;
            if (h.status === 'aprovado' || h.status === 'publicado') counts.aprovados++;
            if (h.status === 'reprovado') counts.reprovados++;
            if (h.status === 'publicado') counts.publicados++;
        });
        return counts;
    }, [filteredHonorees]);

    // --- Charts Data ---
    const statusPieData = useMemo(() => {
        return [
            { name: 'Aprovados', count: metrics.aprovados - metrics.publicados, color: '#3b82f6' },
            { name: 'Publicados', count: metrics.publicados, color: '#22c55e' },
            { name: 'Pendentes', count: metrics.pendentes, color: '#eab308' },
            { name: 'Reprovados', count: metrics.reprovados, color: '#ef4444' }
        ].filter(i => i.count > 0);
    }, [metrics]);

    const unitsBarData = useMemo(() => {
        const byUnit: Record<string, number> = {};
        filteredHonorees.forEach(h => {
            const unit = units.find(u => u.id === h.unit_id);
            if (unit) byUnit[unit.name] = (byUnit[unit.name] || 0) + 1;
        });
        return Object.entries(byUnit)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8); // Top 8
    }, [filteredHonorees, units]);

    const evolutionData = useMemo(() => {
        const byMonth: Record<string, number> = {};
        filteredHonorees.forEach(h => {
            const date = new Date(h.created_at || h.awarded_at);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            byMonth[key] = (byMonth[key] || 0) + 1;
        });
        return Object.entries(byMonth)
            .map(([period, count]) => ({ period, count }))
            .sort((a, b) => a.period.localeCompare(b.period));
    }, [filteredHonorees]);

    // --- Rankings ---
    const topDirectors = useMemo(() => {
        const byDirector: Record<string, { name: string, count: number }> = {};
        filteredHonorees.forEach(h => {
            if (h.status === 'rascunho') return; // Ignore drafts for productivity
            const profile = profiles.find(p => p.id === h.created_by);
            const name = profile?.full_name || profile?.username || 'Sistema';
            if (!byDirector[name]) byDirector[name] = { name, count: 0 };
            byDirector[name].count++;
        });
        return Object.values(byDirector).sort((a, b) => b.count - a.count).slice(0, 5);
    }, [filteredHonorees, profiles]);

    const regionalRanking = useMemo(() => {
        const byRegional: Record<string, number> = {};
        filteredHonorees.forEach(h => {
            const unit = units.find(u => u.id === h.unit_id);
            const regional = regionals.find(r => r.id === unit?.regional_id);
            const name = regional?.name || 'Sem Regional';
            byRegional[name] = (byRegional[name] || 0) + 1;
        });
        return Object.entries(byRegional)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    }, [filteredHonorees, units, regionals]);

    // Helper formatting
    const formatStatus = (status: string) => {
        switch (status) {
            case 'aprovado': return <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-blue-500/30">Aprovado</span>;
            case 'publicado': return <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-green-500/30">Publicado</span>;
            case 'reprovado': return <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-red-500/30">Reprovado</span>;
            case 'em_analise': return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-yellow-500/30">Pendente</span>;
            default: return <span className="px-3 py-1 bg-white/10 text-white/50 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-white/20">Rascunho</span>;
        }
    };

    const getHonoreeName = (h: Honoree) => {
        try { return h.professional_data ? JSON.parse(h.professional_data).name : h.name || 'Sem nome'; }
        catch { return h.name || 'Sem nome'; }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-fade-in pb-20 px-6 md:px-10 lg:px-16 pt-20 lg:pt-8">
            {/* Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 mb-6">
                <div className="space-y-4">
                    <span className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] block">Visão Executiva Global</span>
                    <h2 className="text-4xl md:text-5xl font-bold font-serif italic text-off-white">
                        Dashboard <span className="text-gold-gradient">Gerencial</span>
                    </h2>
                    <p className="text-off-white/40 max-w-2xl text-lg font-light italic">
                        Monitoramento em tempo real do fluxo de indicações, produtividade e status de toda a rede.
                    </p>
                </div>
            </div>

            {/* Filters Row - Responsive */}
            <div className="flex flex-col md:flex-row flex-wrap gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-3xl backdrop-blur-md">
                <div className="flex items-center gap-3 bg-navy-deep border border-white/10 rounded-xl px-4 py-2 w-full md:flex-1">
                    <span className="material-symbols-outlined text-gold/50 text-sm">map</span>
                    <select
                        className="bg-transparent border-none text-off-white text-xs outline-none focus:ring-0 cursor-pointer w-full"
                        value={filters.regionalId}
                        onChange={(e) => setFilters({ ...filters, regionalId: e.target.value, unitId: 'all' })}
                    >
                        <option value="all" className="bg-navy-deep">Todas as Regionais</option>
                        {regionals.map(r => <option key={r.id} value={r.id} className="bg-navy-deep">{r.name}</option>)}
                    </select>
                </div>
                
                <div className="flex items-center gap-3 bg-navy-deep border border-white/10 rounded-xl px-4 py-2 w-full md:flex-1">
                    <span className="material-symbols-outlined text-gold/50 text-sm">location_city</span>
                    <select
                        className="bg-transparent border-none text-off-white text-xs outline-none focus:ring-0 cursor-pointer w-full"
                        value={filters.unitId}
                        onChange={(e) => setFilters({ ...filters, unitId: e.target.value })}
                    >
                        <option value="all" className="bg-navy-deep">Todas as Unidades</option>
                        {filteredUnits.map(u => <option key={u.id} value={u.id} className="bg-navy-deep">{u.name}</option>)}
                    </select>
                </div>

                <div className="flex items-center gap-3 bg-navy-deep border border-white/10 rounded-xl px-4 py-2 w-full md:w-auto">
                    <span className="material-symbols-outlined text-gold/50 text-sm">filter_list</span>
                    <select
                        className="bg-transparent border-none text-off-white text-xs outline-none focus:ring-0 cursor-pointer w-full"
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                        <option value="all" className="bg-navy-deep">Todos os Status</option>
                        <option value="em_analise" className="bg-navy-deep">Pendentes</option>
                        <option value="aprovados" className="bg-navy-deep">Aprovados / Publicados</option>
                        <option value="reprovado" className="bg-navy-deep">Rejeitados</option>
                    </select>
                </div>

                <div className="flex items-center gap-3 bg-navy-deep border border-white/10 rounded-xl px-4 py-2 w-full md:w-auto">
                    <span className="material-symbols-outlined text-gold/50 text-sm">calendar_month</span>
                    <select
                        className="bg-transparent border-none text-off-white text-xs outline-none focus:ring-0 cursor-pointer w-full"
                        value={filters.year}
                        onChange={(e) => setFilters({ ...filters, year: e.target.value === 'all' ? 'all' : Number(e.target.value) })}
                    >
                        <option value="all" className="bg-navy-deep">Todo o Período</option>
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                            <option key={y} value={y} className="bg-navy-deep">{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* KPIs Grid - Empilhados no mobile */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <GlassCard className="p-4 sm:p-6 rounded-[2rem] border-white/5 border-l-4 border-l-gold/50 col-span-2 md:col-span-1 text-center md:text-left">
                    <p className="text-[10px] font-bold text-off-white/40 uppercase tracking-widest mb-2">Total Geral</p>
                    <span className="text-3xl sm:text-4xl font-bold font-serif text-off-white italic">{metrics.total}</span>
                </GlassCard>
                <GlassCard className="p-4 sm:p-6 rounded-[2rem] border-white/5 border-l-4 border-l-yellow-500">
                    <p className="text-[10px] font-bold text-yellow-500/80 uppercase tracking-widest mb-2">Pendentes</p>
                    <span className="text-3xl sm:text-4xl font-bold font-serif text-yellow-400 italic">{metrics.pendentes}</span>
                </GlassCard>
                <GlassCard className="p-4 sm:p-6 rounded-[2rem] border-white/5 border-l-4 border-l-blue-500">
                    <p className="text-[10px] font-bold text-blue-500/80 uppercase tracking-widest mb-2">Aprovados</p>
                    <span className="text-3xl sm:text-4xl font-bold font-serif text-blue-400 italic">{metrics.aprovados}</span>
                </GlassCard>
                <GlassCard className="p-4 sm:p-6 rounded-[2rem] border-white/5 border-l-4 border-l-green-500">
                    <p className="text-[10px] font-bold text-green-500/80 uppercase tracking-widest mb-2">Publicados</p>
                    <span className="text-3xl sm:text-4xl font-bold font-serif text-green-400 italic">{metrics.publicados}</span>
                </GlassCard>
                <GlassCard className="p-4 sm:p-6 rounded-[2rem] border-white/5 border-l-4 border-l-red-500">
                    <p className="text-[10px] font-bold text-red-500/80 uppercase tracking-widest mb-2">Rejeitados</p>
                    <span className="text-3xl sm:text-4xl font-bold font-serif text-red-400 italic">{metrics.reprovados}</span>
                </GlassCard>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pie Chart */}
                <GlassCard className="p-6 sm:p-8 rounded-[2.5rem] border-white/5 flex flex-col items-center overflow-x-auto custom-scrollbar">
                    <h3 className="text-xl font-serif italic text-off-white w-full text-left mb-6">Distribuição de Status</h3>
                    <div className="h-[250px] w-full min-w-[200px]">
                        {statusPieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusPieData}
                                        cx="50%" cy="50%"
                                        innerRadius={60} outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="count"
                                        stroke="none"
                                    >
                                        {statusPieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip 
                                        contentStyle={{ backgroundColor: '#0A1128', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-[10px] text-off-white/60 uppercase">{value}</span>} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <p className="text-off-white/20 italic text-sm mt-20">Sem dados suficientes.</p>}
                    </div>
                </GlassCard>

                {/* Line Chart */}
                <GlassCard className="p-6 sm:p-8 rounded-[2.5rem] border-white/5 lg:col-span-2 overflow-x-auto custom-scrollbar">
                    <h3 className="text-xl font-serif italic text-off-white mb-6">Evolução de Cadastros</h3>
                    <div className="h-[250px] w-full min-w-[400px]">
                        {evolutionData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={evolutionData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                    <XAxis dataKey="period" stroke="#ffffff40" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#ffffff40" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <RechartsTooltip 
                                        contentStyle={{ backgroundColor: '#0A1128', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                        itemStyle={{ color: '#D4AF37', fontWeight: 'bold' }}
                                        labelStyle={{ color: '#ffffff40', marginBottom: '4px' }}
                                    />
                                    <Line type="monotone" dataKey="count" name="Cadastros" stroke="#D4AF37" strokeWidth={3} dot={{ r: 4, fill: '#D4AF37', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : <p className="text-off-white/20 italic text-sm mt-20 text-center">Nenhum dado temporal disponível.</p>}
                    </div>
                </GlassCard>
            </div>

            {/* Rankings & Bar Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Bar Chart Units */}
                <GlassCard className="p-6 sm:p-8 rounded-[2.5rem] border-white/5 lg:col-span-2 overflow-x-auto custom-scrollbar">
                    <h3 className="text-xl font-serif italic text-off-white mb-6">Cadastros por Unidade (Top 8)</h3>
                    <div className="h-[280px] w-full min-w-[350px]">
                        {unitsBarData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={unitsBarData} layout="vertical" margin={{ left: 80, right: 30, top: 5, bottom: 5 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#ffffff80', fontSize: 10, fontWeight: 500 }} width={120} />
                                    <RechartsTooltip 
                                        cursor={{ fill: '#ffffff05' }}
                                        contentStyle={{ backgroundColor: '#0A1128', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                        itemStyle={{ color: '#D4AF37', fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="count" name="Total" fill="#D4AF37" radius={[0, 8, 8, 0]} barSize={16}>
                                        <LabelList dataKey="count" position="right" fill="#ffffff80" fontSize={11} fontWeight="bold" />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <p className="text-off-white/20 italic text-sm text-center mt-20">Sem dados suficientes.</p>}
                    </div>
                </GlassCard>

                {/* Top Directors Ranking */}
                <GlassCard className="p-6 sm:p-8 rounded-[2.5rem] border-white/5">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="material-symbols-outlined text-gold">workspace_premium</span>
                        <h3 className="text-xl font-serif italic text-off-white">Top Diretores</h3>
                    </div>
                    <div className="space-y-4">
                        {topDirectors.length > 0 ? (
                            topDirectors.map((director, i) => (
                                <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-gold/30 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold text-xs shrink-0">
                                            {i + 1}º
                                        </div>
                                        <span className="text-sm font-bold text-off-white truncate max-w-[150px] sm:max-w-[200px] lg:max-w-[150px]">{director.name}</span>
                                    </div>
                                    <span className="text-gold font-black">{director.count}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-off-white/20 italic text-sm text-center py-10">Nenhum dado produtivo encontrado.</p>
                        )}
                    </div>
                </GlassCard>
            </div>

            {/* Análise Estratégica Avançada */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Evolution Chart */}
                <GlassCard className="p-6 sm:p-8 rounded-[3rem] border-white/5">
                    <div className="flex items-center gap-3 mb-8">
                        <span className="material-symbols-outlined text-blue-400">trending_up</span>
                        <h3 className="text-2xl font-serif italic text-off-white">Evolução Mensal</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        {evolutionData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={evolutionData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                                    <XAxis 
                                        dataKey="period" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#ffffff40', fontSize: 10 }}
                                        tickFormatter={(val) => {
                                            const [y, m] = val.split('-');
                                            return `${m}/${y.slice(2)}`;
                                        }}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#ffffff40', fontSize: 10 }} />
                                    <RechartsTooltip 
                                        contentStyle={{ backgroundColor: '#0A1128', border: '1px solid #ffffff10', borderRadius: '12px' }}
                                        itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="count" 
                                        name="Registros" 
                                        stroke="#3b82f6" 
                                        strokeWidth={4} 
                                        dot={{ fill: '#3b82f6', r: 6, strokeWidth: 2, stroke: '#fff' }}
                                        activeDot={{ r: 8, strokeWidth: 0 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : <p className="text-off-white/20 italic text-sm text-center py-20">Sem histórico disponível.</p>}
                    </div>
                </GlassCard>

                {/* Regional Ranking */}
                <GlassCard className="p-6 sm:p-8 rounded-[3rem] border-white/5">
                    <div className="flex items-center gap-3 mb-8">
                        <span className="material-symbols-outlined text-gold">map</span>
                        <h3 className="text-2xl font-serif italic text-off-white">Performance por Regional</h3>
                    </div>
                    <div className="space-y-6 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                        {regionalRanking.length > 0 ? (
                            regionalRanking.map((reg, i) => {
                                const percentage = Math.round((reg.count / Math.max(metrics.total, 1)) * 100);
                                return (
                                    <div key={i} className="group">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-bold text-off-white group-hover:text-gold transition-colors">{reg.name}</span>
                                            <span className="text-xs font-mono text-off-white/40">{reg.count} registros</span>
                                        </div>
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-gold rounded-full transition-all duration-1000"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        ) : <p className="text-off-white/20 italic text-sm text-center py-20">Nenhuma regional ativa.</p>}
                    </div>
                </GlassCard>
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