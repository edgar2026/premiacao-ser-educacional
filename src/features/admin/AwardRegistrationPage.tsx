import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GlassCard from '../../components/ui/GlassCard';
import { supabase } from '../../lib/supabase';

const AwardRegistrationPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(!!id);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image_url: '',
        criteria: [] as { title: string; desc: string }[],
        cycle_info: {
            edition: '',
            description: '',
            button_text: '',
            button_link: ''
        }
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchAward();
        }
    }, [id]);

    const fetchAward = async () => {
        const { data, error } = await supabase
            .from('awards')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching award:', error);
            navigate('/admin/premios');
        } else {
            setFormData({
                name: data.name,
                description: data.description || '',
                image_url: data.image_url || '',
                criteria: data.criteria || [],
                cycle_info: data.cycle_info || {
                    edition: '',
                    description: '',
                    button_text: '',
                    button_link: ''
                }
            });
            if (data.image_url) setImagePreview(data.image_url);
        }
        setIsFetching(false);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const uploadImage = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('awards')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('awards')
            .getPublicUrl(filePath);

        return data.publicUrl;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            let finalImageUrl = formData.image_url;

            if (imageFile) {
                finalImageUrl = await uploadImage(imageFile);
            }

            const payload = {
                name: formData.name,
                description: formData.description,
                image_url: finalImageUrl,
                criteria: formData.criteria,
                cycle_info: formData.cycle_info
            };

            if (id) {
                const { error } = await supabase
                    .from('awards')
                    .update(payload)
                    .eq('id', id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('awards')
                    .insert([payload]);
                if (error) throw error;
            }

            navigate('/admin/premios');
        } catch (error: any) {
            alert('Erro ao salvar prêmio: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const addCriteria = () => {
        setFormData({
            ...formData,
            criteria: [...formData.criteria, { title: '', desc: '' }]
        });
    };

    const removeCriteria = (index: number) => {
        const newCriteria = [...formData.criteria];
        newCriteria.splice(index, 1);
        setFormData({ ...formData, criteria: newCriteria });
    };

    const updateCriteria = (index: number, field: 'title' | 'desc', value: string) => {
        const newCriteria = [...formData.criteria];
        newCriteria[index] = { ...newCriteria[index], [field]: value };
        setFormData({ ...formData, criteria: newCriteria });
    };

    const updateCycleInfo = (field: string, value: string) => {
        setFormData({
            ...formData,
            cycle_info: { ...formData.cycle_info, [field]: value }
        });
    };

    if (isFetching) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
            </div>
        );
    }

    return (
        <div className="p-10 space-y-10 animate-fade-in max-w-4xl mx-auto">
            <div className="space-y-4">
                <button
                    onClick={() => navigate('/admin/premios')}
                    className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-2 hover:opacity-70 transition-opacity"
                >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Voltar para lista
                </button>
                <h2 className="text-5xl font-bold font-serif text-off-white italic">
                    {id ? 'Editar' : 'Novo'} <span className="text-gold-gradient">Prêmio</span>
                </h2>
            </div>

            <GlassCard className="p-12 rounded-[3rem] border-white/5">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-8">
                            <div className="space-y-4">
                                <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-off-white/30 ml-2">Nome do Prêmio</label>
                                <input
                                    required
                                    className="w-full bg-white/[0.03] border border-white/10 px-6 py-5 rounded-2xl text-off-white focus:border-gold/50 outline-none transition-all placeholder:text-off-white/10"
                                    placeholder="Ex: Mérito Acadêmico"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-off-white/30 ml-2">Descrição</label>
                                <textarea
                                    rows={4}
                                    className="w-full bg-white/[0.03] border border-white/10 px-6 py-5 rounded-2xl text-off-white focus:border-gold/50 outline-none transition-all placeholder:text-off-white/10 resize-none"
                                    placeholder="Breve descrição sobre o prêmio..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-off-white/30 ml-2">Imagem de Destaque</label>
                            <div
                                className="relative aspect-square rounded-[2rem] bg-white/[0.03] border-2 border-dashed border-white/10 flex flex-col items-center justify-center overflow-hidden group hover:border-gold/30 transition-all cursor-pointer"
                                onClick={() => document.getElementById('image-upload')?.click()}
                            >
                                {imagePreview ? (
                                    <>
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-navy-deep/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="text-gold font-bold text-[10px] uppercase tracking-widest">Alterar Imagem</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center p-8">
                                        <span className="material-symbols-outlined text-4xl text-white/10 mb-4">add_photo_alternate</span>
                                        <p className="text-[10px] font-bold text-off-white/20 uppercase tracking-widest leading-relaxed">
                                            Clique para upload<br />ou arraste a imagem
                                        </p>
                                    </div>
                                )}
                                <input
                                    id="image-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-10 border-t border-white/5">
                        {/* Criteria Section */}
                        <div className="space-y-8">
                            <div className="flex justify-between items-center">
                                <h3 className="text-2xl font-serif italic text-off-white">Critérios de Seleção</h3>
                                <button
                                    type="button"
                                    onClick={addCriteria}
                                    className="flex items-center gap-2 text-gold text-[10px] font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
                                >
                                    <span className="material-symbols-outlined text-sm">add_circle</span>
                                    Adicionar Critério
                                </button>
                            </div>

                            <div className="space-y-4">
                                {formData.criteria.map((item, index) => (
                                    <div key={index} className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 space-y-4 relative group">
                                        <button
                                            type="button"
                                            onClick={() => removeCriteria(index)}
                                            className="absolute top-4 right-4 text-off-white/10 hover:text-red-400 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                        <div className="space-y-2">
                                            <label className="block text-[8px] font-bold uppercase tracking-widest text-off-white/20">Título do Critério</label>
                                            <input
                                                className="w-full bg-white/5 border border-white/10 py-3 px-4 rounded-lg text-off-white text-sm outline-none focus:border-gold/30"
                                                placeholder="Ex: Impacto Institucional"
                                                value={item.title}
                                                onChange={(e) => updateCriteria(index, 'title', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[8px] font-bold uppercase tracking-widest text-off-white/20">Descrição</label>
                                            <textarea
                                                rows={2}
                                                className="w-full bg-white/5 border border-white/10 py-3 px-4 rounded-lg text-off-white text-sm outline-none focus:border-gold/30 resize-none"
                                                placeholder="Descreva o que é avaliado..."
                                                value={item.desc}
                                                onChange={(e) => updateCriteria(index, 'desc', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                ))}
                                {formData.criteria.length === 0 && (
                                    <div className="text-center py-10 border-2 border-dashed border-white/5 rounded-2xl">
                                        <p className="text-off-white/20 text-[10px] uppercase tracking-widest font-bold">Nenhum critério adicionado</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Cycle Info Section */}
                        <div className="space-y-8">
                            <h3 className="text-2xl font-serif italic text-off-white">Próximo Ciclo</h3>
                            <div className="bg-white/[0.02] p-8 rounded-[2rem] border border-white/5 space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-[8px] font-bold uppercase tracking-widest text-off-white/20">Edição (Ex: 2024.2)</label>
                                    <input
                                        className="w-full bg-white/5 border border-white/10 py-4 px-6 rounded-xl text-off-white text-lg font-serif italic outline-none focus:border-gold/30"
                                        placeholder="Edição 2024.2"
                                        value={formData.cycle_info.edition}
                                        onChange={(e) => updateCycleInfo('edition', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[8px] font-bold uppercase tracking-widest text-off-white/20">Descrição do Ciclo</label>
                                    <textarea
                                        rows={3}
                                        className="w-full bg-white/5 border border-white/10 py-4 px-6 rounded-xl text-off-white text-sm outline-none focus:border-gold/30 resize-none"
                                        placeholder="Informações sobre as indicações..."
                                        value={formData.cycle_info.description}
                                        onChange={(e) => updateCycleInfo('description', e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="block text-[8px] font-bold uppercase tracking-widest text-off-white/20">Texto do Botão</label>
                                        <input
                                            className="w-full bg-white/5 border border-white/10 py-3 px-4 rounded-lg text-off-white text-xs outline-none focus:border-gold/30"
                                            placeholder="Ver Cronograma"
                                            value={formData.cycle_info.button_text}
                                            onChange={(e) => updateCycleInfo('button_text', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[8px] font-bold uppercase tracking-widest text-off-white/20">Link do Botão</label>
                                        <input
                                            className="w-full bg-white/5 border border-white/10 py-3 px-4 rounded-lg text-off-white text-xs outline-none focus:border-gold/30"
                                            placeholder="https://..."
                                            value={formData.cycle_info.button_link}
                                            onChange={(e) => updateCycleInfo('button_link', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 flex justify-end gap-6">
                        <button
                            type="button"
                            onClick={() => navigate('/admin/premios')}
                            className="px-10 py-5 rounded-full font-bold text-[10px] uppercase tracking-[0.3em] text-off-white/40 hover:text-off-white transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-gold hover:bg-gold-light hover:scale-[1.02] active:scale-[0.98] transition-all text-navy-deep px-12 py-5 rounded-full font-bold text-[10px] uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(212,175,55,0.2)] disabled:opacity-50"
                        >
                            {isLoading ? 'Salvando...' : (id ? 'Atualizar Prêmio' : 'Cadastrar Prêmio')}
                        </button>
                    </div>
                </form>
            </GlassCard>
        </div>
    );
};

export default AwardRegistrationPage;
