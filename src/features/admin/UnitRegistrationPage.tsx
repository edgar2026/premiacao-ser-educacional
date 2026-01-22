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
    const [brandId, setBrandId] = useState('');
    const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [showBrandModal, setShowBrandModal] = useState(false);
    const [newBrandName, setNewBrandName] = useState('');
    const [isCreatingBrand, setIsCreatingBrand] = useState(false);

    useEffect(() => {
        const init = async () => {
            await fetchBrands();
            if (isEdit && id) {
                await fetchUnit();
            } else {
                setIsFetching(false);
            }
        };
        init();
    }, [id]);

    const fetchBrands = async () => {
        const { data, error } = await supabase
            .from('brands')
            .select('id, name')
            .order('name');

        if (error) {
            console.error('Error fetching brands:', error);
        } else if (data) {
            setBrands(data);
        }
    };

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
            setBrandId(data.brand_id);
        }
        setIsFetching(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const unitData = {
            name,
            location,
            brand_id: brandId,
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

    const handleCreateBrand = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBrandName.trim()) return;

        setIsCreatingBrand(true);
        try {
            const { data, error } = await supabase
                .from('brands')
                .insert([{ name: newBrandName.trim() }])
                .select()
                .single();

            if (error) throw error;

            // Add new brand to list and select it
            setBrands([...brands, data]);
            setBrandId(data.id);
            setNewBrandName('');
            setShowBrandModal(false);
        } catch (error: any) {
            console.error('Error creating brand:', error);
            alert('Erro ao criar marca: ' + error.message);
        } finally {
            setIsCreatingBrand(false);
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
        <div className="space-y-12 animate-fade-in pb-20 px-6 md:px-10 lg:px-16 pt-20 lg:pt-8">
            <div className="flex flex-wrap justify-between items-end gap-8 mb-16">
                <div className="space-y-4">
                    <button
                        onClick={() => navigate('/admin/unidades')}
                        className="flex items-center gap-2 text-gold text-[10px] font-bold uppercase tracking-[0.2em] hover:opacity-70 transition-opacity mb-4"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Voltar para unidades
                    </button>
                    <span className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] block">Gestão Geográfica</span>
                    <h2 className="text-5xl font-bold font-serif text-off-white italic">
                        {isEdit ? 'Editar' : 'Nova'} <span className="text-gold-gradient">Unidade</span>
                    </h2>
                </div>
            </div>

            <GlassCard className="p-10 rounded-[3rem] border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
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

                        <div className="space-y-4">
                            <div className="flex items-center justify-between ml-2">
                                <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-off-white/30">Marca Institucional</label>
                                <button
                                    type="button"
                                    onClick={() => setShowBrandModal(true)}
                                    className="flex items-center gap-1 text-gold text-[9px] font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
                                >
                                    <span className="material-symbols-outlined text-sm">add_circle</span>
                                    Nova Marca
                                </button>
                            </div>
                            <select
                                required
                                className="w-full bg-white/[0.03] border border-white/10 px-8 py-5 rounded-2xl text-off-white focus:border-gold/50 outline-none transition-all appearance-none cursor-pointer"
                                value={brandId}
                                onChange={(e) => setBrandId(e.target.value)}
                            >
                                <option value="" disabled className="bg-navy-deep">Selecione uma marca</option>
                                {brands.map(brand => (
                                    <option key={brand.id} value={brand.id} className="bg-navy-deep">
                                        {brand.name}
                                    </option>
                                ))}
                            </select>
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

            {/* Brand Creation Modal */}
            {showBrandModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="glass-card rounded-[2rem] border-white/10 p-8 max-w-md w-full animate-slide-up">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold font-serif text-off-white italic">Nova <span className="text-gold-gradient">Marca</span></h3>
                            <button
                                onClick={() => {
                                    setShowBrandModal(false);
                                    setNewBrandName('');
                                }}
                                className="text-off-white/40 hover:text-off-white transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleCreateBrand} className="space-y-6">
                            <div className="space-y-4">
                                <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-off-white/30 ml-2">Nome da Marca</label>
                                <input
                                    required
                                    autoFocus
                                    className="w-full bg-white/[0.03] border border-white/10 px-8 py-5 rounded-2xl text-off-white focus:border-gold/50 outline-none transition-all placeholder:text-off-white/10"
                                    placeholder="Ex: UNIFAEL"
                                    type="text"
                                    value={newBrandName}
                                    onChange={(e) => setNewBrandName(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowBrandModal(false);
                                        setNewBrandName('');
                                    }}
                                    className="flex-1 px-8 py-4 rounded-xl font-bold text-[10px] uppercase tracking-[0.3em] text-off-white/40 hover:text-off-white transition-colors border border-white/10"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreatingBrand || !newBrandName.trim()}
                                    className="flex-1 bg-gold hover:bg-gold-light text-navy-deep px-8 py-4 rounded-xl font-bold text-[10px] uppercase tracking-[0.3em] shadow-lg shadow-gold/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isCreatingBrand ? 'Criando...' : 'Criar Marca'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UnitRegistrationPage;
