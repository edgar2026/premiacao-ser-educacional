import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import VideoModal from '../../components/ui/VideoModal';
import CertificateTemplate from './components/CertificateTemplate';
import TimelineModal from './components/TimelineModal';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
import type { Database } from '../../types/supabase';

type Honoree = Database['public']['Tables']['honorees']['Row'];

const HonoreePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [honoree, setHonoree] = useState<Honoree | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Iniciativas');
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);

    useEffect(() => {
        if (id) fetchHonoree();
    }, [id]);

    const fetchHonoree = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('honorees')
            .select('*, awards!honorees_award_id_fkey(name)')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching honoree:', error);
        } else {
            setHonoree(data as any);
        }
        setIsLoading(false);
    };

    if (isLoading) {
        return (
            <div className="w-full min-h-screen bg-transparent flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-blue"></div>
            </div>
        );
    }

    if (!honoree) {
        return (
            <div className="w-full min-h-screen bg-transparent flex flex-col items-center justify-center">
                <h2 className="text-3xl font-[800] mb-6 text-brand-dark">Homenageado não encontrado</h2>
                <Link to="/homenageados" className="btn-premium">Voltar para Galeria</Link>
            </div>
        );
    }

    const profData = honoree.professional_data ? JSON.parse(honoree.professional_data) : {};
    const timeline = (honoree.timeline as any[]) || [];
    const awardName = (honoree as any).awards?.name || 'Prêmio de Excelência';

    return (
        <div className="w-full bg-transparent min-h-screen text-brand-dark font-sans relative print:bg-white">
            {/* Certificate Template for Printing */}
            <CertificateTemplate
                honoreeName={profData.name}
                awardName={awardName}
                role={profData.role || profData.external_role}
                biography={honoree.biography || ''}
            />

            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none print:hidden">
                <img src="/assets/tech_award_bg.png" alt="" className="w-full h-full object-cover opacity-50 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-b from-bg-main/60 via-bg-main/80 to-bg-main/95"></div>
            </div>

            <div className="max-w-[1280px] mx-auto px-6 lg:px-[80px] py-24 relative z-10 print:hidden">
                {/* Breadcrumbs */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-wrap items-center justify-between mb-10 gap-4"
                >
                    <div className="flex flex-wrap items-center gap-3 text-[13px] font-semibold">
                        <Link to="/homenageados" className="text-brand-text-secondary hover:text-brand-blue transition-colors">Homenageados</Link>
                        <span className="text-brand-text-secondary/30">/</span>
                        <span className="text-brand-blue">{profData.name}</span>
                    </div>
                    <Link to="/homenageados" className="flex items-center gap-2 text-brand-text-secondary hover:text-brand-blue transition-all group text-[13px] font-semibold">
                        <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
                        Voltar
                    </Link>
                </motion.div>

                {/* Profile Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="card-static p-10 md:p-16 mb-12"
                >
                    <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start">
                        {/* Photo */}
                        <div className="relative shrink-0">
                            <div className="w-64 h-64 lg:w-72 lg:h-72 overflow-hidden border-[3px] border-brand-blue shadow-2xl shadow-brand-blue/20 rounded-2xl">
                                <img
                                    className="w-full h-full object-cover"
                                    src={honoree.photo_url || '/assets/default-fallback.png'}
                                    alt={profData.name}
                                    onError={(e) => { (e.target as HTMLImageElement).src = '/assets/default-fallback.png'; }}
                                />
                            </div>
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 lg:left-auto lg:right-[-16px] lg:translate-x-0 bg-brand-blue text-white px-6 py-2.5 font-[700] text-[11px] uppercase tracking-[0.15em] shadow-lg whitespace-nowrap rounded-lg">
                                {awardName}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex flex-col flex-1 text-center lg:text-left">
                            <h1 className="text-[40px] lg:text-[56px] font-[800] leading-[1.1] tracking-[-1px] mb-4 text-brand-dark">
                                {profData.name}
                            </h1>
                            <p className="text-brand-blue text-[20px] font-[600] mb-8">
                                {profData.role || profData.external_role}
                            </p>
                            <div
                                className="text-brand-text-secondary text-[17px] leading-[1.8] max-w-3xl prose prose-slate break-words"
                                dangerouslySetInnerHTML={{ __html: honoree.biography || '' }}
                            />
                            {honoree.video_url && (
                                <div className="flex justify-center lg:justify-start mt-10">
                                    <button
                                        onClick={() => setIsVideoModalOpen(true)}
                                        className="btn-premium flex items-center gap-3"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">play_circle</span>
                                        Ver Homenagem
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Video Modal */}
                {honoree.video_url && (
                    <VideoModal
                        isOpen={isVideoModalOpen}
                        onClose={() => setIsVideoModalOpen(false)}
                        videoSrc={honoree.video_url}
                        title={`Homenagem: ${profData.name}`}
                    />
                )}

                {/* Timeline Modal */}
                <TimelineModal
                    isOpen={isTimelineModalOpen}
                    onClose={() => setIsTimelineModalOpen(false)}
                    honoreeName={profData.name}
                    timeline={timeline}
                />

                {/* Content Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Tabs */}
                        <div className="flex gap-1 border-b border-brand-gray">
                            {['Iniciativas', 'Reconhecimentos'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`relative px-6 py-4 text-[13px] font-[700] uppercase tracking-[0.12em] transition-all ${
                                        activeTab === tab
                                            ? 'text-brand-blue'
                                            : 'text-brand-text-secondary hover:text-brand-dark'
                                    }`}
                                >
                                    {tab}
                                    {activeTab === tab && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-brand-blue"></span>}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="card-static p-10 md:p-14">
                            <h3 className="text-[28px] font-[700] text-brand-dark mb-8">
                                {activeTab === 'Iniciativas' && 'Projetos & Impacto'}
                                {activeTab === 'Reconhecimentos' && 'Láureas & Mérito'}
                            </h3>
                            <div className="text-brand-text-secondary text-[16px] leading-[1.8] prose prose-slate max-w-none break-words">
                                {activeTab === 'Iniciativas' && (
                                    <div dangerouslySetInnerHTML={{ __html: honoree.initiatives || '<p>Informações sobre iniciativas em breve.</p>' }} />
                                )}
                                {activeTab === 'Reconhecimentos' && (
                                    <div dangerouslySetInnerHTML={{ __html: honoree.recognitions || '<p>Informações sobre reconhecimentos em breve.</p>' }} />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Timeline Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="card-static p-8 sticky top-28">
                            <h3 className="text-[20px] font-[700] text-brand-dark mb-8 flex items-center gap-3">
                                <span className="material-symbols-outlined text-brand-blue text-[24px]">history_edu</span>
                                Marco Histórico
                            </h3>
                            <div className="relative space-y-8 before:content-[''] before:absolute before:top-0 before:bottom-0 before:left-[14px] before:w-[2px] before:bg-gradient-to-b before:from-brand-blue before:via-brand-blue/20 before:to-transparent">
                                {timeline.map((item, index) => (
                                    <div key={item.id} className="relative pl-10 group">
                                        <div className={`absolute left-0 top-1 flex items-center justify-center w-[30px] h-[30px] z-10 transition-all ${
                                            index === 0
                                                ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30'
                                                : 'bg-white text-brand-blue border-2 border-brand-blue/30'
                                        }`}>
                                            <span className="material-symbols-outlined text-[16px]">
                                                {index === 0 ? 'star' : 'verified'}
                                            </span>
                                        </div>
                                        <div className="group-hover:translate-x-1 transition-transform">
                                            <time className="font-[700] text-brand-blue/50 text-[11px] uppercase tracking-[0.15em] mb-1 block">{item.semester}</time>
                                            <div className="text-brand-dark font-[700] text-[16px] mb-1">{item.title}</div>
                                            <div className="text-brand-text-secondary text-[11px] font-[600] uppercase tracking-[0.1em]">{item.category}</div>
                                        </div>
                                    </div>
                                ))}
                                {timeline.length === 0 && (
                                    <p className="text-brand-text-secondary/50 text-sm pl-4">Nenhum marco registrado.</p>
                                )}
                            </div>
                            {timeline.length > 0 && (
                                <button
                                    onClick={() => setIsTimelineModalOpen(true)}
                                    className="btn-premium-outline w-full mt-10 !h-14 !text-[12px]"
                                >
                                    Ver Registro Completo
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HonoreePage;
