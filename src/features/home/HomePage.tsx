import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import GlassCard from '../../components/ui/GlassCard';
import { supabase } from '../../lib/supabase';
import PremiumVideoPlayer from '../../components/ui/PremiumVideoPlayer';

interface Award {
    id: string;
    name: string;
    description: string;
    image_url: string;
}

interface Honoree {
    id: string;
    professional_data: string;
    photo_url: string;
    award_id: string;
    is_published: boolean;
    awards?: { name: string };
}

const HomePage: React.FC = () => {
    const { hash } = useLocation();
    const [awards, setAwards] = useState<Award[]>([]);
    const [honorees, setHonorees] = useState<Honoree[]>([]);
    const [homeMedia, setHomeMedia] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!isLoading && hash) {
            const id = hash.replace('#', '');
            const element = document.getElementById(id);
            if (element) {
                const timer = setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
                return () => clearTimeout(timer);
            }
        }
    }, [isLoading, hash]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch Home Media
            const { data: mediaData } = await supabase
                .from('home_media')
                .select('*')
                .eq('is_active', true)
                .single();

            if (mediaData) setHomeMedia(mediaData);

            // Fetch Awards (Categories)
            const { data: awardsData } = await supabase
                .from('awards')
                .select('*')
                .limit(3);

            if (awardsData) setAwards(awardsData);

            // Fetch Published Honorees
            const { data: honoreesData } = await supabase
                .from('honorees')
                .select('*, awards(name)')
                .eq('is_published', true)
                .limit(4);

            if (honoreesData) setHonorees(honoreesData as any);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full min-h-screen mesh-gradient-premium flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gold"></div>
            </div>
        );
    }

    return (
        <div className="w-full mesh-gradient-premium min-h-screen">
            {/* Hero Section */}
            <section className="relative pt-16 pb-10">
                <div className="max-w-6xl mx-auto px-6 sm:px-8 md:px-6 text-center relative z-10 animate-fade-in">
                    <span className="inline-block px-4 sm:px-6 py-1.5 sm:py-2 mb-6 sm:mb-8 text-[7px] sm:text-[9px] font-bold tracking-[0.3em] sm:tracking-[0.5em] text-gold uppercase border border-gold/20 rounded-full bg-navy-deep/40 backdrop-blur-2xl">
                        EXCELÊNCIA E MERITOCRACIA
                    </span>
                    <h1 className="font-black mb-10 leading-none font-serif uppercase max-w-full">
                        <span className="text-off-white block text-xs sm:text-base md:text-xl lg:text-2xl xl:text-3xl mb-2 opacity-70 tracking-[0.15em] sm:tracking-[0.2em] md:tracking-[0.3em] lg:tracking-[0.4em]">PREMIAÇÕES</span>
                        <span className="text-gold-gradient gold-glow block text-[1.5rem] sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl leading-[1.1] tracking-tight sm:tracking-normal md:tracking-tight break-words">
                            {homeMedia?.headline || 'SER EDUCACIONAL'}
                        </span>
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl text-off-white/60 max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed font-light italic px-4">
                        {homeMedia?.description || 'Celebrando os pilares de nossa excelência, meritocracia e prestígio executivo em um ambiente vibrante de alta performance.'}
                    </p>

                    <PremiumVideoPlayer
                        src={homeMedia?.video_url || "https://assets.mixkit.co/videos/preview/mixkit-awards-ceremony-with-golden-confetti-42442-large.mp4"}
                        poster={homeMedia?.image_url || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=2071"}
                        className="max-w-5xl mx-auto"
                    />
                </div>
            </section>

            {/* Awards Categories */}
            <section className="py-20 relative" id="premios">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col items-center text-center mb-16 gap-8">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-off-white font-serif uppercase px-2">
                            CONHEÇA OS <span className="text-gold-gradient italic pr-2">PRÊMIOS</span>
                        </h2>
                        <div className="h-1 w-24 bg-gold/50 rounded-full"></div>
                        <p className="text-off-white/50 max-w-2xl text-lg font-light leading-relaxed italic">
                            Categorias exclusivas que valorizam a inovação, a gestão de alta performance e a excelência acadêmica sob uma nova luz.
                        </p>
                        <Link to="/premios" className="inline-flex items-center gap-4 px-10 py-4 glass-card text-gold text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gold hover:text-navy-deep transition-all rounded-full border-gold/30">
                            Ver Todos os Prêmios
                            <span className="material-symbols-outlined text-sm">workspace_premium</span>
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {awards.map((award) => (
                            <GlassCard key={award.id} className="p-10 rounded-[2.5rem] flex flex-col items-center text-center group hover:-translate-y-2 transition-all duration-500 border-white/5 bg-white/[0.02]">
                                <div className="size-14 mb-8 rounded-2xl bg-gold/5 flex items-center justify-center group-hover:bg-gold transition-all duration-500 border border-gold/10">
                                    <span className="material-symbols-outlined text-gold group-hover:text-navy-deep text-2xl">workspace_premium</span>
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-off-white font-serif">{award.name}</h3>
                                <p className="text-off-white/40 text-sm leading-relaxed mb-8 font-light line-clamp-3">
                                    {award.description}
                                </p>
                                <Link to={`/premio/${award.id}`} className="text-gold text-[9px] font-bold uppercase tracking-[0.3em] flex items-center gap-2 hover:gap-4 transition-all group/btn">
                                    DETALHES <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                                </Link>
                            </GlassCard>
                        ))}
                    </div>
                </div>
            </section>

            {/* Honorees Gallery */}
            <section className="py-20" id="homenageados">
                <div className="max-w-7xl mx-auto px-6 sm:px-8 md:px-6 relative z-10">
                    <div className="text-center mb-12">
                        <h2 className="font-bold mb-6 uppercase font-serif max-w-full">
                            <span className="text-gold-gradient gold-glow block text-[1.5rem] sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl leading-[1.1] tracking-tight sm:tracking-normal md:tracking-tight break-words">
                                NOSSOS HOMENAGEADOS
                            </span>
                        </h2>
                        <p className="text-off-white/40 max-w-2xl mx-auto text-lg font-light italic mb-10">
                            Conheça os visionários e personalidades que brilham através de dedicação inabalável ao progresso de suas áreas e da sociedade.
                        </p>
                        <Link to="/homenageados" className="inline-flex items-center gap-4 px-10 py-4 glass-card text-gold text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-gold hover:text-navy-deep transition-all rounded-full border-gold/30">
                            Ver Todos os Notáveis
                            <span className="material-symbols-outlined text-sm">group</span>
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {honorees.map((honoree) => {
                            const profData = JSON.parse(honoree.professional_data || '{}');
                            return (
                                <Link key={honoree.id} to={`/homenageado/${honoree.id}`} className="group relative">
                                    <div className="aspect-[3/4.5] overflow-hidden rounded-[2.5rem] glass-card p-1 border-white/10 transition-all duration-500 group-hover:scale-[1.02]">
                                        <div className="relative h-full w-full overflow-hidden rounded-[2.3rem]">
                                            <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/10 to-transparent opacity-80 z-10"></div>
                                            <img
                                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-[1.5s]"
                                                src={honoree.photo_url || '/assets/default-fallback.png'}
                                                alt={profData.name}
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = '/assets/default-fallback.png';
                                                }}
                                            />
                                            <div className="absolute bottom-6 left-6 right-6 z-20">
                                                <span className="inline-block px-3 py-1 bg-gold/10 backdrop-blur-md border border-gold/20 rounded-full text-[8px] text-gold font-bold uppercase tracking-widest mb-3">
                                                    {honoree.awards?.name || 'Prêmio'}
                                                </span>
                                                <h4 className="text-xl font-bold text-off-white font-serif mb-1">{profData.name}</h4>
                                                <p className="text-[9px] text-off-white/40 uppercase tracking-[0.2em] font-medium mb-4">{profData.role || profData.external_role}</p>
                                                <div className="flex items-center gap-2 text-gold text-[8px] font-bold uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                                                    DETALHES <span className="material-symbols-outlined text-xs">arrow_forward</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>
        </div>
    );
}; export default HomePage;
