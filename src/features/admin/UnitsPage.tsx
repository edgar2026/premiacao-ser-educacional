import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../components/ui/GlassCard';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/supabase';

type Unit = Database['public']['Tables']['units']['Row'];

const UnitsPage: React.FC = () => {
    const navigate = useNavigate();
    const [units, setUnits] = useState<Unit[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchUnits();
    }, []);

    const fetchUnits = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('units')
            .select('*')
            .order('name');

        if (error) {
            console.error('Error fetching units:', error);
        } else {
            setUnits(data || []);
        }
        setIsLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta unidade?')) return;

        const { error } = await supabase
            .from('units')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting unit:', error);
            alert('Erro ao excluir unidade');
        } else {
            fetchUnits();
        }
    };

    return (
        <div className="space-y-12 animate-fade-in">
            <div className="flex flex-wrap justify-between items-end gap-8 mb-16">
                <div className="space-y-4">
                    <span className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] block">Gestão Geográfica</span>
                    <h2 className="text-5xl font-bold font-serif text-off-white italic">Gestão de <span className="text-gold-gradient">Unidades</span></h2>
                    <p className="text-off-white/40 max-w-2xl text-lg font-light italic">
                        Administração de polos e centros universitários Ser Educacional.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/admin/unidades/novo')}
                    className="bg-gold hover:bg-gold-light hover:scale-[1.02] active:scale-[0.98] transition-all text-navy-deep px-8 py-5 rounded-full font-bold text-[10px] uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(212,175,55,0.2)] group"
                >
                    <span className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-lg">add_location</span>
                        Nova Unidade
                    </span>
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {units.map((unit) => (
                        <GlassCard key={unit.id} className="p-8 rounded-[2.5rem] border-white/5 hover:border-gold/20 transition-all group relative">
                            <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => navigate(`/admin/unidades/${unit.id}/editar`)}
                                    className="p-2 rounded-full bg-white/5 text-gold hover:bg-gold hover:text-navy-deep transition-all"
                                >
                                    <span className="material-symbols-outlined text-sm">edit</span>
                                </button>
                                <button
                                    onClick={() => handleDelete(unit.id)}
                                    className="p-2 rounded-full bg-white/5 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                                >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                            </div>
                            <div className="size-12 rounded-2xl bg-gold/5 flex items-center justify-center mb-6 group-hover:bg-gold transition-all duration-500">
                                <span className="material-symbols-outlined text-gold group-hover:text-navy-deep">location_city</span>
                            </div>
                            <h3 className="text-xl font-bold text-off-white font-serif mb-2">{unit.name}</h3>
                            <p className="text-off-white/40 text-[10px] uppercase tracking-widest mb-6">{unit.location}</p>
                        </GlassCard>
                    ))}
                    {units.length === 0 && (
                        <div className="col-span-full py-20 text-center">
                            <p className="text-off-white/20 italic">Nenhuma unidade cadastrada.</p>
                        </div>
                    )}
                </div>
            )}

            <GlassCard className="rounded-[3rem] overflow-hidden border-white/5 mt-12">
                <div className="p-10 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-2xl font-bold font-serif text-off-white italic">Mapa de <span className="text-gold">Atuação</span></h3>
                </div>
                <div className="aspect-[21/9] bg-navy-light/30 flex items-center justify-center relative">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/world-map.png')] bg-center bg-no-repeat bg-contain"></div>
                    <p className="text-off-white/20 text-sm font-light italic z-10">Visualização de mapa interativo em desenvolvimento...</p>
                </div>
            </GlassCard>
        </div>
    );
};

export default UnitsPage;
