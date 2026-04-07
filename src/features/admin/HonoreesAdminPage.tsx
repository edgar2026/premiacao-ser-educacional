import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import DataTable from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/supabase';
import ConfirmModal from '../../components/ui/ConfirmModal';

type Honoree = Database['public']['Tables']['honorees']['Row'] & {
    awards?: { name: string } | null;
    regionals?: { name: string } | null;
    status?: string | null;
    profiles?: { username: string } | null;
};

const HonoreesAdminPage: React.FC = () => {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const isDiretor = profile?.role === 'diretor';
    const [honorees, setHonorees] = useState<Honoree[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    useEffect(() => {
        fetchHonorees();
    }, []);

    const fetchHonorees = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('honorees')
            .select('*, awards!honorees_award_id_fkey(name), regionals(name), profiles:created_by(username)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching honorees:', error);
        } else {
            setHonorees(data || []);
        }
        setIsLoading(false);
    };

    const handleDeleteClick = (id: string) => {
        setItemToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        const { error } = await supabase
            .from('honorees')
            .delete()
            .eq('id', itemToDelete);

        if (error) {
            setAlertMessage('Erro ao excluir homenageado: ' + error.message);
            setIsAlertModalOpen(true);
        } else {
            fetchHonorees();
        }
        setItemToDelete(null);
    };

    const handleStatusUpdate = async (h: Honoree, status: string, rejectionReason?: string | null) => {
        setIsLoading(true);
        const updateData: any = { status };
        
        if (rejectionReason !== undefined) {
            updateData.rejection_reason = rejectionReason;
        }
        
        // If status is published, also set is_published flag (for compatibility)
        if (status === 'publicado') {
            updateData.is_published = true;
        } else if (status === 'aprovado' || status === 'reprovado' || status === 'em_analise') {
            updateData.is_published = false;
        }

        const { error } = await supabase
            .from('honorees')
            .update(updateData)
            .eq('id', h.id);

        if (error) {
            setAlertMessage('Erro ao atualizar status: ' + error.message);
            setIsAlertModalOpen(true);
        } else {
            // Send email notification if needed
            if (h.profiles?.username && (status === 'reprovado' || status === 'aprovado' || status === 'publicado')) {
                try {
                    let honoreeName = 'Homenageado';
                    try {
                        if (h.professional_data) {
                            const data = JSON.parse(h.professional_data);
                            honoreeName = data.name || 'Homenageado';
                        }
                    } catch (e) {
                        console.error('Error parsing professional_data for notification:', e);
                    }
                    
                    await supabase.functions.invoke('notify-rejection', {
                        body: {
                            honoreeName,
                            userEmail: h.profiles?.username || '',
                            reason: rejectionReason,
                            status
                        }
                    });
                } catch (emailError) {
                    console.error('Failed to send notification email:', emailError);
                }
            }
            fetchHonorees();
        }
        setIsLoading(false);
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
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = '/assets/default-fallback.png';
                            }}
                        />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-off-white font-serif italic text-lg leading-tight">
                            {(() => {
                                try {
                                    return h.professional_data ? JSON.parse(h.professional_data).name : 'Sem nome';
                                } catch (e) {
                                    return h.name || 'Sem nome';
                                }
                            })()}
                        </span>
                        <span className="text-[10px] text-off-white/30 uppercase tracking-widest">
                            {h.type}
                        </span>
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
                    case 'rascunho':
                        return (
                            <span className="px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border bg-off-white/5 text-off-white/40 border-white/10">
                                Rascunho
                            </span>
                        );
                    case 'em_analise':
                        return (
                            <span className="px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                                Em Análise
                            </span>
                        );
                    case 'aprovado':
                        return (
                            <span className="px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border bg-blue-500/10 text-blue-500 border-blue-500/20">
                                Aprovado
                            </span>
                        );
                    case 'reprovado':
                        return (
                            <span className="px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border bg-red-500/10 text-red-500 border-red-500/20">
                                Reprovado
                            </span>
                        );
                    case 'publicado':
                        return (
                            <span className="px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border bg-green-500/10 text-green-500 border-green-500/20">
                                Publicado
                            </span>
                        );
                    default:
                        return (
                            <span className="px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border bg-off-white/5 text-off-white/40 border-white/10">
                                {status || 'N/A'}
                            </span>
                        );
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
                    {h.status === 'em_analise' && (
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
                                    const reason = prompt('Motivo da reprovação:');
                                    if (reason) handleStatusUpdate(h, 'reprovado', reason);
                                }}
                                className="size-10 rounded-xl flex items-center justify-center text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                                title="Reprovar"
                            >
                                <span className="material-symbols-outlined text-[20px]">cancel</span>
                            </button>
                        </>
                    )}
                    {(h.status === 'aprovado' || h.status === 'publicado') && (
                        <button
                            onClick={() => handleStatusUpdate(h, h.status === 'publicado' ? 'aprovado' : 'publicado')}
                            className={`size-10 rounded-xl flex items-center justify-center transition-all border border-transparent ${h.status === 'publicado' 
                                ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 hover:border-blue-400/20' 
                                : 'text-off-white/20 hover:text-blue-400 hover:bg-blue-400/10 hover:border-blue-400/20'}`}
                            title={h.status === 'publicado' ? "Despublicar" : "Publicar"}
                        >
                            <span className="material-symbols-outlined text-[20px]">
                                {h.status === 'publicado' ? 'visibility_off' : 'publish'}
                            </span>
                        </button>
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
        </div>
    );

    return (
        <div className="space-y-12 animate-fade-in pb-20 px-6 md:px-10 lg:px-16 pt-20 lg:pt-8">
            <div className="flex flex-wrap justify-between items-end gap-8 mb-16">
                <div className="space-y-4">
                    <span className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] block">Gestão de Talentos</span>
                    <h2 className="text-5xl font-bold font-serif text-off-white italic">Homenageados</h2>
                    <p className="text-off-white/40 max-w-2xl text-lg font-light italic">
                        Administre o registro histórico de excelência e mérito institucional.
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

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
                </div>
            ) : (
                <DataTable
                    data={honorees}
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
