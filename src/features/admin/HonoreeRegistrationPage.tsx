import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import GlassCard from '../../components/ui/GlassCard';
import StepIndicator from '../../components/ui/StepIndicator';
import { supabase, createAuthClient } from '../../lib/supabase';
import type { Database } from '../../types/supabase';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useAuth } from '../auth/AuthContext';

type Award = Database['public']['Tables']['awards']['Row'];
type Unit = Database['public']['Tables']['units']['Row'];
type Regional = Database['public']['Tables']['regionals']['Row'];

interface HonoreeRegistrationPageProps {
    isEdit?: boolean;
}

const HonoreeRegistrationPage: React.FC<HonoreeRegistrationPageProps> = ({ isEdit: propIsEdit }) => {
    const { id, step } = useParams();
    const { profile, isAdmin } = useAuth();
    const isEdit = propIsEdit || !!id;
    const isDirector = profile?.role === 'diretor';
    const navigate = useNavigate();
    const currentStep = step ? parseInt(step) - 1 : 0;
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(!!id);
    const [awards, setAwards] = useState<Award[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
    const [regionals, setRegionals] = useState<Regional[]>([]);

    const bioQuillRef = useRef(null);
    const initQuillRef = useRef(null);
    const recQuillRef = useRef(null);

    // Cliente Autenticado para furar bloqueios de RLS invisível
    const dbClient = profile?.id ? createAuthClient(profile.id) : supabase;

    const [formData, setFormData] = useState({
        type: 'interno' as 'interno' | 'externo',
        name: '',
        email: '',
        unit: '',
        brand_id: '',
        unit_id: '',
        regional_id: '',
        awarded_at: new Date().toISOString().split('T')[0],
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
        recognitions: '',
        rejection_reason: '',
        status: 'rascunho' as 'rascunho' | 'em_analise' | 'aprovado' | 'reprovado' | 'publicado'
    });

    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [isCropping, setIsCropping] = useState(false);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [tempPhotoUrl, setTempPhotoUrl] = useState<string | null>(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ title: 'Aviso', message: '', type: 'warning' as 'warning' | 'danger' | 'info' });

    useEffect(() => {
        return () => {
            if (videoPreview && videoPreview.startsWith('blob:')) {
                URL.revokeObjectURL(videoPreview);
            }
            if (photoPreview && photoPreview.startsWith('blob:')) {
                URL.revokeObjectURL(photoPreview);
            }
        };
    }, [videoPreview, photoPreview]);

    useEffect(() => {
        fetchAwards();
        fetchBrands();
        fetchUnits();
        fetchRegionals();
    }, []);

    useEffect(() => {
        if (!id && isDirector && profile?.unit_id && units.length > 0) {
            const myUnit = units.find(u => u.id === profile.unit_id);
            setFormData(prev => ({
                ...prev,
                unit_id: profile.unit_id || '',
                brand_id: myUnit?.brand_id || profile.brand_id || '',
                regional_id: myUnit?.regional_id || profile.regional_id || ''
            }));
        } else if (id) {
            fetchHonoree();
        }
    }, [id, isDirector, profile, units.length]);

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

    const fetchBrands = async () => {
        const { data } = await supabase.from('brands').select('*').order('name');
        setBrands(data || []);
    };

    const fetchUnits = async () => {
        const { data } = await supabase.from('units').select('*').order('name');
        setUnits(data || []);
    };

    const fetchRegionals = async () => {
        const { data } = await supabase.from('regionals').select('*').order('name');
        setRegionals(data || []);
    };

    const fetchHonoree = async () => {
        const { data, error } = await dbClient
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
                brand_id: data.brand_id || '',
                unit_id: data.unit_id || '',
                regional_id: data.regional_id || '',
                awarded_at: data.awarded_at || new Date().toISOString().split('T')[0],
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
                recognitions: data.recognitions || '',
                status: (data.status as any) || 'rascunho',
                rejection_reason: data.rejection_reason || ''
            });
            if (data.photo_url) setPhotoPreview(data.photo_url);
            if (data.video_url) setVideoPreview(data.video_url);
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

    const showAlert = (message: string, title = 'Aviso', type: 'warning' | 'danger' | 'info' = 'warning') => {
        setAlertConfig({ title, message, type });
        setIsAlertModalOpen(true);
    };

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 100 * 1024 * 1024) { 
                showAlert('O vídeo deve ter no máximo 100MB', 'Arquivo muito grande');
                return;
            }
            setVideoFile(file);
            setVideoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (actionType: 'rascunho' | 'enviar' | 'atualizar' = 'atualizar') => {
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

            const isInterno = formData.type === 'interno';
            const missingName = !formData.name.trim();
            const missingAward = !formData.award_id;
            const missingInternals = isInterno && (!formData.unit_id);

            if (actionType !== 'rascunho' && (missingName || missingAward || missingInternals)) {
                showAlert(
                    "Existem campos obrigatórios em branco. Verifique Identificação e os vínculos obrigatórios institucionais.",
                    "Dados Incompletos",
                    "warning"
                );
                setIsLoading(false);
                return;
            }

            let finalStatus = formData.status;

            if (isDirector) {
                if (actionType === 'enviar') {
                    finalStatus = 'em_analise';
                } else if (actionType === 'rascunho') {
                    finalStatus = 'rascunho';
                } else if (actionType === 'atualizar') {
                    // Segurança adicional: Se um diretor editar um cadastro que de alguma forma estava Aprovado ou Publicado, volta pra Análise.
                    if (['reprovado', 'aprovado', 'publicado'].includes(formData.status)) {
                        finalStatus = 'em_analise';
                    }
                }
            } else if (isAdmin && !id) {
                finalStatus = formData.is_published ? 'publicado' : 'aprovado';
            }

            const payload = {
                type: formData.type,
                professional_data,
                biography: formData.biography,
                photo_url: finalPhotoUrl,
                video_url: finalVideoUrl,
                award_id: formData.award_id || null,
                brand_id: formData.brand_id || null,
                unit_id: formData.unit_id || null,
                regional_id: formData.regional_id || null,
                awarded_at: formData.awarded_at,
                timeline: formData.timeline,
                initiatives: formData.initiatives,
                recognitions: formData.recognitions,
                status: finalStatus,
                rejection_reason: isDirector ? formData.rejection_reason : formData.rejection_reason,
                is_published: isAdmin ? formData.is_published : (finalStatus === 'publicado'),
                stats: formData.stats,
                created_by: profile?.id
            };

            if (id) {
                const { error } = await dbClient
                    .from('honorees')
                    .update(payload)
                    .eq('id', id);
                if (error) throw error;
            } else {
                const { error } = await dbClient
                    .from('honorees')
                    .insert([payload]);
                if (error) throw error;
            }

            navigate('/admin/homenageados');
        } catch (error: any) {
            console.error('Erro detalhado:', error);
            showAlert(
                'Erro ao salvar homenageado: ' + (error.message || 'Erro desconhecido') + '\n\nVerifique se todos os campos obrigatórios estão preenchidos.',
                'Erro ao Salvar',
                'danger'
            );
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
        <div className="space-y-12 animate-fade-in pb-20 px-6 md:px-10 lg:px-16 pt-16">
            <div className="flex flex-wrap justify-between items-end gap-8 mb-12">
                <div className="space-y-4">
                    <button
                        onClick={() => navigate('/admin/homenageados')}
                        className="flex items-center gap-2 text-brand-blue text-[11px] font-[800] uppercase tracking-[0.2em] hover:opacity-70 transition-opacity mb-4"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Voltar para listagem
                    </button>
                    <span className="text-brand-blue text-[11px] font-[800] uppercase tracking-[0.4em] block">Gestão de Talentos</span>
                    <h2 className="text-[48px] font-[800] text-brand-dark tracking-tight leading-none">
                        {isEdit ? 'Editar' : 'Novo'} <span className="text-brand-blue">Homenageado</span>
                    </h2>
                </div>
            </div>

            {isDirector && (formData.status === 'reprovado') && (
                <div className="p-8 rounded-[2.5rem] bg-red-50 border border-red-100 animate-slide-up">
                    <div className="flex items-start gap-6">
                        <div className="size-14 rounded-2xl bg-red-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-red-200">
                            <span className="material-symbols-outlined">error</span>
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-lg font-[800] text-red-600 uppercase tracking-tight">Cadastro com Pendências</h4>
                            <p className="text-brand-dark font-medium italic opacity-80">
                                "{formData.rejection_reason || 'Nenhum motivo especificado.'}"
                            </p>
                            <p className="text-[11px] text-brand-text-secondary/60 font-[800] uppercase tracking-widest pt-2">
                                Por favor, realize as correções solicitadas e submeta novamente.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <StepIndicator steps={steps} currentStep={currentStep} />

            <div className="card-static p-10 rounded-[2.5rem] min-h-[600px]">
                <div className="min-h-[400px]">
                    {(() => {
                        switch (currentStep) {
                            case 0:
                                return (
                                    <div className="space-y-10 animate-slide-up">
                                        <div className="space-y-2">
                                            <h3 className="text-[28px] font-[800] text-brand-dark tracking-tight">Identificação Básica</h3>
                                            <p className="text-brand-text-secondary font-medium opacity-60">Comece definindo o tipo de público e os dados de contato.</p>
                                        </div>

                                        <div className="flex p-1.5 bg-bg-main border border-brand-gray rounded-2xl w-fit mb-10 shadow-sm">
                                            <button
                                                onClick={() => setFormData({ ...formData, type: 'interno' })}
                                                className={`px-10 py-4 rounded-xl text-[11px] font-[800] uppercase tracking-widest transition-all ${formData.type === 'interno' ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'text-brand-text-secondary/40 hover:text-brand-dark'}`}
                                            >
                                                Público Interno
                                            </button>
                                            <button
                                                onClick={() => setFormData({ ...formData, type: 'externo' })}
                                                className={`px-10 py-4 rounded-xl text-[11px] font-[800] uppercase tracking-widest transition-all ${formData.type === 'externo' ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/20' : 'text-brand-text-secondary/40 hover:text-brand-dark'}`}
                                            >
                                                Público Externo
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="space-y-3">
                                                <label className="block text-[11px] font-[800] uppercase tracking-[0.3em] text-brand-text-secondary/60 ml-2">Nome Completo</label>
                                                <input
                                                    className="w-full bg-bg-main border border-brand-gray py-5 px-8 rounded-2xl text-brand-dark focus:border-brand-blue/50 outline-none transition-all text-[18px] font-[800] tracking-tight"
                                                    placeholder="Ex: Dr. Roberto Santos"
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="block text-[11px] font-[800] uppercase tracking-[0.3em] text-brand-text-secondary/60 ml-2">E-mail de Contato</label>
                                                <input
                                                    className="w-full bg-bg-main border border-brand-gray py-5 px-8 rounded-2xl text-brand-dark focus:border-brand-blue/50 outline-none transition-all text-lg font-medium"
                                                    placeholder="roberto.santos@exemplo.com"
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="block text-[11px] font-[800] uppercase tracking-[0.3em] text-brand-text-secondary/60 ml-2">Data da Premiação</label>
                                                <input
                                                    required
                                                    className="w-full bg-bg-main border border-brand-gray py-5 px-8 rounded-2xl text-brand-dark focus:border-brand-blue/50 outline-none transition-all text-lg font-[800]"
                                                    type="date"
                                                    value={formData.awarded_at}
                                                    onChange={(e) => setFormData({ ...formData, awarded_at: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            case 1:
                                 return (
                                     <div className="space-y-10 animate-slide-up">
                                         <div className="space-y-2">
                                             <h3 className="text-[28px] font-[800] text-brand-dark tracking-tight">Vínculo Institucional</h3>
                                             <p className="text-brand-text-secondary font-medium opacity-60">Especifique a relação do homenageado com o grupo.</p>
                                         </div>

                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                             <div className="space-y-3">
                                                 <label className="block text-[11px] font-[800] uppercase tracking-[0.3em] text-brand-text-secondary/60 ml-2">Prêmio Vinculado</label>
                                                 <select
                                                     className="w-full bg-bg-main border border-brand-gray py-5 px-8 rounded-2xl text-brand-dark outline-none focus:border-brand-blue/50 transition-all cursor-pointer text-lg font-[800]"
                                                     value={formData.award_id}
                                                     onChange={(e) => setFormData({ ...formData, award_id: e.target.value })}
                                                 >
                                                     <option value="">Selecione um prêmio...</option>
                                                     {awards.map(a => (
                                                         <option key={a.id} value={a.id}>{a.name}</option>
                                                     ))}
                                                 </select>
                                             </div>

                                             {formData.type === 'interno' ? (
                                                 <>
                                                     <div className="space-y-3">
                                                         <label className="block text-[11px] font-[800] uppercase tracking-[0.3em] text-brand-text-secondary/60 ml-2">Marca Institucional</label>
                                                         <select
                                                             required
                                                             disabled={isDirector}
                                                             className="w-full bg-bg-main border border-brand-gray py-5 px-8 rounded-2xl text-brand-dark outline-none focus:border-brand-blue/50 transition-all cursor-pointer text-lg disabled:opacity-30 font-[800]"
                                                             value={formData.brand_id}
                                                             onChange={(e) => setFormData({ ...formData, brand_id: e.target.value, unit_id: '', unit: '' })}
                                                         >
                                                             <option value="">Selecione uma marca...</option>
                                                             {brands.map(b => (
                                                                 <option key={b.id} value={b.id}>{b.name}</option>
                                                             ))}
                                                         </select>
                                                     </div>
                                                     <div className="space-y-3">
                                                         <label className="block text-[11px] font-[800] uppercase tracking-[0.3em] text-brand-text-secondary/60 ml-2">Regional</label>
                                                         <select
                                                             disabled={isDirector}
                                                             className="w-full bg-bg-main border border-brand-gray py-5 px-8 rounded-2xl text-brand-dark outline-none focus:border-brand-blue/50 transition-all cursor-pointer text-lg disabled:opacity-30 font-[800]"
                                                             value={formData.regional_id}
                                                             onChange={(e) => setFormData({ ...formData, regional_id: e.target.value })}
                                                         >
                                                             <option value="">Selecione uma regional...</option>
                                                             {regionals.map(r => (
                                                                 <option key={r.id} value={r.id}>{r.name}</option>
                                                             ))}
                                                         </select>
                                                     </div>
                                                     <div className="space-y-3">
                                                         <label className="block text-[11px] font-[800] uppercase tracking-[0.3em] text-brand-text-secondary/60 ml-2">Unidade / Campus</label>
                                                         <select
                                                             required
                                                             disabled={!formData.brand_id || isDirector}
                                                             className="w-full bg-bg-main border border-brand-gray py-5 px-8 rounded-2xl text-brand-dark outline-none focus:border-brand-blue/50 transition-all cursor-pointer text-lg disabled:opacity-30 font-[800]"
                                                             value={formData.unit_id}
                                                             onChange={(e) => {
                                                                 const selectedUnit = units.find(u => u.id === e.target.value);
                                                                 setFormData({
                                                                     ...formData,
                                                                     unit_id: e.target.value,
                                                                     unit: selectedUnit?.name || '',
                                                                     brand_id: selectedUnit?.brand_id || formData.brand_id,
                                                                     regional_id: selectedUnit?.regional_id || formData.regional_id
                                                                 });
                                                             }}
                                                         >
                                                             <option value="">Selecione uma unidade...</option>
                                                             {units.filter(u => u.brand_id === formData.brand_id).map(u => (
                                                                 <option key={u.id} value={u.id}>{u.name}</option>
                                                             ))}
                                                         </select>
                                                     </div>
                                                     <div className="space-y-3">
                                                         <label className="block text-[11px] font-[800] uppercase tracking-[0.3em] text-brand-text-secondary/60 ml-2">Matrícula / ID</label>
                                                         <input
                                                             className="w-full bg-bg-main border border-brand-gray py-5 px-8 rounded-2xl text-brand-dark focus:border-brand-blue/50 outline-none transition-all text-lg tracking-widest font-medium"
                                                             placeholder="000000"
                                                             type="text"
                                                             value={formData.registration_id}
                                                             onChange={(e) => setFormData({ ...formData, registration_id: e.target.value })}
                                                         />
                                                     </div>
                                                     <div className="space-y-3">
                                                         <label className="block text-[11px] font-[800] uppercase tracking-[0.3em] text-brand-text-secondary/60 ml-2">Cargo Atual</label>
                                                         <input
                                                             className="w-full bg-bg-main border border-brand-gray py-5 px-8 rounded-2xl text-brand-dark focus:border-brand-blue/50 outline-none transition-all text-lg italic font-medium"
                                                             placeholder="Ex: Coordenador Acadêmico"
                                                             type="text"
                                                             value={formData.role}
                                                             onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                                         />
                                                     </div>
                                                     <div className="space-y-3">
                                                         <label className="block text-[11px] font-[800] uppercase tracking-[0.3em] text-brand-text-secondary/60 ml-2">Tempo de Casa (Anos)</label>
                                                         <input
                                                             className="w-full bg-bg-main border border-brand-gray py-5 px-8 rounded-2xl text-brand-dark focus:border-brand-blue/50 outline-none transition-all text-lg font-medium"
                                                             placeholder="Ex: 5"
                                                             type="number"
                                                             value={formData.years_at_company}
                                                             onChange={(e) => setFormData({ ...formData, years_at_company: e.target.value })}
                                                         />
                                                     </div>
                                                 </>
                                             ) : (
                                                 <>
                                                     <div className="space-y-3">
                                                         <label className="block text-[11px] font-[800] uppercase tracking-[0.3em] text-brand-text-secondary/60 ml-2">Marca Institucional</label>
                                                         <select
                                                             required
                                                             className="w-full bg-bg-main border border-brand-gray py-5 px-8 rounded-2xl text-brand-dark outline-none focus:border-brand-blue/50 transition-all cursor-pointer text-lg font-[800]"
                                                             value={formData.brand_id}
                                                             onChange={(e) => setFormData({ ...formData, brand_id: e.target.value, unit_id: '', unit: '' })}
                                                         >
                                                             <option value="">Selecione uma marca...</option>
                                                             {brands.map(b => (
                                                                 <option key={b.id} value={b.id}>{b.name}</option>
                                                             ))}
                                                         </select>
                                                     </div>
                                                     <div className="space-y-3">
                                                         <label className="block text-[11px] font-[800] uppercase tracking-[0.3em] text-brand-text-secondary/60 ml-2">Regional</label>
                                                         <select
                                                             className="w-full bg-bg-main border border-brand-gray py-5 px-8 rounded-2xl text-brand-dark outline-none focus:border-brand-blue/50 transition-all cursor-pointer text-lg font-[800]"
                                                             value={formData.regional_id}
                                                             onChange={(e) => setFormData({ ...formData, regional_id: e.target.value })}
                                                         >
                                                             <option value="">Selecione uma regional...</option>
                                                             {regionals.map(r => (
                                                                 <option key={r.id} value={r.id}>{r.name}</option>
                                                             ))}
                                                         </select>
                                                     </div>
                                                     <div className="space-y-3">
                                                         <label className="block text-[11px] font-[800] uppercase tracking-[0.3em] text-brand-text-secondary/60 ml-2">Unidade / Campus</label>
                                                         <select
                                                             required
                                                             disabled={!formData.brand_id}
                                                             className="w-full bg-bg-main border border-brand-gray py-5 px-8 rounded-2xl text-brand-dark outline-none focus:border-brand-blue/50 transition-all cursor-pointer text-lg disabled:opacity-30 font-[800]"
                                                             value={formData.unit_id}
                                                             onChange={(e) => {
                                                                 const selectedUnit = units.find(u => u.id === e.target.value);
                                                                 setFormData({
                                                                     ...formData,
                                                                     unit_id: e.target.value,
                                                                     unit: selectedUnit?.name || '',
                                                                     brand_id: selectedUnit?.brand_id || formData.brand_id,
                                                                     regional_id: selectedUnit?.regional_id || formData.regional_id
                                                                 });
                                                             }}
                                                         >
                                                             <option value="">Selecione uma unidade...</option>
                                                             {units.filter(u => u.brand_id === formData.brand_id).map(u => (
                                                                 <option key={u.id} value={u.id}>{u.name}</option>
                                                             ))}
                                                         </select>
                                                     </div>
                                                     <div className="space-y-3">
                                                         <label className="block text-[11px] font-[800] uppercase tracking-[0.3em] text-brand-text-secondary/60 ml-2">Instituição / Empresa</label>
                                                         <input
                                                             className="w-full bg-bg-main border border-brand-gray py-5 px-8 rounded-2xl text-brand-dark focus:border-brand-blue/50 outline-none transition-all text-lg font-[800] tracking-tight italic"
                                                             placeholder="Nome da organização"
                                                             type="text"
                                                             value={formData.institution}
                                                             onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                                                         />
                                                     </div>
                                                     <div className="space-y-3">
                                                         <label className="block text-[11px] font-[800] uppercase tracking-[0.3em] text-brand-text-secondary/60 ml-2">Cargo / Título Externo</label>
                                                         <input
                                                             className="w-full bg-bg-main border border-brand-gray py-5 px-8 rounded-2xl text-brand-dark focus:border-brand-blue/50 outline-none transition-all text-lg italic font-medium"
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
                                            <h3 className="text-[28px] font-[800] text-brand-dark tracking-tight">Biografia</h3>
                                            <p className="text-brand-text-secondary font-medium opacity-60">Conte a história e as conquistas do homenageado.</p>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="block text-[11px] font-[800] uppercase tracking-[0.3em] text-brand-text-secondary/60 ml-2">Biografia / Histórico de Conquistas</label>
                                            <div className="quill-container-premium">
                                                <ReactQuill
                                                    ref={bioQuillRef}
                                                    theme="snow"
                                                    value={formData.biography || ''}
                                                    onChange={(content) => setFormData({ ...formData, biography: content })}
                                                    className="bg-bg-main border border-brand-gray rounded-[2rem] text-brand-dark overflow-hidden"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            case 3:
                                return (
                                    <div className="space-y-10 animate-slide-up">
                                        <div className="space-y-2">
                                            <h3 className="text-[28px] font-[800] text-brand-dark tracking-tight">Mídia & Visibilidade</h3>
                                            <p className="text-brand-text-secondary font-medium opacity-60">Adicione uma foto oficial e um vídeo de homenagem.</p>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                            <div className="lg:col-span-2 space-y-8">
                                                <div className="space-y-4">
                                                    <label className="block text-[11px] font-[800] uppercase tracking-[0.3em] text-brand-text-secondary/60 ml-2">Vídeo de Homenagem</label>

                                                    {videoPreview ? (
                                                        <div className="space-y-4">
                                                            <div className="relative rounded-[2.5rem] overflow-hidden bg-black shadow-2xl border border-brand-gray aspect-video group/video-container">
                                                                <video
                                                                    src={videoPreview}
                                                                    className="w-full h-full object-contain"
                                                                    controls
                                                                />
                                                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover/video-container:opacity-100 transition-opacity z-10">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => document.getElementById('video-upload')?.click()}
                                                                        className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/90 backdrop-blur-md text-brand-blue border border-brand-blue/20 hover:bg-white transition-all text-[11px] font-[800] uppercase tracking-widest shadow-lg"
                                                                    >
                                                                        <span className="material-symbols-outlined text-sm">edit</span>
                                                                        Alterar
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setIsConfirmModalOpen(true);
                                                                        }}
                                                                        className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-red-500 text-white border border-red-600 hover:bg-red-600 transition-all text-[11px] font-[800] uppercase tracking-widest shadow-lg"
                                                                    >
                                                                        <span className="material-symbols-outlined text-sm">delete</span>
                                                                        Remover
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <p className="text-center text-[10px] text-brand-text-secondary/40 uppercase tracking-[0.2em] font-[700]">Preview do vídeo selecionado</p>
                                                        </div>
                                                    ) : (
                                                        <div
                                                            className="aspect-video border-2 border-dashed border-brand-gray rounded-[2.5rem] flex flex-col items-center justify-center hover:border-brand-blue/30 transition-all cursor-pointer group bg-bg-main relative"
                                                            onClick={() => document.getElementById('video-upload')?.click()}
                                                        >
                                                            <div className="text-center p-8">
                                                                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform shadow-sm">
                                                                    <span className="material-symbols-outlined text-4xl text-brand-text-secondary/20 group-hover:text-brand-blue transition-colors">videocam</span>
                                                                </div>
                                                                <p className="text-[11px] font-[800] text-brand-text-secondary/40 uppercase tracking-[0.2em] mb-2">Upload de Vídeo</p>
                                                                <p className="text-[10px] text-brand-text-secondary/20 uppercase tracking-widest">MP4, WebM ou MOV (máx. 100MB)</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <input
                                                        id="video-upload"
                                                        type="file"
                                                        accept="video/mp4,video/webm,video/quicktime"
                                                        className="hidden"
                                                        onChange={handleVideoChange}
                                                    />

                                                    {uploadProgress > 0 && uploadProgress < 100 && (
                                                        <div className="p-6 rounded-2xl bg-brand-blue/5 border border-brand-blue/10 animate-pulse">
                                                            <div className="flex justify-between text-[11px] font-[800] uppercase tracking-widest text-brand-blue mb-3">
                                                                <span>Preparando arquivo...</span>
                                                                <span>{Math.round(uploadProgress)}%</span>
                                                            </div>
                                                            <div className="h-1.5 bg-brand-gray rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-brand-blue transition-all duration-300"
                                                                    style={{ width: `${uploadProgress}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                    {!isDirector && (
                                                        <div className="flex items-center gap-4 p-8 rounded-[2rem] bg-bg-main border border-brand-gray shadow-sm">
                                                            <label className="flex items-center gap-4 cursor-pointer group">
                                                                <input
                                                                    type="checkbox"
                                                                    className="size-6 rounded-lg border-brand-gray text-brand-blue focus:ring-brand-blue/20 transition-all"
                                                                    checked={formData.is_published}
                                                                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                                                                />
                                                                <div className="flex flex-col">
                                                                    <span className="text-[11px] font-[800] uppercase tracking-widest text-brand-dark group-hover:text-brand-blue transition-colors">Publicar Imediatamente</span>
                                                                    <span className="text-[10px] text-brand-text-secondary/40 uppercase tracking-tighter font-[700]">O perfil ficará visível na galeria pública</span>
                                                                </div>
                                                            </label>
                                                        </div>
                                                    )}
                                            </div>

                                            <div className="space-y-4">
                                                <label className="block text-[11px] font-[800] uppercase tracking-[0.3em] text-brand-text-secondary/60 text-center">Foto de Perfil</label>
                                                <div
                                                    className="aspect-[4/5] border-2 border-dashed border-brand-gray rounded-[2.5rem] flex flex-col items-center justify-center hover:border-brand-blue/30 transition-all cursor-pointer group bg-bg-main overflow-hidden relative"
                                                    onClick={() => document.getElementById('photo-upload')?.click()}
                                                >
                                                    {photoPreview ? (
                                                        <>
                                                            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-brand-dark/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <span className="text-white font-[800] text-[11px] uppercase tracking-widest">Alterar Foto</span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="text-center p-8">
                                                            <span className="material-symbols-outlined text-5xl text-brand-text-secondary/10 group-hover:text-brand-blue transition-colors mb-6">add_a_photo</span>
                                                            <p className="text-[11px] font-[800] text-brand-text-secondary/30 uppercase tracking-widest text-center leading-relaxed">
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
                                            <h3 className="text-[28px] font-[800] text-brand-dark tracking-tight">Currículo & Métricas</h3>
                                            <p className="text-brand-text-secondary font-medium opacity-60">Dados de impacto e linha do tempo histórica.</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                            {[
                                                { label: 'Anos de Dedicação', key: 'yearsOfService' },
                                                { label: 'Láureas Recebidas', key: 'totalAwards' },
                                                { label: 'Projetos de Impacto', key: 'projectsLed' },
                                                { label: 'Unidades Lideradas', key: 'units' }
                                            ].map((stat) => (
                                                <div key={stat.key} className="space-y-3">
                                                    <label className="block text-[11px] font-[800] uppercase tracking-[0.3em] text-brand-text-secondary/60 ml-2">{stat.label}</label>
                                                    <input
                                                        className="w-full bg-bg-main border border-brand-gray py-5 px-6 rounded-2xl text-brand-dark focus:border-brand-blue/50 outline-none transition-all text-center text-3xl font-[800] tracking-tight"
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

                                        <div className="space-y-8">
                                            <div className="flex justify-between items-center border-b border-brand-gray pb-6">
                                                <h4 className="text-2xl font-[800] text-brand-dark tracking-tight">Linha do Tempo (Marcos)</h4>
                                                <button
                                                    onClick={addTimelineItem}
                                                    className="flex items-center gap-2 text-brand-blue text-[11px] font-[800] uppercase tracking-widest hover:opacity-70 transition-opacity"
                                                >
                                                    <span className="material-symbols-outlined text-sm font-black">add_circle</span>
                                                    Adicionar Marco
                                                </button>
                                            </div>

                                            <div className="space-y-6">
                                                {formData.timeline.map((item) => (
                                                    <div key={item.id} className="flex gap-6 items-end bg-bg-main p-8 rounded-[2rem] border border-brand-gray group hover:border-brand-blue/30 transition-all">
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
                                                            <div className="space-y-3">
                                                                <label className="block text-[10px] font-[800] uppercase tracking-widest text-brand-text-secondary/40 ml-1">Ano/Semestre</label>
                                                                <input
                                                                    className="w-full bg-white border border-brand-gray py-4 px-5 rounded-xl text-brand-dark text-sm font-[800] outline-none focus:border-brand-blue/50"
                                                                    placeholder="Ex: 2023.2"
                                                                    value={item.semester}
                                                                    onChange={(e) => updateTimelineItem(item.id, 'semester', e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="space-y-3">
                                                                <label className="block text-[10px] font-[800] uppercase tracking-widest text-brand-text-secondary/40 ml-1">Título do Marco</label>
                                                                <input
                                                                    className="w-full bg-white border border-brand-gray py-4 px-5 rounded-xl text-brand-dark text-sm font-[800] outline-none focus:border-brand-blue/50"
                                                                    placeholder="Ex: Prêmio de Excelência"
                                                                    value={item.title}
                                                                    onChange={(e) => updateTimelineItem(item.id, 'title', e.target.value)}
                                                                />
                                                            </div>
                                                            <div className="space-y-3">
                                                                <label className="block text-[10px] font-[800] uppercase tracking-widest text-brand-text-secondary/40 ml-1">Categoria</label>
                                                                <input
                                                                    className="w-full bg-white border border-brand-gray py-4 px-5 rounded-xl text-brand-dark text-sm font-[800] outline-none focus:border-brand-blue/50"
                                                                    placeholder="Ex: Liderança Executiva"
                                                                    value={item.category}
                                                                    onChange={(e) => updateTimelineItem(item.id, 'category', e.target.value)}
                                                                />
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => removeTimelineItem(item.id)}
                                                            className="p-4 text-red-500 hover:bg-red-50 rounded-2xl transition-colors shrink-0"
                                                        >
                                                            <span className="material-symbols-outlined text-2xl font-bold">delete</span>
                                                        </button>
                                                    </div>
                                                ))}
                                                {formData.timeline.length === 0 && (
                                                    <div className="py-16 text-center border-2 border-dashed border-brand-gray rounded-[2.5rem] bg-bg-main">
                                                        <p className="text-brand-text-secondary/30 text-sm font-[700] uppercase tracking-widest">Nenhum marco histórico adicionado.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="space-y-4">
                                                <label className="block text-[11px] font-[800] uppercase tracking-[0.3em] text-brand-text-secondary/60 ml-2">Aba: Iniciativas</label>
                                                <div className="quill-container-premium">
                                                    <ReactQuill
                                                        ref={initQuillRef}
                                                        theme="snow"
                                                        value={formData.initiatives || ''}
                                                        onChange={(content) => setFormData({ ...formData, initiatives: content })}
                                                        className="bg-bg-main border border-brand-gray rounded-[2rem] text-brand-dark overflow-hidden"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="block text-[11px] font-[800] uppercase tracking-[0.3em] text-brand-text-secondary/60 ml-2">Aba: Reconhecimentos</label>
                                                <div className="quill-container-premium">
                                                    <ReactQuill
                                                        ref={recQuillRef}
                                                        theme="snow"
                                                        value={formData.recognitions || ''}
                                                        onChange={(content) => setFormData({ ...formData, recognitions: content })}
                                                        className="bg-bg-main border border-brand-gray rounded-[2rem] text-brand-dark overflow-hidden"
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

                <div className="mt-16 pt-10 border-t border-brand-gray flex justify-between items-center">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 0}
                        className={`text-[11px] font-[800] uppercase tracking-[0.3em] transition-all flex items-center gap-2 ${currentStep === 0 ? 'text-brand-text-secondary/10 cursor-not-allowed' : 'text-brand-text-secondary/40 hover:text-brand-blue'}`}
                    >
                        <span className="material-symbols-outlined text-sm font-black">chevron_left</span>
                        Anterior
                    </button>

                    <div className="flex flex-wrap items-center gap-6 justify-end">
                        <button
                            onClick={() => navigate('/admin/homenageados')}
                            className="text-[11px] font-[800] uppercase tracking-[0.3em] text-brand-text-secondary/40 hover:text-red-500 transition-colors"
                        >
                            Cancelar
                        </button>

                        {currentStep < steps.length - 1 ? (
                            <button
                                onClick={nextStep}
                                className="px-12 py-5 bg-bg-main hover:bg-white text-brand-blue rounded-full font-[800] text-[11px] uppercase tracking-[0.3em] border border-brand-blue/30 shadow-sm transition-all flex items-center gap-2"
                            >
                                Próximo Passo
                                <span className="material-symbols-outlined text-sm font-black">chevron_right</span>
                            </button>
                        ) : (
                            <>
                                {isDirector && (!id || formData.status === 'rascunho') && (
                                    <button
                                        onClick={() => handleSubmit('rascunho')}
                                        disabled={isLoading}
                                        className="px-12 py-5 bg-white text-brand-text-secondary rounded-full font-[800] text-[11px] uppercase tracking-[0.3em] hover:bg-bg-main transition-all disabled:opacity-50 border border-brand-gray shadow-sm"
                                    >
                                        Salvar Rascunho
                                    </button>
                                )}
                                <button
                                    onClick={() => handleSubmit(isDirector ? (['rascunho', 'reprovado'].includes(formData.status) || !id ? 'enviar' : 'atualizar') : 'atualizar')}
                                    disabled={isLoading}
                                    className="btn-premium !px-12 !py-5 !text-[11px] !tracking-[0.3em] shadow-xl shadow-brand-blue/20"
                                >
                                    {isLoading ? 'Processando...' : (
                                        isDirector 
                                            ? (['rascunho', 'reprovado'].includes(formData.status) || !id ? 'Enviar para Análise' : 'Atualizar Dados') 
                                            : (isEdit ? 'Atualizar Cadastro' : 'Finalizar Cadastro')
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Image Cropper Modal */}
            {isCropping && tempPhotoUrl && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-brand-dark/90 backdrop-blur-2xl animate-fade-in">
                    <div className="w-full max-w-4xl max-h-[96vh] flex flex-col bg-white rounded-[2.5rem] border border-brand-gray overflow-hidden shadow-2xl relative">

                        {/* Header */}
                        <div className="p-6 md:p-8 border-b border-brand-gray flex justify-between items-center bg-white shrink-0">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-[800] text-brand-dark tracking-tight leading-tight">
                                    Ajuste de Fotografia
                                </h3>
                                <p className="text-brand-blue text-[11px] uppercase tracking-widest font-[800]">
                                    PADRÃO DE QUALIDADE PREMIUM
                                </p>
                            </div>
                            <button
                                onClick={() => setIsCropping(false)}
                                className="w-12 h-12 rounded-2xl bg-bg-main flex items-center justify-center text-brand-text-secondary/40 hover:bg-red-50 hover:text-red-500 transition-all border border-brand-gray"
                            >
                                <span className="material-symbols-outlined text-2xl font-bold">close</span>
                            </button>
                        </div>

                        {/* Cropper Area */}
                        <div className="relative w-full h-[35vh] md:h-[40vh] min-h-[300px] bg-black overflow-hidden flex-grow shadow-inner">

                            <Cropper
                                image={tempPhotoUrl}
                                crop={crop}
                                zoom={zoom}
                                aspect={4 / 5}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                                style={{
                                    containerStyle: {
                                        width: '100%',
                                        height: '100%',
                                    }
                                }}
                            />
                        </div>

                        {/* Footer */}
                        <div className="p-6 md:p-10 border-t border-brand-gray bg-bg-main shrink-0">

                            {/* Zoom Slider */}
                            <div className="max-w-md mx-auto w-full space-y-4 mb-8">
                                <div className="flex justify-between items-center text-[11px] font-[800] uppercase tracking-widest text-brand-text-secondary/60">
                                    <span className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-lg font-bold">zoom_out</span>
                                        ZOOM
                                    </span>
                                    <span className="text-brand-blue bg-white px-4 py-1.5 rounded-full border border-brand-blue/20 font-[800] shadow-sm">
                                        {Math.round(zoom * 100)}%
                                    </span>
                                    <span className="flex items-center gap-2">
                                        MÁX
                                        <span className="material-symbols-outlined text-lg font-bold">zoom_in</span>
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full accent-brand-blue bg-brand-gray h-2 rounded-full appearance-none cursor-pointer"
                                />
                            </div>

                            {/* Actions Buttons */}
                            <div className="flex justify-center sm:justify-end items-center gap-4">
                                <button
                                    onClick={() => setIsCropping(false)}
                                    className="px-8 py-3 rounded-xl text-[11px] font-[800] uppercase tracking-widest text-brand-text-secondary/60 hover:text-brand-dark bg-white border border-brand-gray transition-all shadow-sm"
                                >
                                    Descartar
                                </button>
                                <button
                                    onClick={handleCropSave}
                                    className="px-10 py-4 bg-brand-blue text-white rounded-xl font-[800] text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-brand-blue/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm font-black">done</span>
                                    Finalizar Ajuste
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .quill-container-premium .ql-toolbar {
                    background: #f8fafc;
                    border: none !important;
                    border-bottom: 1px solid #e2e8f0 !important;
                    padding: 1rem !important;
                    border-radius: 2rem 2rem 0 0;
                }
                .quill-container-premium .ql-container {
                    border: none !important;
                    font-family: 'Inter', sans-serif !important;
                    font-size: 1rem !important;
                    min-height: 250px;
                }
                .quill-container-premium .ql-editor {
                    color: #1e293b !important;
                    padding: 2rem !important;
                }
                .quill-container-premium .ql-editor.ql-blank::before {
                    color: #94a3b8 !important;
                    font-style: italic !important;
                }
                .quill-container-premium .ql-stroke {
                    stroke: #64748b !important;
                }
                .quill-container-premium .ql-fill {
                    fill: #64748b !important;
                }
                .quill-container-premium .ql-picker {
                    color: #64748b !important;
                }
            `}</style>

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={() => {
                    setVideoFile(null);
                    setVideoPreview(null);
                    setFormData({ ...formData, video_url: '' });
                    setUploadProgress(0);
                }}
                title="Remover Vídeo"
                message="Tem certeza que deseja remover este vídeo de homenagem? Esta ação não poderá ser desfeita."
                confirmLabel="Sim, Remover"
                cancelLabel="Manter Vídeo"
                type="danger"
            />

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

export default HonoreeRegistrationPage;