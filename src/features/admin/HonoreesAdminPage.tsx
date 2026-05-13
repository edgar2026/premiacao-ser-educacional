import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import DataTable from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import { supabase, createAuthClient } from '../../lib/supabase';
import type { Database } from '../../types/supabase';
import ConfirmModal from '../../components/ui/ConfirmModal';
import GlassCard from '../../components/ui/GlassCard';

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
    const [isRequestEditModalOpen, setIsRequestEditModalOpen] = useState(false);
    const [honoreeToRequestEdit, setHonoreeToRequestEdit] = useState<Honoree | null>(null);

    const dbClient = profile?.id ? createAuthClient(profile.id) : supabase;

    useEffect(() => {
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
        else if (['aprovado', 'reprovado', 'em_analise', 'rascunho'].includes(status)) updateData.is_published = false;

        const { error } = await dbClient.from('honorees').update(updateData).eq('id', h.id);

        if (error) {
            setAlertMessage('Erro ao atualizar status: ' + error.message);
            setIsAlertModalOpen(true);
        } else {
            if (h.created_by && ['reprovado', 'aprovado', 'publicado'].includes(status)) {
                try {
                    const honoreeName = getHonoreeName(h);
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

    const handleEditClick = (h: Honoree) => {
        if (isDiretor && (h.status === 'publicado' || h.status === 'aprovado')) {
            setHonoreeToRequestEdit(h);
            setIsRequestEditModalOpen(true);
        } else {
            navigate(`/admin/homenageados/${h.id}/editar`);
        }
    };

    const confirmRequestEdit = async () => {
        if (!honoreeToRequestEdit) return;
        setIsRequestEditModalOpen(false);
        await handleStatusUpdate(honoreeToRequestEdit, 'rascunho');
        navigate(`/admin/homenageados/${honoreeToRequestEdit.id}/editar`);
    };

    const getHonoreeName = (h: Honoree) => {
        try { return h.professional_data ? JSON.parse(h.professional_data).name : h.name || 'Sem nome'; }
        catch (e) { return h.name || 'Sem nome'; }
    };

    // FILTROS ATIVOS PARA O DIRETOR (Itens de Ação Imediata)
    const rejectedHonorees = useMemo(() => isDiretor ? honorees.filter(h => h.status === 'reprovado') : [], [honorees, isDiretor]);
    const approvedHonorees = useMemo(() => isDiretor ? honorees.filter(h => h.status === 'aprovado') : [], [honorees, isDiretor]);

    const columns: Column<Honoree>[] = [
        {
            header: 'Homenageado',
            accessor: (h: Honoree) => (
                <div className="flex items-center gap-5">
                    <div className="size-12 rounded-2xl bg-brand-blue/5 text-brand-blue border border-brand-blue/10 flex items-center justify-center overflow-hidden shrink-0">
                        <img
                            src={h.photo_url || '/assets/default-fallback.png'}
                            alt="Foto"
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = '/assets/default-fallback.png'; }}
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-[800] text-brand-dark text-[15px] leading-tight">
                            {getHonoreeName(h)}
                        </span>
                        <span className="text-[10px] text-brand-text-secondary font-[700] uppercase tracking-widest mt-0.5">{h.type}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Regional',
            accessor: (h: Honoree) => h.regionals?.name || 'Sem Regional',
            className: 'text-[12px] text-brand-text-secondary/60 font-[800] uppercase tracking-widest'
        },
        {
            header: 'Prêmio Vinculado',
            accessor: (h: Honoree) => h.awards?.name || 'Nenhum',
            className: 'text-[12px] text-brand-text-secondary/60 font-[800] uppercase tracking-widest'
        },
        {
            header: 'Status',
            accessor: (h: Honoree) => {
                const status = h.status as string;
                switch (status) {
                    case 'rascunho': return <span className="inline-block whitespace-nowrap px-4 py-1.5 rounded-xl text-[9px] font-[800] uppercase tracking-widest border bg-brand-gray text-brand-text-secondary/60 border-brand-gray/50">Rascunho</span>;
                    case 'em_analise': return <span className="inline-block whitespace-nowrap px-4 py-1.5 rounded-xl text-[9px] font-[800] uppercase tracking-widest border bg-yellow-50 text-yellow-600 border-yellow-200">Em Análise</span>;
                    case 'aprovado': return <span className="inline-block whitespace-nowrap px-4 py-1.5 rounded-xl text-[9px] font-[800] uppercase tracking-widest border bg-brand-blue/5 text-brand-blue border-brand-blue/20">Aprovado</span>;
                    case 'reprovado': return <span className="inline-block whitespace-nowrap px-4 py-1.5 rounded-xl text-[9px] font-[800] uppercase tracking-widest border bg-red-50 text-red-600 border-red-200">Reprovado</span>;
                    case 'publicado': return <span className="inline-block whitespace-nowrap px-4 py-1.5 rounded-xl text-[9px] font-[800] uppercase tracking-widest border bg-green-50 text-green-600 border-green-200">Publicado</span>;
                    default: return <span className="inline-block whitespace-nowrap px-4 py-1.5 rounded-xl text-[9px] font-[800] uppercase tracking-widest border bg-brand-gray text-brand-text-secondary/60 border-brand-gray/50">{status || 'N/A'}</span>;
                }
            }
        }
    ];

    const actions = (h: Honoree) => (
        <div className="flex gap-2">
            <button
                onClick={() => navigate(`/admin/homenageados/${h.id}`)}
                className="size-10 rounded-xl flex items-center justify-center text-brand-text-secondary/40 hover:text-brand-blue hover:bg-brand-blue/5 transition-all border border-transparent hover:border-brand-blue/20"
                title="Ver detalhes"
            >
                <span className="material-symbols-outlined text-[20px]">visibility</span>
            </button>
            <button
                onClick={() => handleEditClick(h)}
                className="size-10 rounded-xl flex items-center justify-center text-brand-text-secondary/40 hover:text-brand-blue hover:bg-brand-blue/5 transition-all border border-transparent hover:border-brand-blue/20"
                title="Editar"
            >
                <span className="material-symbols-outlined text-[20px]">edit</span>
            </button>

            {(h.status === 'aprovado' || h.status === 'publicado') && (
                <button
                    onClick={() => handleStatusUpdate(h, h.status === 'publicado' ? 'aprovado' : 'publicado')}
                    className={`size-10 rounded-xl flex items-center justify-center transition-all border border-transparent ${h.status === 'publicado' 
                        ? 'text-brand-blue hover:text-brand-blue/80 hover:bg-brand-blue/5 hover:border-brand-blue/20' 
                        : 'text-green-500/60 hover:text-green-500 hover:bg-green-500/5 hover:border-green-500/20'}`}
                    title={h.status === 'publicado' ? "Despublicar" : "Publicar Agora"}
                >
                    <span className="material-symbols-outlined text-[20px]">
                        {h.status === 'publicado' ? 'visibility_off' : 'publish'}
                    </span>
                </button>
            )}

            {!isDiretor && (
                <>
                    {(h.status === 'em_analise') && (
                        <>
                            <button
                                onClick={() => handleStatusUpdate(h, 'aprovado')}
                                className="size-10 rounded-xl flex items-center justify-center text-green-500/40 hover:text-green-500 hover:bg-green-500/5 transition-all border border-transparent hover:border-green-500/20"
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
                                className="size-10 rounded-xl flex items-center justify-center text-red-500/40 hover:text-red-500 hover:bg-red-500/5 transition-all border border-transparent hover:border-red-500/20"
                                title="Reprovar"
                            >
                                <span className="material-symbols-outlined text-[20px]">cancel</span>
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => handleDeleteClick(h.id)}
                        className="size-10 rounded-xl flex items-center justify-center text-brand-text-secondary/20 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-200"
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
                </>
            )}
        </div>
    );

    const filteredHonorees = useMemo(() => {
        return honorees.filter(h => {
            const st = h.status || 'rascunho';
            let matchesStatus = true;
            if (statusFilter === 'pendentes') matchesStatus = st === 'em_analise';
            else if (statusFilter === 'aprovados') matchesStatus = ['aprovado', 'publicado'].includes(st);
            else if (statusFilter === 'reprovados') matchesStatus = st === 'reprovado';
            else if (statusFilter === 'rascunhos') matchesStatus = st === 'rascunho';
            else if (statusFilter === 'todos') matchesStatus = true;

            const matchesRegional = regionalFilter === 'all' || h.regional_id === regionalFilter;
            const matchesUnit = unitFilter === 'all' || h.unit_id === unitFilter;

            return matchesStatus && matchesRegional && matchesUnit;
        });
    }, [honorees, statusFilter, regionalFilter, unitFilter]);

    const filteredUnitsForDropdown = useMemo(() => {
        if (regionalFilter === 'all') return units;
        return units.filter(u => u.regional_id === regionalFilter);
    }, [units, regionalFilter]);

    return (
        <div className="space-y-12 animate-fade-in pb-20 px-6 md:px-10 lg:px-16 pt-16">
            <div className="flex flex-wrap justify-between items-end gap-8 mb-12">
                <div className="space-y-3">
                    <span className="text-brand-blue text-[11px] font-[800] uppercase tracking-[0.4em] block">Gestão de Talentos</span>
                    <h2 className="text-[48px] font-[800] text-brand-dark tracking-tight leading-none">
                        {isRequestsView ? 'Central de Solicitações' : 'Homenageados'}
                    </h2>
                    <p className="text-brand-text-secondary max-w-2xl text-[16px] font-medium opacity-60">
                        Acompanhe, gerencie e aprove as indicações de mérito de toda a instituição.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/admin/homenageados/novo')}
                    className="btn-premium !px-10 !py-5"
                >
                    <span className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-lg">person_add</span>
                        Novo Homenageado
                    </span>
                </button>
            </div>

            {/* AÇÕES IMEDIATAS (Visível apenas para o Diretor) - BLOCO UNIFICADO */}
            {isDiretor && (rejectedHonorees.length > 0 || approvedHonorees.length > 0) && (
                <div className="p-8 md:p-10 rounded-[2.5rem] border-brand-blue/20 bg-brand-blue/5 shadow-xl shadow-brand-blue/5 animate-slide-up mb-12">
                    <div className="flex items-center gap-5 mb-8 pb-8 border-b border-brand-blue/10">
                        <div className="size-14 rounded-2xl bg-brand-blue/10 flex items-center justify-center text-brand-blue shrink-0">
                            <span className="material-symbols-outlined text-3xl">notifications_active</span>
                        </div>
                        <div>
                            <h3 className="text-[24px] font-[800] text-brand-blue tracking-tight leading-none">Ações Necessárias</h3>
                            <p className="text-[11px] text-brand-blue/60 uppercase tracking-widest font-[800] mt-1.5">Pendências que exigem sua atenção</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {rejectedHonorees.map(h => (
                            <div key={h.id} className="bg-white border-l-4 border-l-red-500 border-y border-r border-brand-gray p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-lg transition-all shadow-sm">
                                <div className="flex items-center gap-5 flex-1 overflow-hidden">
                                    <div className="size-14 rounded-2xl overflow-hidden shrink-0 border-2 border-bg-main shadow-sm">
                                        <img src={h.photo_url || '/assets/default-fallback.png'} alt="Foto" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <p className="font-[800] text-brand-dark text-[18px] leading-tight truncate">{getHonoreeName(h)}</p>
                                        <p className="text-[12px] text-red-500 mt-1.5 line-clamp-1 bg-red-50 px-3 py-1 rounded-lg w-fit" title={h.rejection_reason || ''}>
                                            <span className="font-[800] uppercase tracking-wider text-[10px]">Motivo:</span> {h.rejection_reason}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleEditClick(h)} 
                                    className="shrink-0 w-full sm:w-auto px-6 py-3.5 bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white border border-red-500/10 rounded-2xl text-[11px] font-[800] uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">edit</span> Corrigir
                                </button>
                            </div>
                        ))}

                        {approvedHonorees.map(h => (
                            <div key={h.id} className="bg-white border-l-4 border-l-green-500 border-y border-r border-brand-gray p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-lg transition-all shadow-sm">
                                <div className="flex items-center gap-5 flex-1 overflow-hidden">
                                    <div className="size-14 rounded-2xl overflow-hidden shrink-0 border-2 border-bg-main shadow-sm">
                                        <img src={h.photo_url || '/assets/default-fallback.png'} alt="Foto" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <p className="font-[800] text-brand-dark text-[18px] leading-tight truncate">{getHonoreeName(h)}</p>
                                        <p className="text-[11px] text-green-600 mt-1.5 bg-green-50 px-3 py-1 rounded-lg w-fit font-[800] uppercase tracking-widest">
                                            Pronto para Publicação
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleStatusUpdate(h, 'publicado')} 
                                    disabled={isLoading}
                                    className="shrink-0 w-full sm:w-auto px-6 py-3.5 bg-green-500/10 hover:bg-green-500 text-green-600 hover:text-white border border-green-500/10 rounded-2xl text-[11px] font-[800] uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
                                >
                                    <span className="material-symbols-outlined text-sm">publish</span> Publicar
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* BARRA DE CONTROLES (Abas e Filtros) */}
            <div className="flex flex-col xl:flex-row gap-8 justify-between items-start xl:items-center bg-white border border-brand-gray p-6 rounded-[2.5rem] shadow-sm">
                
                {/* Abas de Status */}
                <div className="flex flex-wrap gap-2 p-1.5 bg-bg-main border border-brand-gray rounded-[2rem]">
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
                            className={`px-6 py-2.5 rounded-[1.5rem] text-[11px] font-[800] uppercase tracking-widest transition-all ${statusFilter === tab.id ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'text-brand-text-secondary/60 hover:text-brand-blue'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Filtros Geográficos */}
                <div className="flex flex-wrap gap-5 w-full xl:w-auto">
                    <div className="flex items-center gap-3 w-full sm:w-auto bg-bg-main border border-brand-gray rounded-2xl px-5 py-3 group focus-within:border-brand-blue transition-all">
                        <span className="material-symbols-outlined text-brand-blue/50 text-xl">map</span>
                        <select
                            value={regionalFilter}
                            onChange={(e) => {
                                setRegionalFilter(e.target.value);
                                setUnitFilter('all'); // Reseta unidade ao trocar regional
                            }}
                            className="bg-transparent border-none text-brand-dark text-[13px] font-[700] outline-none focus:ring-0 cursor-pointer w-full sm:w-auto min-w-[180px]"
                        >
                            <option value="all">Todas as Regionais</option>
                            {regionals.map(r => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto bg-bg-main border border-brand-gray rounded-2xl px-5 py-3 group focus-within:border-brand-blue transition-all">
                        <span className="material-symbols-outlined text-brand-blue/50 text-xl">location_city</span>
                        <select
                            value={unitFilter}
                            onChange={(e) => setUnitFilter(e.target.value)}
                            className="bg-transparent border-none text-brand-dark text-[13px] font-[700] outline-none focus:ring-0 cursor-pointer w-full sm:w-auto min-w-[180px]"
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

            {/* MODAL DE SOLICITAÇÃO DE EDIÇÃO (DESPUBLICAR) */}
            <ConfirmModal
                isOpen={isRequestEditModalOpen}
                onClose={() => setIsRequestEditModalOpen(false)}
                onConfirm={confirmRequestEdit}
                title="Editar Cadastro Aprovado"
                message={
                    <div className="space-y-4 pt-4 text-left">
                        <p className="text-sm text-off-white/70">
                            Este homenageado já foi verificado e aprovado/publicado.
                        </p>
                        <p className="text-sm text-gold font-bold">
                            Para editá-lo, o cadastro retornará ao status de Rascunho e será ocultado do site público. Você precisará enviar para análise novamente após concluir a edição.
                        </p>
                        <p className="text-sm text-off-white/70">
                            Deseja prosseguir com a edição?
                        </p>
                    </div>
                }
                confirmLabel="Sim, Voltar para Edição"
                cancelLabel="Cancelar"
                type="warning"
            />

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