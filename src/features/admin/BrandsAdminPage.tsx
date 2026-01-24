import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/supabase';
import ConfirmModal from '../../components/ui/ConfirmModal';

type Brand = Database['public']['Tables']['brands']['Row'];

const BrandsAdminPage: React.FC = () => {
    const navigate = useNavigate();
    const [brands, setBrands] = useState<Brand[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    useEffect(() => {
        fetchBrands();
    }, []);

    const fetchBrands = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('brands')
            .select('*')
            .order('name');

        if (error) {
            console.error('Error fetching brands:', error);
        } else {
            setBrands(data || []);
        }
        setIsLoading(false);
    };

    const handleDeleteClick = async (id: string) => {
        // Check if brand has units
        const { data: units } = await supabase
            .from('units')
            .select('id')
            .eq('brand_id', id)
            .limit(1);

        if (units && units.length > 0) {
            setAlertMessage('Não é possível excluir esta marca pois ela possui unidades vinculadas.');
            setIsAlertModalOpen(true);
            return;
        }

        setItemToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        const { error } = await supabase
            .from('brands')
            .delete()
            .eq('id', itemToDelete);

        if (error) {
            setAlertMessage('Erro ao excluir marca: ' + error.message);
            setIsAlertModalOpen(true);
        } else {
            fetchBrands();
        }
        setItemToDelete(null);
    };

    const columns: Column<Brand>[] = [
        {
            header: 'Marca',
            accessor: (b: Brand) => (
                <div className="flex items-center gap-5">
                    <div className="size-12 rounded-2xl bg-gold/5 text-gold border border-gold/20 flex items-center justify-center font-serif italic text-lg">
                        <span className="material-symbols-outlined">corporate_fare</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-off-white font-serif italic text-lg leading-tight">{b.name}</span>
                        <span className="text-[10px] text-off-white/30 uppercase tracking-widest">
                            Marca Institucional
                        </span>
                    </div>
                </div>
            )
        },
        {
            header: 'Data de Criação',
            accessor: (b: Brand) => new Date(b.created_at!).toLocaleDateString('pt-BR'),
            className: 'text-sm text-off-white/40 font-medium uppercase tracking-widest'
        }
    ];

    const actions = (b: Brand) => (
        <>
            <button
                onClick={() => navigate(`/admin/marcas/${b.id}/editar`)}
                className="size-10 rounded-xl flex items-center justify-center text-off-white/40 hover:text-gold hover:bg-gold/10 transition-all border border-transparent hover:border-gold/20"
                title="Editar"
            >
                <span className="material-symbols-outlined text-[20px]">edit</span>
            </button>
            <button
                onClick={() => handleDeleteClick(b.id)}
                className="size-10 rounded-xl flex items-center justify-center text-off-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all border border-transparent hover:border-red-400/20"
                title="Excluir"
            >
                <span className="material-symbols-outlined text-[20px]">delete</span>
            </button>
        </>
    );

    return (
        <div className="space-y-12 animate-fade-in pb-20 px-6 md:px-10 lg:px-16 pt-20 lg:pt-8">
            <div className="flex flex-wrap justify-between items-end gap-8 mb-16">
                <div className="space-y-4">
                    <span className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] block">Gestão Institucional</span>
                    <h2 className="text-5xl font-bold font-serif text-off-white italic">Marcas</h2>
                    <p className="text-off-white/40 max-w-2xl text-lg font-light italic">
                        Administre as marcas institucionais do grupo educacional.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/admin/marcas/novo')}
                    className="bg-gold hover:bg-gold-light hover:scale-[1.02] active:scale-[0.98] transition-all text-navy-deep px-10 py-5 rounded-full font-bold text-[10px] uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(212,175,55,0.2)] flex items-center gap-3"
                >
                    <span className="material-symbols-outlined text-lg">add_circle</span>
                    Nova Marca
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
                </div>
            ) : (
                <DataTable
                    data={brands}
                    columns={columns}
                    actions={actions}
                    searchPlaceholder="Buscar por nome..."
                />
            )}

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Excluir Marca"
                message="Tem certeza que deseja excluir esta marca? Esta ação não poderá ser desfeita."
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

export default BrandsAdminPage;
