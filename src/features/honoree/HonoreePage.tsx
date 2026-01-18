import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import GlassCard from '../../components/ui/GlassCard';
import VideoModal from '../../components/ui/VideoModal';
import CertificateTemplate from './components/CertificateTemplate';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/supabase';

type Honoree = Database['public']['Tables']['honorees']['Row'];

const HonoreePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [honoree, setHonoree] = useState<Honoree | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('A Jornada');
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

    useEffect(() => {
        if (id) {
            fetchHonoree();
        }
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

    const handleDownloadCertificate = () => {
        window.print();
    };

    if (isLoading) {
        return (
            <div className="w-full min-h-screen mesh-gradient-premium flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gold"></div>
            </div>
        );
    }

    if (!honoree) {
        return (
            <div className="w-full min-h-screen mesh-gradient-premium flex flex-col items-center justify-center text-off-white">
                <h2 className="text-4xl font-serif italic mb-6">Homenageado não encontrado</h2>
                <Link to="/" className="text-gold uppercase tracking-widest font-bold text-sm border-b border-gold/30 pb-1">Voltar para Galeria</Link>
            </div>
        );
    }

    const profData = honoree.professional_data ? JSON.parse(honoree.professional_data) : {};
    const stats = (honoree.stats as any) || {
        yearsOfService: '0',
        totalAwards: '0',
        projectsLed: '0',
        units: '0'
    };
    const timeline = (honoree.timeline as any[]) || [];
    const awardName = (honoree as any).awards?.name || 'Prêmio de Excelência';

    return (
        <div className="w-full mesh-gradient-premium min-h-screen print:bg-white print:mesh-gradient-none">
            {/* Certificate Template for Printing */}
            <CertificateTemplate
                honoreeName={profData.name}
                awardName={awardName}
                role={profData.role || profData.external_role}
                biography={honoree.biography || ''}
            />

            <div className="max-w-7xl mx-auto px-6 py-20 print:hidden">
                {/* Breadcrumbs & Back Button */}
                <div className="flex items-center justify-between mb-10 animate-fade-in">
                    <div className="flex flex-wrap gap-4 items-center">
                        <Link to="/" className="text-off-white/40 text-[10px] font-bold uppercase tracking-[0.3em] hover:text-gold transition-colors">Galeria de Notáveis</Link>
                        <span className="text-gold/30 text-xs">/</span>
                        <span className="text-gold text-[10px] font-bold uppercase tracking-[0.3em]">{profData.name}</span>
                    </div>
                    <Link to="/" className="flex items-center gap-3 text-off-white/60 hover:text-gold transition-all group">
                        <span className="material-symbols-outlined text-[20px] transition-transform group-hover:-translate-x-2">arrow_back</span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Retornar</span>
                    </Link>
                </div>

                {/* Profile Header */}
                <div className="relative glass-card rounded-[3rem] p-10 md:p-16 mb-12 overflow-hidden border-white/5">
                    <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] pointer-events-none"></div>
                    <div className="relative flex flex-col lg:flex-row gap-16 items-center lg:items-start text-center lg:text-left">
                        <div className="relative shrink-0">
                            <div className="p-2 glass-card rounded-[2.5rem] border-white/10">
                                <div
                                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-[2rem] w-72 h-72 shadow-2xl grayscale hover:grayscale-0 transition-all duration-1000"
                                    style={{ backgroundImage: `url("${honoree.photo_url || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=2071'}")` }}
                                ></div>
                            </div>
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 lg:left-auto lg:right-[-20px] lg:translate-x-0 bg-gold text-navy-deep px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_10px_30px_rgba(212,175,55,0.4)] whitespace-nowrap">
                                {awardName}
                            </div>
                        </div>
                        <div className="flex flex-col flex-1 py-4">
                            <h1 className="font-serif text-6xl md:text-8xl text-off-white font-bold mb-6 tracking-tighter leading-[0.9]">{profData.name}</h1>
                            <p className="text-gold text-2xl font-light mb-10 tracking-wide italic font-serif">{profData.role || profData.external_role}</p>
                            <div
                                className="text-off-white/70 text-xl leading-relaxed font-light max-w-3xl italic prose prose-invert break-words"
                                dangerouslySetInnerHTML={{ __html: honoree.biography || '' }}
                            />
                            <div className="flex flex-wrap gap-6 mt-12 justify-center lg:justify-start">
                                <button
                                    onClick={handleDownloadCertificate}
                                    className="flex items-center gap-4 px-12 py-5 bg-gold text-navy-deep rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(212,175,55,0.2)] hover:scale-105 transition-all"
                                >
                                    <span className="material-symbols-outlined text-[20px]">workspace_premium</span>
                                    Baixar Certificado de Honra
                                </button>
                                {honoree.video_url && (
                                    <button
                                        onClick={() => setIsVideoModalOpen(true)}
                                        className="flex items-center gap-4 px-12 py-5 glass-card text-off-white rounded-2xl font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-white/5 transition-all"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">play_circle</span>
                                        Ver Homenagem
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Video Modal */}
                {honoree.video_url && (
                    <VideoModal
                        isOpen={isVideoModalOpen}
                        onClose={() => setIsVideoModalOpen(false)}
                        videoSrc={honoree.video_url}
                        title={`Homenagem: ${profData.name}`}
                    />
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {[
                        { label: 'Anos de Dedicação', value: stats.yearsOfService },
                        { label: 'Láureas Recebidas', value: String(stats.totalAwards).padStart(2, '0'), color: 'text-gold' },
                        { label: 'Projetos de Impacto', value: stats.projectsLed },
                        { label: 'Unidades Lideradas', value: stats.units }
                    ].map((stat, i) => (
                        <GlassCard key={i} className="p-10 rounded-[2rem] flex flex-col items-center text-center group hover:bg-white/[0.05] transition-all duration-500 border-white/5">
                            <span className="text-off-white/40 text-[9px] font-bold uppercase tracking-[0.3em] mb-4">{stat.label}</span>
                            <p className={`text-6xl font-bold font-serif ${stat.color || 'text-off-white'} group-hover:scale-110 transition-transform duration-700`}>{stat.value}</p>
                        </GlassCard>
                    ))}
                </div>

                {/* Content Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                    <div className="lg:col-span-2 space-y-12">
                        <div className="flex gap-12 border-b border-white/10 px-6">
                            {['A Jornada', 'Iniciativas', 'Reconhecimentos'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`relative pb-6 text-[10px] font-bold uppercase tracking-[0.3em] transition-all ${activeTab === tab ? 'text-gold' : 'text-off-white/40 hover:text-off-white'}`}
                                >
                                    {tab}
                                    {activeTab === tab && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gold rounded-full"></span>}
                                </button>
                            ))}
                        </div>
                        <article className="glass-card p-12 md:p-16 rounded-[3rem] border-white/5">
                            <h3 className="font-serif text-4xl text-off-white mb-10 italic">
                                {activeTab === 'A Jornada' && 'A Narrativa da Excelência'}
                                {activeTab === 'Iniciativas' && 'Projetos & Impacto'}
                                {activeTab === 'Reconhecimentos' && 'Láureas & Mérito'}
                            </h3>
                            <div className="space-y-10 text-off-white/60 leading-relaxed text-xl font-light italic prose prose-invert max-w-none break-words">
                                {activeTab === 'A Jornada' && (
                                    <div dangerouslySetInnerHTML={{ __html: honoree.biography || '' }} />
                                )}
                                {activeTab === 'Iniciativas' && (
                                    <div dangerouslySetInnerHTML={{ __html: honoree.initiatives || '<p>Informações sobre iniciativas em breve.</p>' }} />
                                )}
                                {activeTab === 'Reconhecimentos' && (
                                    <div dangerouslySetInnerHTML={{ __html: honoree.recognitions || '<p>Informações sobre reconhecimentos em breve.</p>' }} />
                                )}
                            </div>
                        </article>
                    </div>

                    {/* Timeline Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="glass-card rounded-[3rem] p-10 sticky top-32 border-white/5">
                            <h3 className="font-serif text-2xl text-off-white mb-12 flex items-center gap-4 italic">
                                <span className="material-symbols-outlined text-gold text-[28px]">history_edu</span>
                                Marco Histórico
                            </h3>
                            <div className="relative space-y-12 before:content-[''] before:absolute before:top-0 before:bottom-0 before:left-[18px] before:w-[1px] before:bg-gradient-to-b before:from-gold before:via-gold/20 before:to-transparent">
                                {timeline.map((item, index) => (
                                    <div key={item.id} className="relative pl-14 group">
                                        <div className={`absolute left-0 top-1 flex items-center justify-center w-[36px] h-[36px] rounded-full z-10 transition-all duration-500 ${index === 0 ? 'bg-gold text-navy-deep shadow-[0_0_20px_rgba(212,175,55,0.5)]' : 'glass-card text-gold border-gold/30'}`}>
                                            <span className="material-symbols-outlined text-[18px]">
                                                {index === 0 ? 'star' : 'verified'}
                                            </span>
                                        </div>
                                        <div className="transition-all duration-500 group-hover:translate-x-2">
                                            <time className="font-bold text-gold/50 text-[9px] uppercase tracking-[0.2em] mb-2 block">{item.semester}</time>
                                            <div className="text-off-white font-bold text-lg mb-1 font-serif italic">{item.title}</div>
                                            <div className="text-off-white/40 text-[10px] font-bold uppercase tracking-widest">{item.category}</div>
                                        </div>
                                    </div>
                                ))}
                                {timeline.length === 0 && (
                                    <p className="text-off-white/20 text-sm italic pl-4">Nenhum marco registrado.</p>
                                )}
                            </div>
                            <button className="w-full mt-16 py-5 glass-card rounded-2xl text-gold text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gold hover:text-navy-deep transition-all duration-500">
                                Ver Registro Completo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; export default HonoreePage;
