import React from 'react';
import GlassCard from '../../components/ui/GlassCard';
import { mockMetrics, mockRanking } from '../../services/mockData';

const ExecutiveDashboard: React.FC = () => {
    return (
        <div className="space-y-12 animate-fade-in">
            {/* Header Section */}
            <div className="mb-10">
                <span className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-4 block">Visão de Liderança</span>
                <h2 className="text-5xl font-bold font-serif text-off-white italic">Panorama de <span className="text-gold-gradient">Excelência</span></h2>
            </div>

            {/* Metrics Section */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {mockMetrics.map((metric, index) => (
                    <GlassCard key={index} className="p-10 rounded-[2.5rem] relative overflow-hidden group border-white/5">
                        <div className="absolute -right-10 -top-10 size-40 bg-gold/5 rounded-full blur-3xl transition-all group-hover:bg-gold/10"></div>
                        <div className="flex justify-between items-start mb-8">
                            <p className="text-off-white/40 text-[9px] font-bold uppercase tracking-[0.3em]">{metric.label}</p>
                            {metric.change && (
                                <span className="text-gold text-[10px] font-bold px-3 py-1 rounded-full border border-gold/20 bg-gold/5">{metric.change}</span>
                            )}
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-6xl font-bold font-serif text-off-white mb-2 tracking-tighter">{metric.value}</h3>
                            <p className="text-off-white/30 text-[10px] font-medium uppercase tracking-widest">
                                Métrica Consolidada 2026
                            </p>
                        </div>
                    </GlassCard>
                ))}
            </section>

            {/* Charts Section */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Bar Chart */}
                <GlassCard className="p-12 rounded-[3rem] flex flex-col gap-10 border-white/5">
                    <div className="flex justify-between items-center">
                        <div>
                            <h4 className="text-2xl font-bold font-serif text-off-white italic">Distribuição de Mérito</h4>
                            <p className="text-[10px] text-off-white/40 mt-2 uppercase tracking-[0.2em] font-bold">Volume por Regional Estratégica</p>
                        </div>
                        <div className="text-gold bg-gold/5 px-4 py-2 rounded-full border border-gold/20">
                            <span className="text-[10px] font-bold uppercase tracking-widest">98.5% Score</span>
                        </div>
                    </div>
                    <div className="flex items-end justify-between h-72 gap-8 px-4">
                        {[
                            { label: 'Recife', height: '65%' },
                            { label: 'Natal', height: '40%' },
                            { label: 'Maceió', height: '55%' },
                            { label: 'Salvador', height: '85%' },
                            { label: 'Manaus', height: '70%' }
                        ].map((item) => (
                            <div key={item.label} className="flex flex-col items-center flex-1 group">
                                <div className="w-full bg-white/[0.02] rounded-t-3xl relative flex flex-col justify-end h-full overflow-hidden border-x border-t border-white/5">
                                    <div className="bg-gradient-to-t from-gold to-gold-light w-full rounded-t-3xl transition-all duration-1000 ease-out opacity-60 group-hover:opacity-100" style={{ height: item.height }}></div>
                                </div>
                                <span className="text-[9px] font-bold text-off-white/40 mt-6 uppercase tracking-[0.3em] group-hover:text-gold transition-colors">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                {/* Line Chart */}
                <GlassCard className="p-12 rounded-[3rem] flex flex-col gap-10 border-white/5">
                    <div className="flex justify-between items-center">
                        <div>
                            <h4 className="text-2xl font-bold font-serif text-off-white italic">Evolução Institucional</h4>
                            <p className="text-[10px] text-off-white/40 mt-2 uppercase tracking-[0.2em] font-bold">Crescimento de Impacto Consolidado</p>
                        </div>
                        <div className="text-gold bg-gold/5 px-4 py-2 rounded-full border border-gold/20">
                            <span className="text-[10px] font-bold uppercase tracking-widest">+24% Growth</span>
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-between pt-6">
                        <div className="relative h-64 w-full">
                            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 500 150">
                                <defs>
                                    <linearGradient id="chartGradientPremium" x1="0%" x2="0%" y1="0%" y2="100%">
                                        <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3"></stop>
                                        <stop offset="100%" stopColor="#D4AF37" stopOpacity="0"></stop>
                                    </linearGradient>
                                </defs>
                                <path d="M0,100 C50,80 80,110 120,60 C160,10 200,90 250,70 C300,50 350,130 400,20 C450,-10 500,40 500,40 L500,150 L0,150 Z" fill="url(#chartGradientPremium)"></path>
                                <path d="M0,100 C50,80 80,110 120,60 C160,10 200,90 250,70 C300,50 350,130 400,20 C450,-10 500,40 500,40" fill="none" stroke="#D4AF37" strokeLinecap="round" strokeWidth="3" className="drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]"></path>
                            </svg>
                        </div>
                        <div className="flex justify-between px-4 pt-8">
                            {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
                                <span key={q} className="text-[9px] font-bold text-off-white/30 uppercase tracking-[0.4em]">{q}</span>
                            ))}
                        </div>
                    </div>
                </GlassCard>
            </section>

            {/* Ranking Table */}
            <GlassCard className="rounded-[3rem] overflow-hidden border-white/5">
                <div className="p-10 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
                    <div>
                        <h4 className="text-3xl font-bold font-serif text-off-white italic">Ranking de Excelência</h4>
                        <p className="text-[10px] text-off-white/40 mt-2 uppercase tracking-[0.2em] font-bold">Unidades com maior índice de mérito institucional</p>
                    </div>
                    <button className="px-10 py-4 glass-card hover:bg-gold hover:text-navy-deep text-gold text-[10px] font-bold tracking-[0.3em] rounded-full border-gold/30 transition-all flex items-center gap-4 uppercase">
                        <span className="material-symbols-outlined text-lg">download</span>
                        Relatório Executivo
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/[0.02] text-off-white/40 uppercase text-[9px] font-bold tracking-[0.3em]">
                            <tr>
                                <th className="px-12 py-6">Rank</th>
                                <th className="px-12 py-6">Unidade</th>
                                <th className="px-12 py-6">Regional</th>
                                <th className="px-12 py-6 text-center">KPI Mérito</th>
                                <th className="px-12 py-6 text-center">Láureas</th>
                                <th className="px-12 py-6 text-right">Certificação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {mockRanking.map((unit) => (
                                <tr key={unit.rank} className="hover:bg-white/[0.03] transition-colors group">
                                    <td className="px-12 py-8 font-serif italic text-2xl text-gold">#{unit.rank}</td>
                                    <td className="px-12 py-8">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-off-white text-lg font-serif italic">{unit.name}</span>
                                            <span className="text-[10px] text-off-white/40 font-bold uppercase tracking-widest mt-1">{unit.campus}</span>
                                        </div>
                                    </td>
                                    <td className="px-12 py-8 text-off-white/60 text-sm italic">{unit.regional}</td>
                                    <td className="px-12 py-8 text-center">
                                        <span className="font-serif text-2xl text-off-white">{unit.kpi}</span>
                                    </td>
                                    <td className="px-12 py-8 text-center font-bold text-gold">{unit.awards}</td>
                                    <td className="px-12 py-8 text-right">
                                        <span className="inline-flex items-center gap-3 px-5 py-2 rounded-full text-[9px] font-bold tracking-[0.2em] uppercase border border-gold/20 bg-gold/5 text-gold">
                                            <span className="size-1.5 rounded-full bg-gold shadow-[0_0_10px_rgba(212,175,55,1)]"></span>
                                            {unit.certification}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
};

export default ExecutiveDashboard;
