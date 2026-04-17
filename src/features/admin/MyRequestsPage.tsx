import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../../lib/supabase';
import GlassCard from '../../components/ui/GlassCard';

interface Honoree {
    id: string;
    name: string | null;
    professional_data: string | null;
    photo_url: string | null;
    type: string;
    status: string | null;
    created_at: string | null;
    updated_at: string | null;
    rejection_reason: string | null;
    regionals?: { name: string } | null;
    units?: { name: string } | null;
    awards?: { name: string } | null;
}

const MyRequestsPage: React.FC = () => {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [honorees, setHonorees] = useState<Honoree[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'em_analise' | 'aprovado' | 'reprovado' | 'rascunho'>('all');

    useEffect(() => {
        if (profile?.id) fetchMyHonorees();
    }, [profile, filter]);

    const fetchMyHonorees = async () => {
        setIsLoading(true);
        let query = supabase
            .from('honorees')
            .select('*, awards!honorees_award_id_fkey(name), regionals(name), units!honorees_unit_id_fkey(name)')
            .eq('created_by', profile!.id)
            .order('created_at', { ascending: false });

        if (filter !== 'all') {
            query = query.eq('status', filter);
        }

        const { data, error } = await query;
        if (error) {
            console.error('Error fetching:', error);
        } else {
            setHonorees(data || []);
        }
        setIsLoading(false);
    };

    const getHonoreeName = (h: Honoree) => {
        try {
            return h.professional_data ? JSON.parse(h.professional_data).name : h.name || 'Sem nome';
        } catch {
            return h.name || 'Sem nome';
        }
    };

    const statusConfig: Record<string, { label: string; color: string; bgColor: string; borderColor: string; icon: string }> = {
        rascunho: { label: 'Rascunho', color: 'text-off-white/40', bgColor: 'bg-white/5', borderColor: 'border-white/10', icon: 'edit_note' },
        em_analise: { label: 'Em Análise', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', borderColor: 'border-yellow-500/20', icon: 'pending' },
        aprovado: { label: 'Aprovado', color: 'text-green-500', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/20', icon: 'check_circle' },
        reprovado: { label: 'Recusado', color: 'text-red-500', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20', icon: 'cancel' },
        publicado: { label: 'Publicado', color: 'text-blue-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20', icon: 'public' },
    };

    const getStatusConfig = (status: string | null) => {
        return statusConfig[status || ''] || statusConfig.rascunho;
    };


    // Compute counts separately to avoid filtering issues
    useEffect(() => {
        // counts are implicitly recalculated on render from honorees
    }, [honorees]);

    return (
        <div className="space-y-12 animate-fade-in pb-20 px-6 md:px-10 lg:px-16 pt-20 lg:pt-8">
            <div className="flex flex-wrap justify-between items-end gap-8">
                <div className="space-y-4">
                    <span className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] block">Acompanhamento</span>
                    <h2 className="text-5xl font-bold font-serif text-off-white italic">
                        Minhas <span className="text-gold-gradient">Solicitações</span>
                    </h2>
                    <p className="text-off-white/40 max-w-2xl text-lg font-light italic">
                        Acompanhe o status dos homenageados que você cadastrou.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/admin/homenageados/novo')}
                    className="bg-gold hover:bg-gold-light hover:scale-[1.02] active:scale-[0.98] transition-all text-navy-deep px-10 py-5 rounded-full font-bold text-[10px] uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(212,175,55,0.2)] flex items-center gap-3"
                >
                    <span className="material-symbols-outlined text-lg">person_add</span>
                    Novo Homenageado
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
                {[
                    { key: 'all', label: 'Todos', icon: 'list' },
                    { key: 'rascunho', label: 'Rascunhos', icon: 'edit_note' },
                    { key: 'em_analise', label: 'Em Análise', icon: 'pending' },
                    { key: 'aprovado', label: 'Aprovados', icon: 'check_circle' },
                    { key: 'reprovado', label: 'Recusados', icon: 'cancel' },
                ].map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key as any)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${
                            filter === f.key
                                ? 'bg-gold/10 text-gold border-gold/30'
                                : 'bg-white/[0.03] text-off-white/40 border-white/5 hover:border-white/20 hover:text-off-white'
                        }`}
                    >
                        <span className="material-symbols-outlined text-sm">{f.icon}</span>
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Cards */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
                </div>
            ) : honorees.length === 0 ? (
                <GlassCard className="p-16 rounded-[3rem] border-white/5 text-center">
                    <span className="material-symbols-outlined text-6xl text-off-white/10 mb-4 block">inbox</span>
                    <p className="text-off-white/30 text-lg italic font-serif mb-6">
                        {filter === 'all' ? 'Você ainda não cadastrou nenhum homenageado.' : 'Nenhum homenageado encontrado com este status.'}
                    </p>
                    <button
                        onClick={() => navigate('/admin/homenageados/novo')}
                        className="bg-gold/10 text-gold px-8 py-4 rounded-full text-[10px] font-bold uppercase tracking-widest border border-gold/20 hover:bg-gold/20 transition-all"
                    >
                        Cadastrar Primeiro Homenageado
                    </button>
                </GlassCard>
            ) : (
                <div className="space-y-4">
                    {honorees.map(h => {
                        const sc = getStatusConfig(h.status);
                        return (
                            <GlassCard
                                key={h.id}
                                className={`p-6 rounded-[2rem] border-white/5 hover:border-gold/10 transition-all bg-gradient-to-br from-white/[0.02] to-transparent cursor-pointer`}
                                onClick={() => navigate(`/admin/homenageados/${h.id}`)}
                            >
                                <div className="flex items-center gap-6">
                                    {/* Status Icon */}
                                    <div className={`size-14 rounded-2xl ${sc.bgColor} ${sc.borderColor} border flex items-center justify-center shrink-0`}>
                                        <span className={`material-symbols-outlined text-2xl ${sc.color}`}>{sc.icon}</span>
                                    </div>

                                    {/* Photo */}
                                    <div className="size-14 rounded-2xl bg-gold/5 border border-gold/20 overflow-hidden shrink-0">
                                        <img
                                            src={h.photo_url || '/assets/default-fallback.png'}
                                            alt="Foto"
                                            className="w-full h-full object-cover"
                                            onError={(e) => { (e.target as HTMLImageElement).src = '/assets/default-fallback.png'; }}
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-bold font-serif italic text-off-white truncate">
                                                {getHonoreeName(h)}
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border ${sc.bgColor} ${sc.color} ${sc.borderColor}`}>
                                                {sc.label}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-3 text-[10px] text-off-white/30 uppercase tracking-widest">
                                            {h.regionals?.name && (
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-xs">map</span>
                                                    {h.regionals.name}
                                                </span>
                                            )}
                                            {h.awards?.name && (
                                                <span className="flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-xs">military_tech</span>
                                                    {h.awards.name}
                                                </span>
                                            )}
                                            {h.created_at && (
                                                <span>Criado em {new Date(h.created_at).toLocaleDateString('pt-BR')}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Arrow */}
                                    <span className="material-symbols-outlined text-off-white/10 text-2xl shrink-0">chevron_right</span>
                                </div>

                                {/* Rejection reason */}
                                {h.status === 'reprovado' && h.rejection_reason && (
                                    <div className="mt-4 ml-20 p-5 rounded-xl bg-red-500/5 border border-red-500/10">
                                        <div className="flex items-start gap-3">
                                            <span className="material-symbols-outlined text-red-500/60 text-lg mt-0.5 shrink-0">error</span>
                                            <div>
                                                <p className="text-[10px] text-red-500/60 uppercase tracking-widest font-bold mb-1">Motivo da Recusa</p>
                                                <p className="text-sm text-red-400/80 italic font-serif">"{h.rejection_reason}"</p>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/admin/homenageados/${h.id}/editar`);
                                                    }}
                                                    className="mt-3 flex items-center gap-2 text-[10px] text-red-400 font-bold uppercase tracking-widest hover:text-red-300 transition-colors"
                                                >
                                                    <span className="material-symbols-outlined text-sm">edit</span>
                                                    Corrigir e Reenviar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </GlassCard>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyRequestsPage;
