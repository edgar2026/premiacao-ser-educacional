import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/supabase';
import ConfirmModal from '../../components/ui/ConfirmModal';

type Award = Database['public']['Tables']['awards']['Row'];

const AwardsAdminPage: React.FC = () => {
    const navigate = useNavigate();
    const [awards, setAwards] = useState<Award[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    useEffect(() => {
        fetchAwards();
    }, []);

    const fetchAwards = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('awards')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching awards:', error);
        } else {
            setAwards(data || []);
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
            .from('awards')
            .delete()
            .eq('id', itemToDelete);

        if (error) {
            setAlertMessage('Erro ao excluir prêmio: ' + error.message);
            setIsAlertModalOpen(true);
        } else {
            fetchAwards();
        }
        setItemToDelete(null);
    };

    const columns: Column<Award>[] = [
        {
            header: 'Prêmio',
            accessor: (a: Award) => (
                <div className="flex items-center gap-5">
                    <div className="size-12 rounded-2xl bg-brand-blue/5 text-brand-blue border border-brand-blue/10 flex items-center justify-center overflow-hidden">
                        {a.image_url ? (
                            <img src={a.image_url} alt={a.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="material-symbols-outlined">military_tech</span>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-[800] text-brand-dark text-[15px] leading-tight">{a.name}</span>
                        <span className="text-[10px] text-brand-text-secondary/60 font-[700] uppercase tracking-widest truncate max-w-[300px] mt-0.5">
                            {a.description || 'Sem descrição'}
                        </span>
                    </div>
                </div>
            )
        },
        {
            header: 'Data de Criação',
            accessor: (a: Award) => new Date(a.created_at!).toLocaleDateString('pt-BR'),
            className: 'text-[12px] text-brand-text-secondary/60 font-[800] uppercase tracking-widest'
        }
    ];

    const actions = (a: Award) => (
        <>
            <button
                onClick={() => navigate(`/admin/premios/${a.id}/editar`)}
                className="size-10 rounded-xl flex items-center justify-center text-brand-text-secondary/40 hover:text-brand-blue hover:bg-brand-blue/5 transition-all border border-transparent hover:border-brand-blue/20"
                title="Editar"
            >
                <span className="material-symbols-outlined text-[20px]">edit</span>
            </button>
            <button
                onClick={() => handleDeleteClick(a.id)}
                className="size-10 rounded-xl flex items-center justify-center text-brand-text-secondary/20 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-200"
                title="Excluir"
            >
                <span className="material-symbols-outlined text-[20px]">delete</span>
            </button>
        </>
    );

    return (
        <div className="space-y-12 animate-fade-in pb-20 px-6 md:px-10 lg:px-16 pt-16">
            <div className="flex flex-wrap justify-between items-end gap-8 mb-12">
                <div className="space-y-3">
                    <span className="text-brand-blue text-[11px] font-[800] uppercase tracking-[0.4em] block">Gestão de Honrarias</span>
                    <h2 className="text-[48px] font-[800] text-brand-dark tracking-tight leading-none">Prêmios</h2>
                    <p className="text-brand-text-secondary max-w-2xl text-[16px] font-medium opacity-60">
                        Administre as categorias e distinções de mérito institucional.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/admin/premios/novo')}
                    className="btn-premium !px-10 !py-5"
                >
                    <span className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-lg">add_circle</span>
                        Novo Prêmio
                    </span>
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
                </div>
            ) : (
                <DataTable
                    data={awards}
                    columns={columns}
                    actions={actions}
                    searchPlaceholder="Buscar por nome ou descrição..."
                />
            )}

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Excluir Prêmio"
                message="Tem certeza que deseja excluir este prêmio? Esta ação não poderá ser desfeita."
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

export default AwardsAdminPage;
