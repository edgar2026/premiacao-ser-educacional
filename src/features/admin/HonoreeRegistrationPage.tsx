import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import GlassCard from '../../components/ui/GlassCard';
import StepIndicator from '../../components/ui/StepIndicator';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/supabase';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';

type Award = Database['public']['Tables']['awards']['Row'];
type Unit = Database['public']['Tables']['units']['Row'];

interface HonoreeRegistrationPageProps {
    isEdit?: boolean;
}

const HonoreeRegistrationPage: React.FC<HonoreeRegistrationPageProps> = ({ isEdit: propIsEdit }) => {
    const { id, step } = useParams();
    const isEdit = propIsEdit || !!id;
    const navigate = useNavigate();
    const currentStep = step ? parseInt(step) - 1 : 0;
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(!!id);
    const [awards, setAwards] = useState<Award[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);

    const [formData, setFormData] = useState({
        type: 'interno' as 'interno' | 'externo',
        name: '',
        email: '',
        unit: '',
        registration_id: '',
        role: '',
        years_at_company: '',
        institution: '',
        external_role: '',
        biography: '',
        award_id: '',
        is_published: false,
        photo_url: '',
        video_url: '',
        stats: {
            yearsOfService: '0',
            totalAwards: '0',
            projectsLed: '0',
            units: '0'
        },
        timeline: [] as { id: string; semester: string; title: string; category: string }[],
        initiatives: '',
        recognitions: ''
    });

    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Cropper State
    const [isCropping, setIsCropping] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [tempPhotoUrl, setTempPhotoUrl] = useState<string | null>(null);

    useEffect(() => {
        fetchAwards();
        fetchUnits();
        if (id) {
            fetchHonoree();
        }
    }, [id]);

    useEffect(() => {
        if (!step || isNaN(parseInt(step)) || parseInt(step) < 1 || parseInt(step) > 5) {
            const basePath = id ? `/admin/homenageados/${id}/editar` : '/admin/homenageados/novo';
            navigate(`${basePath}/1`, { replace: true });
        }
    }, [step, id, navigate]);

    const fetchAwards = async () => {
        const { data } = await supabase.from('awards').select('*').order('name');
        setAwards(data || []);
    };

    const fetchUnits = async () => {
        const { data } = await supabase.from('units').select('*').order('name');
        setUnits(data || []);
    };

    const fetchHonoree = async () => {
        const { data, error } = await supabase
            .from('honorees')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching honoree:', error);
            navigate('/admin/homenageados');
        } else {
            const profData = data.professional_data ? JSON.parse(data.professional_data) : {};
            const stats = (data.stats as any) || {
                yearsOfService: '0',
                totalAwards: '0',
                projectsLed: '0',
                units: '0'
            };
            const timeline = (data.timeline as any[]) || [];

            setFormData({
                type: data.type as 'interno' | 'externo',
                name: profData.name || '',
                email: profData.email || '',
                unit: profData.unit || '',
                registration_id: profData.registration_id || '',
                role: profData.role || '',
                years_at_company: profData.years_at_company || '',
                institution: profData.institution || '',
                external_role: profData.external_role || '',
                biography: data.biography || '',
                award_id: data.award_id || '',
                is_published: data.is_published || false,
                photo_url: data.photo_url || '',
                video_url: data.video_url || '',
                stats,
                timeline,
                initiatives: data.initiatives || '',
                recognitions: data.recognitions || ''
            });
            if (data.photo_url) setPhotoPreview(data.photo_url);
        }
        setIsFetching(false);
    };


    const uploadPhoto = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('honorees')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('honorees')
            .getPublicUrl(filePath);

        return data.publicUrl;
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setTempPhotoUrl(reader.result as string);
                setIsCropping(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const onCropComplete = (_: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const handleCropSave = async () => {
        if (tempPhotoUrl && croppedAreaPixels) {
            const croppedImageBlob = await getCroppedImg(tempPhotoUrl, croppedAreaPixels);
            if (croppedImageBlob) {
                const croppedFile = new File([croppedImageBlob], 'honoree-photo.jpg', { type: 'image/jpeg' });
                setPhotoFile(croppedFile);
                setPhotoPreview(URL.createObjectURL(croppedImageBlob));
                setIsCropping(false);
                setTempPhotoUrl(null);
            }
        }
    };

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 100 * 1024 * 1024) { // 100MB limit
                alert('O vídeo deve ter no máximo 100MB');
                return;
            }
            setVideoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setVideoPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);

        try {
            let finalPhotoUrl = formData.photo_url;
            let finalVideoUrl = formData.video_url;

            if (photoFile) {
                finalPhotoUrl = await uploadPhoto(photoFile);
            }

            if (videoFile) {
                const fileExt = videoFile.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `videos/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('honorees')
                    .upload(filePath, videoFile);

                if (uploadError) throw uploadError;

                const { data } = supabase.storage
                    .from('honorees')
                    .getPublicUrl(filePath);

                finalVideoUrl = data.publicUrl;
                setUploadProgress(100);
            }

            const professional_data = JSON.stringify({
                name: formData.name,
                email: formData.email,
                unit: formData.unit,
                registration_id: formData.registration_id,
                role: formData.role,
                years_at_company: formData.years_at_company,
                institution: formData.institution,
                external_role: formData.external_role
            });

            const payload = {
                type: formData.type,
                professional_data,
                biography: formData.biography,
                photo_url: finalPhotoUrl,
                video_url: finalVideoUrl,
                award_id: formData.award_id || null,
                is_published: formData.is_published,
                stats: formData.stats,
                timeline: formData.timeline,
                initiatives: formData.initiatives,
                recognitions: formData.recognitions
            };

            if (id) {
                const { error } = await supabase
                    .from('honorees')
                    .update(payload)
                    .eq('id', id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('honorees')
                    .insert([payload]);
                if (error) throw error;
            }

            navigate('/admin/homenageados');
        } catch (error: any) {
            console.error('Erro detalhado:', error);
            alert('Erro ao salvar homenageado: ' + (error.message || 'Erro desconhecido') + '\n\nVerifique se todos os campos obrigatórios estão preenchidos.');
        } finally {
            setIsLoading(false);
        }
    };

    const steps = [
        { title: 'Identificação', description: 'Dados básicos' },
        { title: 'Vínculo', description: 'Institucional' },
        { title: 'Biografia', description: 'História' },
        { title: 'Mídia', description: 'Foto e Vídeo' },
        { title: 'Currículo', description: 'Marcos e métricas' }
    ];

    const nextStep = () => {
        const next = Math.min(currentStep + 1, steps.length - 1);
        const basePath = id ? `/admin/homenageados/${id}/editar` : '/admin/homenageados/novo';
        navigate(`${basePath}/${next + 1}`);
        window.scrollTo(0, 0);
    };

    const prevStep = () => {
        const prev = Math.max(currentStep - 1, 0);
        const basePath = id ? `/admin/homenageados/${id}/editar` : '/admin/homenageados/novo';
        navigate(`${basePath}/${prev + 1}`);
        window.scrollTo(0, 0);
    };

    const addTimelineItem = () => {
        setFormData({
            ...formData,
            timeline: [
                ...formData.timeline,
                { id: Math.random().toString(36).substr(2, 9), semester: '', title: '', category: '' }
            ]
        });
    };

    const removeTimelineItem = (id: string) => {
        setFormData({
            ...formData,
            timeline: formData.timeline.filter(item => item.id !== id)
        });
    };

    const updateTimelineItem = (id: string, field: string, value: string) => {
        setFormData({
            ...formData,
            timeline: formData.timeline.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
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
        <div className="p-10 max-w-6xl mx-auto space-y-12 animate-fade-in">
            <div className="flex justify-between items-start">
                <div className="space-y-4">
                    <button
                        onClick={() => navigate('/admin/homenageados')}
                        className="flex items-center gap-2 text-gold text-[10px] font-bold uppercase tracking-[0.2em] hover:opacity-70 transition-opacity"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Voltar para listagem
                    </button>
                    <h2 className="text-5xl font-bold font-serif text-off-white italic">
                        {isEdit ? 'Editar' : 'Novo'} <span className="text-gold-gradient">Homenageado</span>
                    </h2>
                </div>
            </div>

            <StepIndicator steps={steps} currentStep={currentStep} />

            <GlassCard className="p-12 rounded-[3rem] border-white/10 shadow-2xl">
                <div className="min-h-[400px]">
                    {(() => {
                        switch (currentStep) {
                            case 0:
                                return (
                                    <div className="space-y-10 animate-slide-up">
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-serif italic text-off-white">Identificação Básica</h3>
                                            <p className="text-off-white/40 text-sm">Comece definindo o tipo de público e os dados de contato.</p>
                                        </div>

                                        <div className="flex p-1 bg-white/5 rounded-2xl w-fit mb-10">
                                            <button
                                                onClick={() => setFormData({ ...formData, type: 'interno' })}
                                                className={`px-10 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${formData.type === 'interno' ? 'bg-gold text-navy-deep shadow-lg' : 'text-off-white/40 hover:text-off-white'}`}
                                            >
                                                Público Interno
                                            </button>
                                            <button
                                                onClick={() => setFormData({ ...formData, type: 'externo' })}
                                                className={`px-10 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${formData.type === 'externo' ? 'bg-gold text-navy-deep shadow-lg' : 'text-off-white/40 hover:text-off-white'}`}
                                            >
                                                Público Externo
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="space-y-4">
                                                <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-off-white/30">Nome Completo</label>
                                                <input
                                                    className="w-full bg-white/[0.03] border border-white/10 py-5 px-8 rounded-2xl text-off-white focus:border-gold/50 outline-none transition-all text-lg font-serif italic"
                                                    placeholder="Ex: Dr. Roberto Santos"
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-off-white/30">E-mail de Contato</label>
                                                <input
                                                    className="w-full bg-white/[0.03] border border-white/10 py-5 px-8 rounded-2xl text-off-white focus:border-gold/50 outline-none transition-all text-lg"
                                                    placeholder="roberto.santos@exemplo.com"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            case 1:
                                return (
                                    <div className="space-y-10 animate-slide-up">
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-serif italic text-off-white">Vínculo Institucional</h3>
                                            <p className="text-off-white/40 text-sm">Especifique a relação do homenageado com o grupo.</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="space-y-4">
                                                <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-off-white/30">Prêmio Vinculado</label>
                                                <select
                                                    className="w-full bg-white/[0.03] border border-white/10 py-5 px-8 rounded-2xl text-off-white outline-none focus:border-gold/50 transition-all appearance-none cursor-pointer text-lg"
                                                    value={formData.award_id}
                                                    onChange={(e) => setFormData({ ...formData, award_id: e.target.value })}
                                                >
                                                    <option value="" className="bg-navy-deep">Selecione um prêmio...</option>
                                                    {awards.map(a => (
                                                        <option key={a.id} value={a.id} className="bg-navy-deep">{a.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {formData.type === 'interno' ? (
                                                <>
                                                    <div className="space-y-4">
                                                        <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-off-white/30">Unidade / Campus</label>
                                                        <select
                                                            className="w-full bg-white/[0.03] border border-white/10 py-5 px-8 rounded-2xl text-off-white outline-none focus:border-gold/50 transition-all appearance-none cursor-pointer text-lg"
                                                            value={formData.unit}
                                                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                                        >
                                                            <option value="" className="bg-navy-deep">Selecione uma unidade...</option>
                                                            {units.map(u => (
                                                                <option key={u.id} value={u.name} className="bg-navy-deep">{u.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-off-white/30">Matrícula / ID</label>
                                                        <input
                                                            className="w-full bg-white/[0.03] border border-white/10 py-5 px-8 rounded-2xl text-off-white focus:border-gold/50 outline-none transition-all text-lg tracking-widest"
                                                            placeholder="000000"
                                                            type="text"
                                                            value={formData.registration_id}
                                                            onChange={(e) => setFormData({ ...formData, registration_id: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-off-white/30">Cargo Atual</label>
                                                        <input
                                                            className="w-full bg-white/[0.03] border border-white/10 py-5 px-8 rounded-2xl text-off-white focus:border-gold/50 outline-none transition-all text-lg italic"
                                                            placeholder="Ex: Coordenador Acadêmico"
                                                            type="text"
                                                            value={formData.role}
                                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-off-white/30">Tempo de Casa (Anos)</label>
                                                        <input
                                                            className="w-full bg-white/[0.03] border border-white/10 py-5 px-8 rounded-2xl text-off-white focus:border-gold/50 outline-none transition-all text-lg"
                                                            placeholder="Ex: 5"
                                                            type="number"
                                                            value={formData.years_at_company}
                                                            onChange={(e) => setFormData({ ...formData, years_at_company: e.target.value })}
                                                        />
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="space-y-4">
                                                        <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-off-white/30">Instituição / Empresa</label>
                                                        <input
                                                            className="w-full bg-white/[0.03] border border-white/10 py-5 px-8 rounded-2xl text-off-white focus:border-gold/50 outline-none transition-all text-lg font-serif italic"
                                                            placeholder="Nome da organização"
                                                            type="text"
                                                            value={formData.institution}
                                                            onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                                                        />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-off-white/30">Cargo / Título Externo</label>
                                                        <input
                                                            className="w-full bg-white/[0.03] border border-white/10 py-5 px-8 rounded-2xl text-off-white focus:border-gold/50 outline-none transition-all text-lg italic"
                                                            placeholder="Ex: CEO / Diretor Executivo"
                                                            type="text"
                                                            value={formData.external_role}
                                                            onChange={(e) => setFormData({ ...formData, external_role: e.target.value })}
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            case 2:
                                return (
                                    <div className="space-y-10 animate-slide-up">
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-serif italic text-off-white">Biografia</h3>
                                            <p className="text-off-white/40 text-sm">Conte a história e as conquistas do homenageado.</p>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-off-white/30">Biografia / Histórico de Conquistas</label>
                                            <div className="quill-container">
                                                <ReactQuill
                                                    theme="snow"
                                                    value={formData.biography || ''}
                                                    onChange={(content) => setFormData({ ...formData, biography: content })}
                                                    className="bg-white/[0.03] border border-white/10 rounded-3xl text-off-white overflow-hidden"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            case 3:
                                return (
                                    <div className="space-y-10 animate-slide-up">
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-serif italic text-off-white">Mídia & Visibilidade</h3>
                                            <p className="text-off-white/40 text-sm">Adicione uma foto oficial e um vídeo de homenagem.</p>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                            <div className="lg:col-span-2 space-y-8">
                                                <div className="space-y-4">
                                                    <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-off-white/30">Vídeo de Homenagem (Upload)</label>
                                                    <div
                                                        className="border-2 border-dashed border-white/10 rounded-2xl p-8 hover:border-gold/30 transition-all cursor-pointer group bg-white/[0.02] overflow-hidden relative"
                                                        onClick={() => document.getElementById('video-upload')?.click()}
                                                    >
                                                        {videoPreview ? (
                                                            <div className="relative">
                                                                <video src={videoPreview} className="w-full rounded-xl" controls />
                                                                <div className="mt-4 text-center">
                                                                    <span className="text-gold font-bold text-xs uppercase tracking-widest">Clique para alterar</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="text-center">
                                                                <span className="material-symbols-outlined text-5xl text-off-white/10 group-hover:text-gold transition-colors mb-4 block">videocam</span>
                                                                <p className="text-xs font-bold text-off-white/30 uppercase tracking-widest">
                                                                    Upload de vídeo<br />MP4, WebM ou MOV (máx. 100MB)
                                                                </p>
                                                            </div>
                                                        )}
                                                        <input
                                                            id="video-upload"
                                                            type="file"
                                                            accept="video/mp4,video/webm,video/quicktime"
                                                            className="hidden"
                                                            onChange={handleVideoChange}
                                                        />
                                                    </div>
                                                    {uploadProgress > 0 && uploadProgress < 100 && (
                                                        <div className="mt-4">
                                                            <div className="flex justify-between text-xs text-off-white/40 mb-2">
                                                                <span>Enviando vídeo...</span>
                                                                <span>{Math.round(uploadProgress)}%</span>
                                                            </div>
                                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-gold transition-all duration-300"
                                                                    style={{ width: `${uploadProgress}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-4 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                                    <label className="flex items-center gap-4 cursor-pointer group">
                                                        <input
                                                            type="checkbox"
                                                            className="size-6 rounded-lg bg-white/5 border-white/10 text-gold focus:ring-gold/20 transition-all"
                                                            checked={formData.is_published}
                                                            onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                                                        />
                                                        <div className="flex flex-col">
                                                            <span className="text-xs font-bold uppercase tracking-widest text-off-white group-hover:text-gold transition-colors">Publicar Imediatamente</span>
                                                            <span className="text-[10px] text-off-white/20 uppercase tracking-tighter">O perfil ficará visível na galeria pública</span>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-off-white/30 text-center">Foto de Perfil (Premium)</label>
                                                <div
                                                    className="aspect-[4/5] border-2 border-dashed border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center hover:border-gold/30 transition-all cursor-pointer group bg-white/[0.02] overflow-hidden relative"
                                                    onClick={() => document.getElementById('photo-upload')?.click()}
                                                >
                                                    {photoPreview ? (
                                                        <>
                                                            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-navy-deep/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <span className="text-gold font-bold text-[10px] uppercase tracking-widest">Alterar Foto</span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="text-center p-8">
                                                            <span className="material-symbols-outlined text-5xl text-off-white/10 group-hover:text-gold transition-colors mb-4">add_a_photo</span>
                                                            <p className="text-[10px] font-bold text-off-white/30 uppercase tracking-widest text-center leading-relaxed">
                                                                Upload de imagem<br />em alta resolução
                                                            </p>
                                                        </div>
                                                    )}
                                                    <input
                                                        id="photo-upload"
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handlePhotoChange}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            case 4:
                                return (
                                    <div className="space-y-12 animate-slide-up">
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-serif italic text-off-white">Currículo & Métricas</h3>
                                            <p className="text-off-white/40 text-sm">Dados de impacto e linha do tempo histórica.</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                            {[
                                                { label: 'Anos de Dedicação', key: 'yearsOfService' },
                                                { label: 'Láureas Recebidas', key: 'totalAwards' },
                                                { label: 'Projetos de Impacto', key: 'projectsLed' },
                                                { label: 'Unidades Lideradas', key: 'units' }
                                            ].map((stat) => (
                                                <div key={stat.key} className="space-y-3">
                                                    <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-off-white/30 ml-2">{stat.label}</label>
                                                    <input
                                                        className="w-full bg-white/[0.03] border border-white/10 py-4 px-6 rounded-xl text-off-white focus:border-gold/50 outline-none transition-all text-center text-2xl font-serif italic"
                                                        type="number"
                                                        value={formData.stats ? (formData.stats as any)[stat.key] : '0'}
                                                        onChange={(e) => setFormData({
                                                            ...formData,
                                                            stats: { ...formData.stats, [stat.key]: e.target.value }
                                                        })}
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center">
                                                <h4 className="text-xl font-serif italic text-off-white">Linha do Tempo (Marcos)</h4>
                                                <button
                                                    onClick={addTimelineItem}
                                                    className="flex items-center gap-2 text-gold text-[10px] font-bold uppercase tracking-widest hover:opacity-70 transition-opacity"
                                                >
                                                    <span className="material-symbols-outlined text-sm">add_circle</span>
                                                    Adicionar Marco
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                {formData.timeline.map((item) => (
                                                    <div key={item.id} className="flex gap-4 items-end bg-white/[0.02] p-6 rounded-2xl border border-white/5 group">
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                                                            <div className="space-y-2">
                                                                <label className="block text-[8px] font-bold uppercase tracking-widest text-off-white/20">Ano/Semestre</label>
                                                                <input
                                                                    className="w-full bg-white/5 border border-white/10 py-3 px-4 rounded-lg text-off-white text-sm outline-none focus:border-gold/30"
                                                                    placeholder="Ex: 2023.2"
                                                                    value={item.semester}
                                                                    onChange={(e) => updateTimelineItem(item.id, 'semester', e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="block text-[8px] font-bold uppercase tracking-widest text-off-white/20">Título do Marco</label>
                                                                <input
                                                                    className="w-full bg-white/5 border border-white/10 py-3 px-4 rounded-lg text-off-white text-sm outline-none focus:border-gold/30"
                                                                    placeholder="Ex: Prêmio de Excelência"
                                                                    value={item.title}
                                                                    onChange={(e) => updateTimelineItem(item.id, 'title', e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="block text-[8px] font-bold uppercase tracking-widest text-off-white/20">Categoria</label>
                                                                <input
                                                                    className="w-full bg-white/5 border border-white/10 py-3 px-4 rounded-lg text-off-white text-sm outline-none focus:border-gold/30"
                                                                    placeholder="Ex: Liderança Executiva"
                                                                    value={item.category}
                                                                    onChange={(e) => updateTimelineItem(item.id, 'category', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => removeTimelineItem(item.id)}
                                                            className="p-3 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">delete</span>
                                                        </button>
                                                    </div>
                                                ))}
                                                {formData.timeline.length === 0 && (
                                                    <div className="py-10 text-center border-2 border-dashed border-white/5 rounded-2xl">
                                                        <p className="text-off-white/20 text-sm italic">Nenhum marco histórico adicionado.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="space-y-4">
                                                <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-off-white/30 ml-2">Aba: Iniciativas</label>
                                                <div className="quill-container">
                                                    <ReactQuill
                                                        theme="snow"
                                                        value={formData.initiatives || ''}
                                                        onChange={(content) => setFormData({ ...formData, initiatives: content })}
                                                        className="bg-white/[0.03] border border-white/10 rounded-2xl text-off-white overflow-hidden"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="block text-[9px] font-bold uppercase tracking-[0.3em] text-off-white/30 ml-2">Aba: Reconhecimentos</label>
                                                <div className="quill-container">
                                                    <ReactQuill
                                                        theme="snow"
                                                        value={formData.recognitions || ''}
                                                        onChange={(content) => setFormData({ ...formData, recognitions: content })}
                                                        className="bg-white/[0.03] border border-white/10 rounded-2xl text-off-white overflow-hidden"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            default:
                                return null;
                        }
                    })()}
                </div>

                <div className="mt-16 pt-10 border-t border-white/5 flex justify-between items-center">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 0}
                        className={`text-[10px] font-bold uppercase tracking-[0.3em] transition-all flex items-center gap-2 ${currentStep === 0 ? 'text-off-white/10 cursor-not-allowed' : 'text-off-white/40 hover:text-off-white'}`}
                    >
                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                        Anterior
                    </button>

                    <div className="flex gap-6">
                        <button
                            onClick={() => navigate('/admin/homenageados')}
                            className="text-[10px] font-bold uppercase tracking-[0.3em] text-off-white/20 hover:text-red-400 transition-colors"
                        >
                            Cancelar
                        </button>

                        {currentStep < steps.length - 1 ? (
                            <button
                                onClick={nextStep}
                                className="px-12 py-5 bg-white/5 hover:bg-white/10 text-gold rounded-full font-bold text-[10px] uppercase tracking-[0.3em] border border-gold/30 transition-all flex items-center gap-2"
                            >
                                Próximo Passo
                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={isLoading}
                                className="px-12 py-5 bg-gold text-navy-deep rounded-full font-bold text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-gold/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {isLoading ? 'Salvando...' : (isEdit ? 'Atualizar Cadastro' : 'Finalizar Cadastro')}
                            </button>
                        )}
                    </div>
                </div>
            </GlassCard>

            {/* Image Cropper Modal */}
            {isCropping && tempPhotoUrl && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-deep/90 backdrop-blur-xl animate-fade-in">
                    <div className="w-full max-w-4xl h-[80vh] flex flex-col glass-card rounded-[3rem] border-white/10 overflow-hidden shadow-2xl">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-serif italic text-off-white">Ajustar Fotografia</h3>
                                <p className="text-off-white/40 text-xs uppercase tracking-widest mt-1">Enquadre o rosto para garantir o padrão premium</p>
                            </div>
                            <button
                                onClick={() => setIsCropping(false)}
                                className="size-10 rounded-full bg-white/5 flex items-center justify-center text-off-white/40 hover:text-red-400 transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="flex-1 relative bg-black/20">
                            <Cropper
                                image={tempPhotoUrl}
                                crop={crop}
                                zoom={zoom}
                                aspect={4 / 5}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        </div>

                        <div className="p-10 border-t border-white/5 space-y-8 bg-navy-deep/50">
                            <div className="space-y-4">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-gold/50">
                                    <span>Zoom</span>
                                    <span>{Math.round(zoom * 100)}%</span>
                                </div>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    aria-labelledby="Zoom"
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full accent-gold bg-white/5 h-1 rounded-full appearance-none cursor-pointer"
                                />
                            </div>

                            <div className="flex justify-end gap-6">
                                <button
                                    onClick={() => setIsCropping(false)}
                                    className="px-10 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-off-white/40 hover:text-off-white transition-colors"
                                >
                                    Descartar
                                </button>
                                <button
                                    onClick={handleCropSave}
                                    className="px-12 py-4 bg-gold text-navy-deep rounded-full font-bold text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-gold/20 hover:scale-105 transition-all"
                                >
                                    Confirmar Ajuste
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .quill-container .ql-toolbar {
                    background: rgba(255, 255, 255, 0.05);
                    border: none !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
                    padding: 1rem !important;
                }
                .quill-container .ql-container {
                    border: none !important;
                    font-family: 'Inter', sans-serif !important;
                    font-size: 1rem !important;
                    min-height: 200px;
                }
                .quill-container .ql-editor {
                    color: rgba(255, 255, 255, 0.8) !important;
                    padding: 1.5rem !important;
                }
                .quill-container .ql-editor.ql-blank::before {
                    color: rgba(255, 255, 255, 0.1) !important;
                    font-style: italic !important;
                }
                .quill-container .ql-stroke {
                    stroke: rgba(255, 255, 255, 0.4) !important;
                }
                .quill-container .ql-fill {
                    fill: rgba(255, 255, 255, 0.4) !important;
                }
                .quill-container .ql-picker {
                    color: rgba(255, 255, 255, 0.4) !important;
                }
            `}</style>
        </div>
    );
};

export default HonoreeRegistrationPage;
