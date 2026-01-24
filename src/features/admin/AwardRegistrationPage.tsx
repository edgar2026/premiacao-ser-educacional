import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GlassCard from '../../components/ui/GlassCard';
import { supabase } from '../../lib/supabase';
import ConfirmModal from '../../components/ui/ConfirmModal';

const AwardRegistrationPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(!!id);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image_url: ''
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ title: 'Aviso', message: '', type: 'warning' as 'warning' | 'danger' | 'info' });

    useEffect(() => {
        if (id) {
            fetchAward();
        }
    }, [id]);

    const showAlert = (message: string, title = 'Aviso', type: 'warning' | 'danger' | 'info' = 'warning') => {
        setAlertConfig({ title, message, type });
        setIsAlertModalOpen(true);
    };

    const fetchAward = async () => {
        const { data, error } = await supabase
            .from('awards')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching award:', error);
            showAlert('Erro ao carregar prêmio', 'Erro', 'danger');
            setTimeout(() => navigate('/admin/premios'), 2000);
        } else {
            setFormData({
                name: data.name,
                description: data.description || '',
                image_url: data.image_url || ''
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
                image_url: finalImageUrl
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
            showAlert('Erro ao salvar prêmio: ' + error.message, 'Erro', 'danger');
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
        <div className="space-y-12 animate-fade-in pb-20 px-6 md:px-10 lg:px-16 pt-20 lg:pt-8">
            <div className="flex flex-wrap justify-between items-end gap-8 mb-16">
                <div className="space-y-4">
                    <button
                        onClick={() => navigate('/admin/premios')}
                        className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-2 hover:opacity-70 transition-opacity mb-4"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Voltar para lista
                    </button>
                    <span className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] block">Gestão de Honrarias</span>
                    <h2 className="text-5xl font-bold font-serif text-off-white italic">
                        {id ? 'Editar' : 'Novo'} <span className="text-gold-gradient">Prêmio</span>
                    </h2>
                </div>
            </div>

            <GlassCard className="p-10 rounded-[3rem] border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
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

            <ConfirmModal
                isOpen={isAlertModalOpen}
                onClose={() => setIsAlertModalOpen(false)}
                onConfirm={() => setIsAlertModalOpen(false)}
                title={alertConfig.title}
                message={alertConfig.message}
                confirmLabel="OK"
                type={alertConfig.type}
            />
        </div>
    );
};

export default AwardRegistrationPage;
