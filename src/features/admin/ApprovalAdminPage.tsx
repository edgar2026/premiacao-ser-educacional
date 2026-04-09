import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import GlassCard from '../../components/ui/GlassCard';
import ConfirmModal from '../../components/ui/ConfirmModal';

interface Honoree {
    id: string;
    name: string | null;
    professional_data: string | null;
    photo_url: string | null;
    type: string;
    status: string | null;
    created_at: string | null;
    created_by: string | null;
    rejection_reason: string | null;
    regionals?: { name: string } | null;
    units?: { name: string } | null;
    awards?: { name: string } | null;
    creator_profile?: { full_name: string; username: string } | null;
}

const ApprovalAdminPage: React.FC = () => {
    const navigate = useNavigate();
    const [honorees, setHonorees] = useState<Honoree[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'em_analise' | 'aprovado' | 'reprovado' | 'all'>('em_analise');
    
    // Reject modal state
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectTarget, setRejectTarget] = useState<Honoree | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    
    // Alert modal
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [alertMsg, setAlertMsg] = useState('');

    useEffect(() => {
        fetchHonorees();
    }, [filter]);

    const fetchHonorees = async () => {
        setIsLoading(true);
        let query = supabase
            .from('honorees')
            .select('*, awards!honorees_award_id_fkey(name), regionals(name), units!honorees_unit_id_fkey(name)')
            .order('created_at', { ascending: false });

        if (filter !== 'all') {
            query = query.eq('status', filter);
        } else {
            query = query.in('status', ['em_analise', 'aprovado', 'reprovado']);
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

    const handleApprove = async (h: Honoree) => {
        const { error } = await supabase
            .from('honorees')
            .update({ status: 'aprovado', rejection_reason: null, is_published: false })
            .eq('id', h.id);

        if (error) {
            setAlertMsg('Erro ao aprovar: ' + error.message);
            setIsAlertOpen(true);
        } else {
            fetchHonorees();
        }
    };

    const openRejectModal = (h: Honoree) => {
        setRejectTarget(h);
        setRejectReason('');
        setIsRejectModalOpen(true);
    };

    const confirmReject = async () => {
        if (!rejectTarget || !rejectReason.trim()) {
            setAlertMsg('Por favor, informe o motivo da recusa.');
            setIsAlertOpen(true);
            return;
        }

        const { error } = await supabase
            .from('honorees')
            .update({ status: 'reprovado', rejection_reason: rejectReason.trim(), is_published: false })
            .eq('id', rejectTarget.id);

        if (error) {
            setAlertMsg('Erro ao recusar: ' + error.message);
            setIsAlertOpen(true);
        } else {
            setIsRejectModalOpen(false);
            setRejectTarget(null);
            fetchHonorees();
        }
    };

    const statusBadge = (status: string | null) => {
        switch (status) {
            case 'em_analise':
                return <span className="px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pendente</span>;
            case 'aprovado':
                return <span className="px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border bg-green-500/10 text-green-500 border-green-500/20">Aprovado</span>;
            case 'reprovado':
                return <span className="px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border bg-red-500/10 text-red-500 border-red-500/20">Recusado</span>;
            default:
                return <span className="px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border bg-white/5 text-white/40 border-white/10">{status || 'N/A'}</span>;
        }
    };

    const filterCounts = {
        em_analise: honorees.length,
    };

    return (
        <div className="space-y-12 animate-fade-in pb-20 px-6 md:px-10 lg:px-16 pt-20 lg:pt-8">
            <div className="space-y-4">
                <span className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] block">Aprovações</span>
                <h2 className="text-5xl font-bold font-serif text-off-white italic">
                    Central de <span className="text-gold-gradient">Análise</span>
                </h2>
                <p className="text-off-white/40 max-w-2xl text-lg font-light italic">
                    Analise e aprove solicitações de homenageados enviadas pelos diretores.
                </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
                {[
                    { key: 'em_analise', label: 'Pendentes', icon: 'pending' },
                    { key: 'aprovado', label: 'Aprovados', icon: 'check_circle' },
                    { key: 'reprovado', label: 'Recusados', icon: 'cancel' },
                    { key: 'all', label: 'Todos', icon: 'list' },
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

            {/* Cards Grid */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
                </div>
            ) : honorees.length === 0 ? (
                <GlassCard className="p-16 rounded-[3rem] border-white/5 text-center">
                    <span className="material-symbols-outlined text-6xl text-off-white/10 mb-4 block">inbox</span>
                    <p className="text-off-white/30 text-lg italic font-serif">Nenhuma solicitação encontrada.</p>
                </GlassCard>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {honorees.map(h => (
                        <GlassCard
                            key={h.id}
                            className="p-8 rounded-[2rem] border-white/5 hover:border-gold/10 transition-all bg-gradient-to-br from-white/[0.02] to-transparent"
                        >
                            <div className="flex gap-6">
                                {/* Photo */}
                                <div className="size-20 rounded-2xl bg-gold/5 border border-gold/20 overflow-hidden shrink-0">
                                    <img
                                        src={h.photo_url || '/assets/default-fallback.png'}
                                        alt="Foto"
                                        className="w-full h-full object-cover"
                                        onError={(e) => { (e.target as HTMLImageElement).src = '/assets/default-fallback.png'; }}
                                    />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0 space-y-2">
                                    <div className="flex items-start justify-between gap-4">
                                        <h3 className="text-lg font-bold font-serif italic text-off-white truncate">
                                            {getHonoreeName(h)}
                                        </h3>
                                        {statusBadge(h.status)}
                                    </div>

                                    <div className="flex flex-wrap gap-3 text-[10px] text-off-white/30 uppercase tracking-widest">
                                        {h.regionals?.name && (
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-xs">map</span>
                                                {h.regionals.name}
                                            </span>
                                        )}
                                        {h.units?.name && (
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-xs">apartment</span>
                                                {h.units.name}
                                            </span>
                                        )}
                                        {h.awards?.name && (
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-xs">military_tech</span>
                                                {h.awards.name}
                                            </span>
                                        )}
                                    </div>

                                    {h.created_at && (
                                        <p className="text-[10px] text-off-white/20 uppercase tracking-widest">
                                            Enviado em {new Date(h.created_at).toLocaleDateString('pt-BR')}
                                        </p>
                                    )}

                                    {/* Rejection reason */}
                                    {h.status === 'reprovado' && h.rejection_reason && (
                                        <div className="mt-3 p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                                            <p className="text-[10px] text-red-500/60 uppercase tracking-widest font-bold mb-1">Motivo da Recusa:</p>
                                            <p className="text-sm text-red-400/80 italic font-serif">"{h.rejection_reason}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 mt-6 pt-6 border-t border-white/5">
                                <button
                                    onClick={() => navigate(`/admin/homenageados/${h.id}`)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/5 text-off-white/40 hover:text-gold hover:border-gold/20 transition-all text-[10px] font-bold uppercase tracking-widest"
                                >
                                    <span className="material-symbols-outlined text-sm">visibility</span>
                                    Detalhes
                                </button>

                                {h.status === 'em_analise' && (
                                    <>
                                        <button
                                            onClick={() => handleApprove(h)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 hover:bg-green-500/20 transition-all text-[10px] font-bold uppercase tracking-widest"
                                        >
                                            <span className="material-symbols-outlined text-sm">check_circle</span>
                                            Aprovar
                                        </button>
                                        <button
                                            onClick={() => openRejectModal(h)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all text-[10px] font-bold uppercase tracking-widest"
                                        >
                                            <span className="material-symbols-outlined text-sm">cancel</span>
                                            Recusar
                                        </button>
                                    </>
                                )}
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}

            {/* Reject Modal */}
            {isRejectModalOpen && rejectTarget && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
                    <GlassCard className="w-full max-w-lg p-10 rounded-[2.5rem] border-red-500/20 bg-navy-deep shadow-2xl">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="size-14 rounded-full bg-red-500/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-red-500 text-2xl">gavel</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-serif italic text-off-white">Recusar Solicitação</h3>
                                    <p className="text-[10px] text-off-white/30 uppercase tracking-widest">{getHonoreeName(rejectTarget)}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-off-white/30">
                                    Motivo da Recusa <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="Descreva o motivo da recusa para que o diretor possa corrigir..."
                                    className="w-full bg-white/[0.03] border border-white/10 p-5 rounded-2xl text-off-white focus:border-red-500/50 outline-none transition-all min-h-[120px] resize-none placeholder:text-off-white/10"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setIsRejectModalOpen(false)}
                                    className="flex-1 px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-off-white/40 hover:text-off-white transition-all text-[10px] font-bold uppercase tracking-widest"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmReject}
                                    disabled={!rejectReason.trim()}
                                    className="flex-1 px-6 py-4 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all text-[10px] font-bold uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">cancel</span>
                                    Confirmar Recusa
                                </button>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}

            {/* Alert Modal */}
            <ConfirmModal
                isOpen={isAlertOpen}
                onClose={() => setIsAlertOpen(false)}
                onConfirm={() => setIsAlertOpen(false)}
                title="Aviso"
                message={alertMsg}
                confirmLabel="OK"
                type="warning"
            />
        </div>
    );
};

export default ApprovalAdminPage;
