import React, { useEffect, useState } from 'react';
import GlassCard from '../../components/ui/GlassCard';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/supabase';
import ConfirmModal from '../../components/ui/ConfirmModal';

type HomeMedia = Database['public']['Tables']['home_media']['Row'];

const HomeMediaAdminPage: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [formData, setFormData] = useState<Partial<HomeMedia>>({
        headline: '',
        description: '',
        image_url: '',
        video_url: '',
        is_active: true
    });

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ title: 'Aviso', message: '', type: 'warning' as 'warning' | 'danger' | 'info' });

    useEffect(() => {
        fetchHomeMedia();
    }, []);

    const showAlert = (message: string, title = 'Aviso', type: 'warning' | 'danger' | 'info' = 'warning') => {
        setAlertConfig({ title, message, type });
        setIsAlertModalOpen(true);
    };

    const fetchHomeMedia = async () => {
        const { data, error } = await supabase
            .from('home_media')
            .select('*')
            .eq('is_active', true)
            .maybeSingle();

        if (error) {
            console.error('Error fetching home media:', error);
        } else if (data) {
            setFormData(data);
            if (data.image_url) setImagePreview(data.image_url);
            if (data.video_url) setVideoPreview(data.video_url);
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

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 100 * 1024 * 1024) { // 100MB limit
                showAlert('O vídeo deve ter no máximo 100MB', 'Arquivo muito grande');
                return;
            }
            setVideoFile(file);
            setVideoPreview(URL.createObjectURL(file));
            // Limpar o campo de URL se estiver fazendo upload
            setFormData(prev => ({ ...prev, video_url: '' }));
        }
    };

    const uploadFile = async (file: File, bucket: string) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return data.publicUrl;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setUploadProgress(0);

        try {
            let finalImageUrl = formData.image_url;
            let finalVideoUrl = formData.video_url;

            if (imageFile) {
                finalImageUrl = await uploadFile(imageFile, 'home_media');
            }

            if (videoFile) {
                setUploadProgress(10);
                finalVideoUrl = await uploadFile(videoFile, 'home_media');
                setUploadProgress(100);
            }

            const payload = {
                headline: formData.headline!,
                description: formData.description,
                image_url: finalImageUrl,
                video_url: finalVideoUrl,
                is_active: true
            };

            if (formData.id) {
                const { error } = await supabase
                    .from('home_media')
                    .update(payload)
                    .eq('id', formData.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('home_media')
                    .insert([payload]);
                if (error) throw error;
            }

            showAlert('Configuração salva com sucesso!', 'Sucesso', 'info');
            fetchHomeMedia();
            setImageFile(null);
            setVideoFile(null);
        } catch (error: any) {
            showAlert('Erro ao salvar configuração: ' + error.message, 'Erro', 'danger');
        } finally {
            setIsLoading(false);
            setUploadProgress(0);
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
                    <span className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] block">Identidade Visual</span>
                    <h2 className="text-5xl font-bold font-serif text-off-white italic">Mídia da <span className="text-gold-gradient">Home</span></h2>
                    <p className="text-off-white/40 max-w-2xl text-lg font-light italic">
                        Configure o conteúdo de destaque exibido na página inicial pública.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-10">
                        <GlassCard className="p-10 rounded-[3rem] border-white/5 space-y-10 bg-gradient-to-br from-white/[0.02] to-transparent">
                            <div className="space-y-4">
                                <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-off-white/30 ml-2">Headline Institucional</label>
                                <input
                                    required
                                    className="w-full bg-white/[0.03] border border-white/10 px-6 py-5 rounded-2xl text-off-white focus:border-gold/50 outline-none transition-all placeholder:text-off-white/10 text-xl font-serif italic"
                                    placeholder="Ex: Premiações Ser Educacional"
                                    value={formData.headline}
                                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-off-white/30 ml-2">Texto Curto Explicativo</label>
                                <textarea
                                    rows={4}
                                    className="w-full bg-white/[0.03] border border-white/10 px-6 py-5 rounded-2xl text-off-white focus:border-gold/50 outline-none transition-all placeholder:text-off-white/10 resize-none"
                                    placeholder="Uma breve introdução sobre a plataforma..."
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-off-white/30 ml-2">Vídeo de Apresentação</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* URL Input */}
                                    <div className="space-y-4">
                                        <label className="block text-[8px] font-bold uppercase tracking-widest text-off-white/20 ml-2">Link do YouTube ou Direto</label>
                                        <div className="relative group">
                                            <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-off-white/20 group-focus-within:text-gold transition-colors">link</span>
                                            <input
                                                className="w-full bg-white/[0.03] border border-white/10 pl-16 pr-8 py-5 rounded-2xl text-off-white focus:border-gold/50 outline-none transition-all placeholder:text-off-white/10"
                                                placeholder="https://youtube.com/watch?v=..."
                                                value={formData.video_url || ''}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, video_url: e.target.value });
                                                    setVideoFile(null);
                                                    setVideoPreview(null);
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* File Upload */}
                                    <div className="space-y-4">
                                        <label className="block text-[8px] font-bold uppercase tracking-widest text-off-white/20 ml-2">Ou Upload de Arquivo</label>
                                        <div className="relative group/video-container">
                                            <div
                                                className="relative border-2 border-dashed border-white/10 rounded-2xl p-5 hover:border-gold/30 transition-all cursor-pointer bg-white/[0.02] flex items-center gap-4"
                                                onClick={() => document.getElementById('home-video-upload')?.click()}
                                            >
                                                <span className="material-symbols-outlined text-2xl text-off-white/20 group-hover:text-gold transition-colors">videocam</span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-[10px] font-bold text-off-white/40 uppercase tracking-widest truncate">
                                                        {videoFile ? videoFile.name : (videoPreview && !formData.video_url ? 'Vídeo atual (Upload)' : 'Selecionar vídeo...')}
                                                    </p>
                                                    <p className="text-[8px] text-off-white/20 uppercase tracking-tighter">MP4, WebM (Máx 100MB)</p>
                                                </div>
                                                <input
                                                    id="home-video-upload"
                                                    type="file"
                                                    accept="video/*"
                                                    className="hidden"
                                                    onChange={handleVideoChange}
                                                />
                                            </div>
                                            {(videoFile || (videoPreview && !formData.video_url)) && (
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setVideoFile(null);
                                                        setVideoPreview(null);
                                                        setFormData(prev => ({ ...prev, video_url: '' }));
                                                    }}
                                                    className="absolute -top-2 -right-2 size-8 rounded-full bg-red-500/80 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-600 transition-colors shadow-lg z-10"
                                                    title="Remover vídeo"
                                                >
                                                    <span className="material-symbols-outlined text-sm">close</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {uploadProgress > 0 && uploadProgress < 100 && (
                                    <div className="mt-4 px-2">
                                        <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest text-off-white/40 mb-2">
                                            <span>Enviando vídeo...</span>
                                            <span>{Math.round(uploadProgress)}%</span>
                                        </div>
                                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gold transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </GlassCard>
                    </div>

                    <div className="space-y-10">
                        <GlassCard className="p-10 rounded-[3rem] border-white/5 space-y-8 bg-gradient-to-br from-white/[0.02] to-transparent">
                            <label className="block text-[10px] font-bold uppercase tracking-[0.3em] text-off-white/30 ml-2 text-center">Imagem de Destaque</label>
                            <div
                                className="relative aspect-[4/5] rounded-[2rem] bg-white/[0.03] border-2 border-dashed border-white/10 flex flex-col items-center justify-center overflow-hidden group hover:border-gold/30 transition-all cursor-pointer"
                                onClick={() => document.getElementById('home-image-upload')?.click()}
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
                                        <span className="material-symbols-outlined text-4xl text-white/10 mb-4">image</span>
                                        <p className="text-[10px] font-bold text-off-white/20 uppercase tracking-widest leading-relaxed">
                                            Upload da Imagem<br />Principal
                                        </p>
                                    </div>
                                )}
                                <input
                                    id="home-image-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </div>
                            <p className="text-[9px] text-off-white/20 text-center uppercase tracking-tighter">
                                Recomendado: 1200x1500px (Proporção 4:5)
                            </p>
                        </GlassCard>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gold hover:bg-gold-light hover:scale-[1.02] active:scale-[0.98] transition-all text-navy-deep py-6 rounded-full font-bold text-[11px] uppercase tracking-[0.4em] shadow-[0_30px_60px_rgba(212,175,55,0.2)] disabled:opacity-50"
                        >
                            {isLoading ? 'Salvando...' : 'Publicar Alterações'}
                        </button>
                    </div>
                </div>
            </form>

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

export default HomeMediaAdminPage;
