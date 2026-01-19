import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/supabase';

type Honoree = Database['public']['Tables']['honorees']['Row'] & {
    awards?: { name: string } | null;
};

const HonoreesAdminPage: React.FC = () => {
    const navigate = useNavigate();
    const [honorees, setHonorees] = useState<Honoree[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchHonorees();
    }, []);

    const fetchHonorees = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('honorees')
            .select('*, awards!honorees_award_id_fkey(name)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching honorees:', error);
        } else {
            setHonorees(data || []);
        }
        setIsLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este homenageado?')) return;

        const { error } = await supabase
            .from('honorees')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Erro ao excluir homenageado: ' + error.message);
        } else {
            fetchHonorees();
        }
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
                            {h.professional_data ? JSON.parse(h.professional_data).name : 'Sem nome'}
                        </span>
                        <span className="text-[10px] text-off-white/30 uppercase tracking-widest">
                            {h.type}
                        </span>
                    </div>
                </div>
            )
        },
        {
            header: 'Prêmio Vinculado',
            accessor: (h: Honoree) => h.awards?.name || 'Nenhum',
            className: 'text-sm text-off-white/40 font-medium uppercase tracking-widest'
        },
        {
            header: 'Status',
            accessor: (h: Honoree) => (
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${h.is_published
                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                    : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                    }`}>
                    {h.is_published ? 'Publicado' : 'Rascunho'}
                </span>
            )
        }
    ];

    const actions = (h: Honoree) => (
        <>
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
            <button
                onClick={() => handleDelete(h.id)}
                className="size-10 rounded-xl flex items-center justify-center text-off-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all border border-transparent hover:border-red-400/20"
                title="Excluir"
            >
                <span className="material-symbols-outlined text-[20px]">delete</span>
            </button>
        </>
    );

    return (
        <div className="p-10 space-y-10 animate-fade-in">
            <div className="flex flex-wrap justify-between items-end gap-8">
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
        </div>
    );
};

export default HonoreesAdminPage;
