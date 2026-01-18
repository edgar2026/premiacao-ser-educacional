import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GlassCard from '../../components/ui/GlassCard';
import { supabase } from '../../lib/supabase';

const UnitRegistrationPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(isEdit);

    useEffect(() => {
        if (isEdit && id) {
            fetchUnit();
        }
    }, [id]);

    const fetchUnit = async () => {
        const { data, error } = await supabase
            .from('units')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching unit:', error);
            alert('Erro ao carregar unidade');
            navigate('/admin/unidades');
        } else if (data) {
            setName(data.name);
            setLocation(data.location);
        }
        setIsFetching(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const unitData = {
            name,
            location,
        };

        try {
            if (isEdit && id) {
                const { error } = await supabase
                    .from('units')
                    .update(unitData)
                    .eq('id', id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('units')
                    .insert([unitData]);
                if (error) throw error;
            }

            navigate('/admin/unidades');
        } catch (error: any) {
            console.error('Error saving unit:', error);
            alert('Erro ao salvar unidade: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-10 space-y-10 animate-fade-in">
            <div className="space-y-4">
                <button
                    onClick={() => navigate('/admin/unidades')}
                    className="flex items-center gap-2 text-gold text-[10px] font-bold uppercase tracking-[0.2em] hover:opacity-70 transition-opacity"
                >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Voltar para unidades
                </button>
                <h2 className="text-5xl font-bold font-serif text-off-white italic">
                    {isEdit ? 'Editar' : 'Nova'} <span className="text-gold-gradient">Unidade</span>
                </h2>
            </div>

            <GlassCard className="p-10 rounded-[3rem] border-white/10">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 gap-8">
                        <div className="space-y-4">
                            <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-off-white/30 ml-2">Nome da Unidade</label>
                            <input
                                required
                                className="w-full bg-white/[0.03] border border-white/10 px-8 py-5 rounded-2xl text-off-white focus:border-gold/50 outline-none transition-all placeholder:text-off-white/10"
                                placeholder="Ex: Uninassau Recife"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-off-white/30 ml-2">Localização (Cidade, UF)</label>
                            <input
                                required
                                className="w-full bg-white/[0.03] border border-white/10 px-8 py-5 rounded-2xl text-off-white focus:border-gold/50 outline-none transition-all placeholder:text-off-white/10"
                                placeholder="Ex: Recife, PE"
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            disabled={isLoading}
                            className="w-full bg-gold hover:bg-gold-light text-navy-deep py-6 rounded-2xl font-bold text-[11px] uppercase tracking-[0.4em] shadow-2xl shadow-gold/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Salvando...' : isEdit ? 'Atualizar Unidade' : 'Cadastrar Unidade'}
                        </button>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
};

export default UnitRegistrationPage;
