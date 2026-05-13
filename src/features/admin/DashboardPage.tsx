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



    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-fade-in pb-20 px-6 md:px-10 lg:px-16 pt-16">
            {/* Header */}
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 mb-8">
                <div className="space-y-3">
                    <span className="text-brand-blue text-[11px] font-[800] uppercase tracking-[0.4em] block">Visão Executiva Global</span>
                    <h2 className="text-[48px] font-[800] text-brand-dark tracking-tight leading-none">
                        Dashboard Gerencial
                    </h2>
                    <p className="text-brand-text-secondary max-w-2xl text-[16px] font-medium opacity-60">
                        Monitoramento em tempo real do fluxo de indicações, produtividade e status de toda a rede.
                    </p>
                </div>
            </div>

            {/* Filters Row - Responsive */}
            <div className="flex flex-col md:flex-row flex-wrap gap-5 bg-white border border-brand-gray p-6 rounded-3xl shadow-sm">
                <div className="flex items-center gap-3 bg-bg-main border border-brand-gray rounded-2xl px-5 py-3 w-full md:flex-1 group focus-within:border-brand-blue transition-all">
                    <span className="material-symbols-outlined text-brand-blue/50 text-xl">map</span>
                    <select
                        className="bg-transparent border-none text-brand-dark text-[13px] font-[700] outline-none focus:ring-0 cursor-pointer w-full"
                        value={filters.regionalId}
                        onChange={(e) => setFilters({ ...filters, regionalId: e.target.value, unitId: 'all' })}
                    >
                        <option value="all">Todas as Regionais</option>
                        {regionals.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                </div>
                
                <div className="flex items-center gap-3 bg-bg-main border border-brand-gray rounded-2xl px-5 py-3 w-full md:flex-1 group focus-within:border-brand-blue transition-all">
                    <span className="material-symbols-outlined text-brand-blue/50 text-xl">location_city</span>
                    <select
                        className="bg-transparent border-none text-brand-dark text-[13px] font-[700] outline-none focus:ring-0 cursor-pointer w-full"
                        value={filters.unitId}
                        onChange={(e) => setFilters({ ...filters, unitId: e.target.value })}
                    >
                        <option value="all">Todas as Unidades</option>
                        {filteredUnits.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                </div>

                <div className="flex items-center gap-3 bg-bg-main border border-brand-gray rounded-2xl px-5 py-3 w-full md:w-auto group focus-within:border-brand-blue transition-all">
                    <span className="material-symbols-outlined text-brand-blue/50 text-xl">filter_list</span>
                    <select
                        className="bg-transparent border-none text-brand-dark text-[13px] font-[700] outline-none focus:ring-0 cursor-pointer w-full"
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                        <option value="all">Todos os Status</option>
                        <option value="em_analise">Pendentes</option>
                        <option value="aprovados">Aprovados / Publicados</option>
                        <option value="reprovado">Rejeitados</option>
                    </select>
                </div>

                <div className="flex items-center gap-3 bg-bg-main border border-brand-gray rounded-2xl px-5 py-3 w-full md:w-auto group focus-within:border-brand-blue transition-all">
                    <span className="material-symbols-outlined text-brand-blue/50 text-xl">calendar_month</span>
                    <select
                        className="bg-transparent border-none text-brand-dark text-[13px] font-[700] outline-none focus:ring-0 cursor-pointer w-full"
                        value={filters.year}
                        onChange={(e) => setFilters({ ...filters, year: e.target.value === 'all' ? 'all' : Number(e.target.value) })}
                    >
                        <option value="all">Todo o Período</option>
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* KPIs Grid - Empilhados no mobile */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                <div className="card-static !p-6 border-l-4 border-l-brand-blue/50 col-span-2 md:col-span-1">
                    <p className="text-[10px] font-[800] text-brand-text-secondary uppercase tracking-widest mb-3 opacity-60">Total Geral</p>
                    <span className="text-[40px] font-[800] text-brand-dark leading-none">{metrics.total}</span>
                </div>
                <div className="card-static !p-6 border-l-4 border-l-yellow-500">
                    <p className="text-[10px] font-[800] text-yellow-600 uppercase tracking-widest mb-3 opacity-60">Pendentes</p>
                    <span className="text-[40px] font-[800] text-yellow-500 leading-none">{metrics.pendentes}</span>
                </div>
                <div className="card-static !p-6 border-l-4 border-l-blue-500">
                    <p className="text-[10px] font-[800] text-blue-600 uppercase tracking-widest mb-3 opacity-60">Aprovados</p>
                    <span className="text-[40px] font-[800] text-blue-500 leading-none">{metrics.aprovados}</span>
                </div>
                <div className="card-static !p-6 border-l-4 border-l-green-500">
                    <p className="text-[10px] font-[800] text-green-600 uppercase tracking-widest mb-3 opacity-60">Publicados</p>
                    <span className="text-[40px] font-[800] text-green-500 leading-none">{metrics.publicados}</span>
                </div>
                <div className="card-static !p-6 border-l-4 border-l-red-500">
                    <p className="text-[10px] font-[800] text-red-600 uppercase tracking-widest mb-3 opacity-60">Rejeitados</p>
                    <span className="text-[40px] font-[800] text-red-500 leading-none">{metrics.reprovados}</span>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pie Chart */}
                <div className="card-static !p-8 flex flex-col items-center overflow-x-auto custom-scrollbar">
                    <h3 className="text-[20px] font-[800] text-brand-dark w-full text-left mb-8 tracking-tight">Distribuição de Status</h3>
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
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                        itemStyle={{ color: '#1E293B', fontWeight: 'bold' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-[10px] text-brand-text-secondary font-[800] uppercase tracking-widest">{value}</span>} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <p className="text-brand-text-secondary/40 italic text-sm mt-20">Sem dados suficientes.</p>}
                    </div>
                </div>

                {/* Line Chart */}
                <div className="card-static !p-8 lg:col-span-2 overflow-x-auto custom-scrollbar">
                    <h3 className="text-[20px] font-[800] text-brand-dark mb-8 tracking-tight">Evolução de Cadastros</h3>
                    <div className="h-[250px] w-full min-w-[400px]">
                        {evolutionData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={evolutionData} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                                    <XAxis dataKey="period" stroke="#94A3B8" tick={{ fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94A3B8" tick={{ fontSize: 10, fontWeight: 700 }} tickLine={false} axisLine={false} />
                                    <RechartsTooltip 
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                        itemStyle={{ color: '#1D4ED8', fontWeight: 'bold' }}
                                    />
                                    <Line type="monotone" dataKey="count" name="Cadastros" stroke="#1D4ED8" strokeWidth={4} dot={{ r: 5, fill: '#1D4ED8', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : <p className="text-brand-text-secondary/40 italic text-sm mt-20 text-center">Nenhum dado temporal disponível.</p>}
                    </div>
                </div>
            </div>

            {/* Rankings & Bar Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Bar Chart Units */}
                <div className="card-static !p-8 lg:col-span-2 overflow-x-auto custom-scrollbar">
                    <h3 className="text-[20px] font-[800] text-brand-dark mb-8 tracking-tight">Cadastros por Unidade (Top 8)</h3>
                    <div className="h-[280px] w-full min-w-[350px]">
                        {unitsBarData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={unitsBarData} layout="vertical" margin={{ left: 80, right: 30, top: 5, bottom: 5 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10, fontWeight: 700 }} width={120} />
                                    <RechartsTooltip 
                                        cursor={{ fill: '#F1F5F9' }}
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                        itemStyle={{ color: '#1D4ED8', fontWeight: 'bold' }}
                                    />
                                    <Bar dataKey="count" name="Total" fill="#1D4ED8" radius={[0, 8, 8, 0]} barSize={16}>
                                        <LabelList dataKey="count" position="right" fill="#64748B" fontSize={11} fontWeight="bold" />
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <p className="text-brand-text-secondary/40 italic text-sm text-center mt-20">Sem dados suficientes.</p>}
                    </div>
                </div>

                {/* Top Directors Ranking */}
                <div className="card-static !p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="size-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                            <span className="material-symbols-outlined">workspace_premium</span>
                        </div>
                        <h3 className="text-[20px] font-[800] text-brand-dark tracking-tight">Top Diretores</h3>
                    </div>
                    <div className="space-y-4">
                        {topDirectors.length > 0 ? (
                            topDirectors.map((director, i) => (
                                <div key={i} className="flex justify-between items-center p-5 rounded-2xl bg-bg-main border border-brand-gray hover:border-brand-blue/30 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="size-9 rounded-full bg-white border border-brand-gray flex items-center justify-center text-brand-blue font-[800] text-[13px] shrink-0 shadow-sm group-hover:bg-brand-blue group-hover:text-white transition-all">
                                            {i + 1}º
                                        </div>
                                        <span className="text-[14px] font-[800] text-brand-dark truncate max-w-[150px] sm:max-w-[200px] lg:max-w-[150px]">{director.name}</span>
                                    </div>
                                    <span className="text-brand-blue font-[900] text-[18px]">{director.count}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-brand-text-secondary/40 italic text-sm text-center py-10">Nenhum dado produtivo encontrado.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Análise Estratégica Avançada */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Evolution Chart */}
                <div className="card-static !p-10">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="size-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <span className="material-symbols-outlined">trending_up</span>
                        </div>
                        <h3 className="text-[22px] font-[800] text-brand-dark tracking-tight">Evolução Mensal</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        {evolutionData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={evolutionData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                                    <XAxis 
                                        dataKey="period" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#64748B', fontSize: 10, fontWeight: 700 }}
                                        tickFormatter={(val) => {
                                            const [y, m] = val.split('-');
                                            return `${m}/${y.slice(2)}`;
                                        }}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 10, fontWeight: 700 }} />
                                    <RechartsTooltip 
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
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
                        ) : <p className="text-brand-text-secondary/40 italic text-sm text-center py-20">Sem histórico disponível.</p>}
                    </div>
                </div>

                {/* Regional Ranking */}
                <div className="card-static !p-10">
                    <div className="flex items-center gap-3 mb-10">
                        <div className="size-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                            <span className="material-symbols-outlined">map</span>
                        </div>
                        <h3 className="text-[22px] font-[800] text-brand-dark tracking-tight">Performance por Regional</h3>
                    </div>
                    <div className="space-y-8 max-h-[300px] overflow-y-auto custom-scrollbar pr-4">
                        {regionalRanking.length > 0 ? (
                            regionalRanking.map((reg, i) => {
                                const percentage = Math.round((reg.count / Math.max(metrics.total, 1)) * 100);
                                return (
                                    <div key={i} className="group">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[15px] font-[800] text-brand-dark group-hover:text-brand-blue transition-colors">{reg.name}</span>
                                            <span className="text-[12px] font-[900] text-brand-blue bg-brand-blue/5 px-3 py-1 rounded-lg">{reg.count} registros</span>
                                        </div>
                                        <div className="h-3 w-full bg-brand-gray rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-brand-blue rounded-full transition-all duration-1000 shadow-sm"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        ) : <p className="text-brand-text-secondary/40 italic text-sm text-center py-20">Nenhuma regional ativa.</p>}
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