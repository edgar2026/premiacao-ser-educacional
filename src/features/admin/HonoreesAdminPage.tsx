import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import DataTable from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import { supabase, createAuthClient } from '../../lib/supabase';
import type { Database } from '../../types/supabase';
import ConfirmModal from '../../components/ui/ConfirmModal';

type Honoree = Database['public']['Tables']['honorees']['Row'] & {
    awards?: { name: string } | null;
    regionals?: { name: string } | null;
    status?: string | null;
};

interface HonoreesAdminPageProps {
    isRequestsView?: boolean;
}

const HonoreesAdminPage: React.FC<HonoreesAdminPageProps> = ({ isRequestsView = false }) => {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const isDiretor = profile?.role === 'diretor';
    
    const [honorees, setHonorees] = useState<Honoree[]>([]);
    const [regionals, setRegionals] = useState<any[]>([]);
    const [units, setUnits] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Estados de Filtro
    const [statusFilter, setStatusFilter] = useState<string>(isRequestsView ? 'pendentes' : 'aprovados');
    const [regionalFilter, setRegionalFilter] = useState<string>('all');
    const [unitFilter, setUnitFilter] = useState<string>('all');

    // Modais
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [honoreeToReject, setHonoreeToReject] = useState<Honoree | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const dbClient = profile?.id ? createAuthClient(profile.id) : supabase;

    useEffect(() => {
        // Atualiza a aba inicial se a prop mudar via navegação
        setStatusFilter(isRequestsView ? 'pendentes' : 'aprovados');
        fetchInitialData();
    }, [isRequestsView]);

    const fetchInitialData = async () => {
        setIsLoading(true);
        await Promise.all([
            fetchHonorees(),
            fetchFiltersData()
        ]);
        setIsLoading(false);
    };

    const fetchFiltersData = async () => {
        // Busca Regionais e Unidades para os Dropdowns
        const [regRes, unitRes] = await Promise.all([
            dbClient.from('regionals').select('id, name').order('name'),
            dbClient.from('units').select('id, name, regional_id').order('name')
        ]);
        if (regRes.data) setRegionals(regRes.data);
        if (unitRes.data) setUnits(unitRes.data);
    };

    const fetchHonorees = async () => {
        let query = dbClient
            .from('honorees')
            .select('*, awards!honorees_award_id_fkey(name), regionals(name)')
            .order('created_at', { ascending: false });
            
        if (isDiretor && profile?.unit_id) {
            query = query.eq('unit_id', profile.unit_id);
        }

        const { data, error } = await query;
        if (error) {
            console.error('Error fetching honorees:', error);
        } else {
            setHonorees(data as any);
        }
    };

    const handleDeleteClick = (id: string) => {
        setItemToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        const { error } = await dbClient.from('honorees').delete().eq('id', itemToDelete);
        if (error) {
            setAlertMessage('Erro ao excluir homenageado: ' + error.message);
            setIsAlertModalOpen(true);
        } else {
            await fetchHonoreeBackground();
        }
        setItemToDelete(null);
    };

    const handleStatusUpdate = async (h: Honoree, status: string, reason?: string | null) => {
        setIsLoading(true);
        const updateData: any = { status };
        
        if (reason !== undefined) updateData.rejection_reason = reason;
        
        if (status === 'publicado') updateData.is_published = true;
        else if (['aprovado', 'reprovado', 'em_analise'].includes(status)) updateData.is_published = false;

        const { error } = await dbClient.from('honorees').update(updateData).eq('id', h.id);

        if (error) {
            setAlertMessage('Erro ao atualizar status: ' + error.message);
            setIsAlertModalOpen(true);
        } else {
            if (h.created_by && ['reprovado', 'aprovado', 'publicado'].includes(status)) {
                try {
                    let honoreeName = 'Homenageado';
                    if (h.professional_data) {
                        try { honoreeName = JSON.parse(h.professional_data).name || honoreeName; } catch(e) {}
                    }
                    await supabase.functions.invoke('notify-rejection', {
                        body: { honoreeName, userEmail: h.created_by || '', reason, status }
                    });
                } catch (emailError) {
                    console.error('Failed to send notification email:', emailError);
                }
            }
            await fetchHonoreeBackground();
        }
        setIsLoading(false);
    };

    const fetchHonoreeBackground = async () => {
        let query = dbClient.from('honorees').select('*, awards!honorees_award_id_fkey(name), regionals(name)').order('created_at', { ascending: false });
        if (isDiretor && profile?.unit_id) query = query.eq('unit_id', profile.unit_id);
        const { data } = await query;
        if (data) setHonorees(data as any);
    };

    const confirmReject = async () => {
        if (!honoreeToReject) return;
        if (!rejectionReason.trim()) {
            setAlertMessage('Por favor, informe o motivo da reprovação.');
            setIsAlertModalOpen(true);
            return;
        }
        setIsRejectModalOpen(false);
        await handleStatusUpdate(honoreeToReject, 'reprovado', rejectionReason);
        setHonoreeToReject(null);
        setRejectionReason('');
    };

    const columns: Column<Honoree>[] = [
        {
            header: 'Homenageado',
            accessor: (h: Honoree) => (
                <div className="flex items-center gap-5">
                    <div className="size-12 rounded-2xl bg-gold/5 text-gold border border-gold/20 flex items-center justify-center font-serif italic text-lg overflow-hidden">
                        <img
                            src={h.photo_url || '/assets/default-fallback.png'}
                            alt="Foto"
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/assets/default-fallback.png'; }}
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-off-white font-serif italic text-lg leading-tight">
                            {(() => {
                                try { return h.professional_data ? JSON.parse(h.professional_data).name : 'Sem nome'; }
                                catch (e) { return h.name || 'Sem nome'; }
                            })()}
                        </span>
                        <span className="text-[10px] text-off-white/30 uppercase tracking-widest">{h.type}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Regional',
            accessor: (h: Honoree) => h.regionals?.name || 'Sem Regional',
            className: 'text-sm text-off-white/40 font-medium uppercase tracking-widest'
        },
        {
            header: 'Prêmio Vinculado',
            accessor: (h: Honoree) => h.awards?.name || 'Nenhum',
            className: 'text-sm text-off-white/40 font-medium uppercase tracking-widest'
        },
        {
            header: 'Status',
            accessor: (h: Honoree) => {
                const status = h.status as string;
                switch (status) {
                    case 'rascunho': return <span className="px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border bg-off-white/5 text-off-white/40 border-white/10">Rascunho</span>;
                    case 'em_analise': return <span className="px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pendente Análise</span>;
                    case 'aprovado': return <span className="px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border bg-blue-500/10 text-blue-500 border-blue-500/20">Aprovado</span>;
                    case 'reprovado': return <span className="px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border bg-red-500/10 text-red-500 border-red-500/20">Reprovado</span>;
                    case 'publicado': return <span className="px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border bg-green-500/10 text-green-500 border-green-500/20">Publicado</span>;
                    default: return <span className="px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border bg-off-white/5 text-off-white/40 border-white/10">{status || 'N/A'}</span>;
                }
            }
        }
    ];

    const actions = (h: Honoree) => (
        <div className="flex gap-2">
            <button
                onClick={() => navigate(`/admin/homenageados/${h.id}`)}
                className="size-10 rounded-xl flex items-center justify-center text-off-white/40 hover:text-gold hover:bg-gold/10 transition-all border border-transparent hover:border-gold/20"
                title="Ver detalhes"
            >
                <span className="material-symbols-outlined text-[20px]">visibility</span>
            </button>
            <button
                onClick={() => navigate(`/admin/homenageados/${h.id}/editar`)}
                className="size-10 rounded-xl flex items-center justify-center text-off-white/40 hover:text-gold hover:bg-gold/10 transition-all border border-transparent hover:border-gold/20"
                title="Editar"
            >
                <span className="material-symbols-outlined text-[20px]">edit</span>
            </button>

            {!isDiretor && (
                <>
                    {(h.status === 'em_analise') && (
                        <>
                            <button
                                onClick={() => handleStatusUpdate(h, 'aprovado')}
                                className="size-10 rounded-xl flex items-center justify-center text-green-500/40 hover:text-green-500 hover:bg-green-500/10 transition-all border border-transparent hover:border-green-500/20"
                                title="Aprovar"
                            >
                                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                            </button>
                            <button
                                onClick={() => {
                                    setHonoreeToReject(h);
                                    setRejectionReason('');
                                    setIsRejectModalOpen(true);
                                }}
                                className="size-10 rounded-xl flex items-center justify-center text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                                title="Reprovar"
                            >
                                <span className="material-symbols-outlined text-[20px]">cancel</span>
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => handleDeleteClick(h.id)}
                        className="size-10 rounded-xl flex items-center justify-center text-off-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all border border-transparent hover:border-red-400/20"
                        title="Excluir"
                    >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                    </button>
                </>
            )}

            {isDiretor && (
                <>
                    {(h.status === 'rascunho' || h.status === 'reprovado') && (
                        <button
                            onClick={() => handleStatusUpdate(h, 'em_analise')}
                            className="size-10 rounded-xl flex items-center justify-center text-yellow-500/60 hover:text-yellow-500 hover:bg-yellow-500/10 transition-all border border-transparent hover:border-yellow-500/20"
                            title="Enviar para Análise"
                        >
                            <span className="material-symbols-outlined text-[20px]">send</span>
                        </button>
                    )}
                    {(h.status === 'aprovado' || h.status === 'publicado') && (
                        <button
                            onClick={() => handleStatusUpdate(h, h.status === 'publicado' ? 'aprovado' : 'publicado')}
                            className={`size-10 rounded-xl flex items-center justify-center transition-all border border-transparent ${h.status === 'publicado' 
                                ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 hover:border-blue-400/20' 
                                : 'text-off-white/40 hover:text-blue-400 hover:bg-blue-400/10 hover:border-blue-400/20'}`}
                            title={h.status === 'publicado' ? "Despublicar" : "Publicar"}
                        >
                            <span className="material-symbols-outlined text-[20px]">
                                {h.status === 'publicado' ? 'visibility_off' : 'publish'}
                            </span>
                        </button>
                    )}
                </>
            )}
        </div>
    );

    // Lógica unificada de filtros
    const filteredHonorees = useMemo(() => {
        return honorees.filter(h => {
            const st = h.status || 'rascunho';
            
            // 1. Filtro de Status
            let matchesStatus = true;
            if (statusFilter === 'pendentes') matchesStatus = st === 'em_analise';
            else if (statusFilter === 'aprovados') matchesStatus = ['aprovado', 'publicado'].includes(st);
            else if (statusFilter === 'reprovados') matchesStatus = st === 'reprovado';
            else if (statusFilter === 'rascunhos') matchesStatus = st === 'rascunho';
            else if (statusFilter === 'todos') matchesStatus = true;

            // 2. Filtro de Regional
            const matchesRegional = regionalFilter === 'all' || h.regional_id === regionalFilter;

            // 3. Filtro de Unidade
            const matchesUnit = unitFilter === 'all' || h.unit_id === unitFilter;

            return matchesStatus && matchesRegional && matchesUnit;
        });
    }, [honorees, statusFilter, regionalFilter, unitFilter]);

    // Unidades filtradas pela Regional selecionada
    const filteredUnitsForDropdown = useMemo(() => {
        if (regionalFilter === 'all') return units;
        return units.filter(u => u.regional_id === regionalFilter);
    }, [units, regionalFilter]);

    return (
        <div className="space-y-12 animate-fade-in pb-20 px-6 md:px-10 lg:px-16 pt-20 lg:pt-8">
            <div className="flex flex-wrap justify-between items-end gap-8 mb-6">
                <div className="space-y-4">
                    <span className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] block">Gestão de Talentos</span>
                    <h2 className="text-5xl font-bold font-serif text-off-white italic">
                        {isRequestsView ? 'Central de Solicitações' : 'Homenageados'}
                    </h2>
                    <p className="text-off-white/40 max-w-2xl text-lg font-light italic">
                        Acompanhe, gerencie e aprove as indicações de mérito de toda a instituição.
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

            {/* BARRA DE CONTROLES (Abas e Filtros) */}
            <div className="flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center bg-white/[0.02] border border-white/5 p-4 rounded-3xl backdrop-blur-md">
                
                {/* Abas de Status */}
                <div className="flex flex-wrap gap-2">
                    {[
                        { id: 'todos', label: 'Todos' },
                        { id: 'pendentes', label: 'Pendentes' },
                        { id: 'aprovados', label: 'Aprovados' },
                        { id: 'reprovados', label: 'Reprovados' },
                        ...(isDiretor ? [{ id: 'rascunhos', label: 'Meus Rascunhos' }] : [])
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setStatusFilter(tab.id)}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${statusFilter === tab.id ? 'bg-gold text-navy-deep shadow-lg' : 'bg-white/5 text-off-white/40 hover:bg-white/10 hover:text-off-white'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Filtros Geográficos */}
                <div className="flex flex-wrap gap-4 w-full xl:w-auto">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <span className="material-symbols-outlined text-gold/50">map</span>
                        <select
                            value={regionalFilter}
                            onChange={(e) => {
                                setRegionalFilter(e.target.value);
                                setUnitFilter('all'); // Reseta unidade ao trocar regional
                            }}
                            className="bg-navy-deep border border-white/10 text-off-white text-xs rounded-xl px-4 py-2.5 outline-none focus:border-gold/50 cursor-pointer w-full sm:w-auto min-w-[160px]"
                        >
                            <option value="all">Todas as Regionais</option>
                            {regionals.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <span className="material-symbols-outlined text-gold/50">location_city</span>
                        <select
                            value={unitFilter}
                            onChange={(e) => setUnitFilter(e.target.value)}
                            className="bg-navy-deep border border-white/10 text-off-white text-xs rounded-xl px-4 py-2.5 outline-none focus:border-gold/50 cursor-pointer w-full sm:w-auto min-w-[160px]"
                        >
                            <option value="all">Todas as Unidades</option>
                            {filteredUnitsForDropdown.map(u => (
                                <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
                </div>
            ) : (
                <DataTable
                    data={filteredHonorees}
                    columns={columns}
                    actions={actions}
                    searchPlaceholder="Buscar por nome ou prêmio..."
                />
            )}

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Excluir Homenageado"
                message="Tem certeza que deseja excluir este homenageado? Esta ação não poderá ser desfeita."
                confirmLabel="Sim, Excluir"
                cancelLabel="Cancelar"
                type="danger"
            />

            <ConfirmModal
                isOpen={isRejectModalOpen}
                onClose={() => {
                    setIsRejectModalOpen(false);
                    setHonoreeToReject(null);
                    setRejectionReason('');
                }}
                onConfirm={confirmReject}
                title="Reprovar Cadastro"
                message={
                    <div className="space-y-4 pt-4 text-left">
                        <p className="text-sm text-off-white/60">
                            Ao reprovar, descreva abaixo o que o diretor precisa corrigir para solicitar uma nova análise.
                        </p>
                        <textarea
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-off-white outline-none focus:border-red-500/50 transition-all font-serif italic text-lg"
                            placeholder="Ex: A foto precisa estar em alta resolução; Corrigir o título do prêmio..."
                            rows={4}
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            required
                        />
                    </div>
                }
                confirmLabel="Confirmar Reprovação"
                cancelLabel="Cancelar"
                type="danger"
            />

            <ConfirmModal
                isOpen={isAlertModalOpen}
                onClose={() => setIsAlertModalOpen(false)}
                onConfirm={() => setIsAlertModalOpen(false)}
                title="Aviso"
                message={alertMessage}
                confirmLabel="OK"
                type="warning"
            />
        </div>
    );
};

export default HonoreesAdminPage;