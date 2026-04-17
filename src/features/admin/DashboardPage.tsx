import React, { useEffect, useState, useMemo } from 'react';
import GlassCard from '../../components/ui/GlassCard';
import { supabase } from '../../lib/supabase';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LabelList, LineChart, Line
} from 'recharts';
import ConfirmModal from '../../components/ui/ConfirmModal';

// Interfaces
interface Brand { id: string; name: string; }
interface Unit { id: string; name: string; brand_id: string; regional_id?: string; }
interface Award { id: string; name: string; }
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
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    
    // Data states
    const [brands, setBrands] = useState<Brand[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [awards, setAwards] = useState<Award[]>([]);
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
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [brandsRes, unitsRes, awardsRes, regionalsRes, honoreesRes, profilesRes] = await Promise.all([
                supabase.from('brands').select('*').order('name'),
                supabase.from('units').select('*').order('name'),
                supabase.from('awards').select('*').order('name'),
                supabase.from('regionals').select('*').order('name'),
                supabase.from('honorees').select('*'), // SEM FILTRO DE PUBLISHED - PEGAR TUDO
                supabase.from('profiles').select('id, full_name, username')
            ]);

            if (brandsRes.data) setBrands(brandsRes.data);
            if (unitsRes.data) setUnits(unitsRes.data);
            if (awardsRes.data) setAwards(awardsRes.data);
            if (regionalsRes.data) setRegionals(regionalsRes.data);
            if (honoreesRes.data) setHonorees(honoreesRes.data as any);
            if (profilesRes.data) setProfiles(profilesRes.data as any);
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

            {/* Filters Row */}
            <div className="flex flex-col md:flex-row gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-3xl backdrop-blur-md">
                <div className="flex items-center gap-3 bg-navy-deep border border-white/10 rounded-xl px-4 py-2 w-full md:w-auto flex-1 md:flex-none">
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
                
                <div className="flex items-center gap-3 bg-navy-deep border border-white/10 rounded-xl px-4 py-2 w-full md:w-auto flex-1 md:flex-none">
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

                <div className="flex items-center gap-3 bg-navy-deep border border-white/10 rounded-xl px-4 py-2 w-full md:w-auto flex-1 md:flex-none">
                    <span className="material-symbols-outlined text-gold/50 text-sm">filter_list</span>
                    <select
                        className="bg-transparent border-none text-off-white text-xs outline-none focus:ring-0 cursor-pointer w-full"
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    >
                        <option value="all" className="bg-navy-deep">Todos os Status</option>
                        <option value="em_analise" className="bg-navy-deep">Pendentes</option>
                        <option value="aprovados" className="bg-navy-deep">Aprovados/Publicados</option>
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

            {/* KPIs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <GlassCard className="p-6 rounded-[2rem] border-white/5 border-l-4 border-l-gold/50">
                    <p className="text-[10px] font-bold text-off-white/40 uppercase tracking-widest mb-2">Total Geral</p>
                    <span className="text-4xl font-bold font-serif text-off-white italic">{metrics.total}</span>
                </GlassCard>
                <GlassCard className="p-6 rounded-[2rem] border-white/5 border-l-4 border-l-yellow-500">
                    <p className="text-[10px] font-bold text-yellow-500/80 uppercase tracking-widest mb-2">Pendentes</p>
                    <span className="text-4xl font-bold font-serif text-yellow-400 italic">{metrics.pendentes}</span>
                </GlassCard>
                <GlassCard className="p-6 rounded-[2rem] border-white/5 border-l-4 border-l-blue-500">
                    <p className="text-[10px] font-bold text-blue-500/80 uppercase tracking-widest mb-2">Aprovados</p>
                    <span className="text-4xl font-bold font-serif text-blue-400 italic">{metrics.aprovados}</span>
                </GlassCard>
                <GlassCard className="p-6 rounded-[2rem] border-white/5 border-l-4 border-l-green-500">
                    <p className="text-[10px] font-bold text-green-500/80 uppercase tracking-widest mb-2">Publicados</p>
                    <span className="text-4xl font-bold font-serif text-green-400 italic">{metrics.publicados}</span>
                </GlassCard>
                <GlassCard className="p-6 rounded-[2rem] border-white/5 border-l-4 border-l-red-500">
                    <p className="text-[10px] font-bold text-red-500/80 uppercase tracking-widest mb-2">Rejeitados</p>
                    <span className="text-4xl font-bold font-serif text-red-400 italic">{metrics.reprovados}</span>
                </GlassCard>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Pie Chart */}
                <GlassCard className="p-8 rounded-[2.5rem] border-white/5 flex flex-col items-center">
                    <h3 className="text-xl font-serif italic text-off-white w-full text-left mb-6">Distribuição de Status</h3>
                    <div className="h-[250px] w-full">
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
                <GlassCard className="p-8 rounded-[2.5rem] border-white/5 lg:col-span-2">
                    <h3 className="text-xl font-serif italic text-off-white mb-6">Evolução de Cadastros</h3>
                    <div className="h-[250px] w-full">
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
                <GlassCard className="p-8 rounded-[2.5rem] border-white/5 lg:col-span-2">
                    <h3 className="text-xl font-serif italic text-off-white mb-6">Cadastros por Unidade (Top 8)</h3>
                    <div className="h-[280px] w-full">
                        {unitsBarData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={unitsBarData} layout="vertical" margin={{ left: 60, right: 30, top: 5, bottom: 5 }}>
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
                <GlassCard className="p-8 rounded-[2.5rem] border-white/5">
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
                                        <span className="text-sm font-bold text-off-white truncate max-w-[150px]">{director.name}</span>
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

            {/* Tabela Completa */}
            <GlassCard className="p-8 rounded-[3rem] border-white/5 overflow-hidden">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-serif italic text-off-white">Relação Completa</h3>
                    <span className="text-gold text-[10px] font-bold uppercase tracking-widest bg-gold/10 px-4 py-2 rounded-full">
                        {filteredHonorees.length} Registros
                    </span>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="px-4 py-4 text-[10px] font-bold text-off-white/40 uppercase tracking-widest">Nome / Cargo</th>
                                <th className="px-4 py-4 text-[10px] font-bold text-off-white/40 uppercase tracking-widest">Unidade</th>
                                <th className="px-4 py-4 text-[10px] font-bold text-off-white/40 uppercase tracking-widest">Regional</th>
                                <th className="px-4 py-4 text-[10px] font-bold text-off-white/40 uppercase tracking-widest">Status</th>
                                <th className="px-4 py-4 text-[10px] font-bold text-off-white/40 uppercase tracking-widest text-right">Data</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredHonorees.map(h => {
                                const unit = units.find(u => u.id === h.unit_id);
                                const reg = regionals.find(r => r.id === unit?.regional_id);
                                const profData = h.professional_data ? JSON.parse(h.professional_data) : {};
                                return (
                                    <tr key={h.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                        <td className="px-4 py-4">
                                            <p className="font-bold text-off-white text-sm">{getHonoreeName(h)}</p>
                                            <p className="text-[10px] text-gold mt-1 uppercase">{profData.role || profData.external_role || 'Sem Cargo'}</p>
                                        </td>
                                        <td className="px-4 py-4 text-sm text-off-white/70">{unit?.name || '-'}</td>
                                        <td className="px-4 py-4 text-sm text-off-white/70">{reg?.name || '-'}</td>
                                        <td className="px-4 py-4">{formatStatus(h.status)}</td>
                                        <td className="px-4 py-4 text-right text-xs text-off-white/40 font-mono">
                                            {new Date(h.created_at || h.awarded_at).toLocaleDateString('pt-BR')}
                                        </td>
                                    </tr>
                                );
                            })}
                            {filteredHonorees.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-16 text-center text-off-white/30 italic">
                                        Nenhum registro encontrado com os filtros atuais.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </GlassCard>

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