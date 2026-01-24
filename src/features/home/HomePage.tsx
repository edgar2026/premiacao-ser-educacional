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
    const [allHonorees, setAllHonorees] = useState<any[]>([]);
    const [units, setUnits] = useState<any[]>([]);
    const [regionals, setRegionals] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
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
                .select('*');

            if (awardsData) setAwards(awardsData);

            // Fetch Published Honorees (Limited for gallery)
            const { data: honoreesData } = await supabase
                .from('honorees')
                .select('*, awards(name)')
                .eq('is_published', true)
                .limit(4);

            if (honoreesData) setHonorees(honoreesData as any);

            // Fetch All Published Honorees for Ranking
            const { data: allHonoreesData } = await supabase
                .from('honorees')
                .select('*')
                .eq('is_published', true);

            if (allHonoreesData) setAllHonorees(allHonoreesData);

            // Fetch Units, Regionals, Brands for Ranking
            const [unitsRes, regionalsRes, brandsRes] = await Promise.all([
                supabase.from('units').select('*'),
                supabase.from('regionals').select('*'),
                supabase.from('brands').select('*')
            ]);

            if (unitsRes.data) setUnits(unitsRes.data);
            if (regionalsRes.data) setRegionals(regionalsRes.data);
            if (brandsRes.data) setBrands(brandsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const rankingData = React.useMemo(() => {
        const byAward: {
            [key: string]: {
                name: string;
                count: number;
                regionals: { [key: string]: { name: string; count: number } };
                units: { [key: string]: { name: string; count: number } };
                brands: { [key: string]: { name: string; count: number } };
            }
        } = {};

        allHonorees.forEach(h => {
            const award = awards.find(a => a.id === h.award_id);
            const unit = units.find(u => u.id === h.unit_id);
            const brand = brands.find(b => b.id === h.brand_id);
            const regional = regionals.find(r => r.id === unit?.regional_id);

            if (award) {
                if (!byAward[award.id]) {
                    byAward[award.id] = { name: award.name, count: 0, regionals: {}, units: {}, brands: {} };
                }
                byAward[award.id].count++;

                if (regional) {
                    if (!byAward[award.id].regionals[regional.id]) {
                        byAward[award.id].regionals[regional.id] = { name: regional.name, count: 0 };
                    }
                    byAward[award.id].regionals[regional.id].count++;
                }

                if (unit) {
                    if (!byAward[award.id].units[unit.id]) {
                        byAward[award.id].units[unit.id] = { name: unit.name, count: 0 };
                    }
                    byAward[award.id].units[unit.id].count++;
                }

                if (brand) {
                    if (!byAward[award.id].brands[brand.id]) {
                        byAward[award.id].brands[brand.id] = { name: brand.name, count: 0 };
                    }
                    byAward[award.id].brands[brand.id].count++;
                }
            }
        });

        return Object.values(byAward).sort((a, b) => b.count - a.count).slice(0, 5);
    }, [allHonorees, awards, units, regionals, brands]);

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
                                <div className="size-24 mb-8 rounded-2xl overflow-hidden bg-gold/5 flex items-center justify-center group-hover:bg-gold/10 transition-all duration-500 border border-gold/10">
                                    {award.image_url ? (
                                        <img
                                            src={award.image_url}
                                            alt={award.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                target.parentElement!.innerHTML = '<span class="material-symbols-outlined text-gold text-4xl">workspace_premium</span>';
                                            }}
                                        />
                                    ) : (
                                        <span className="material-symbols-outlined text-gold group-hover:text-navy-deep text-4xl">workspace_premium</span>
                                    )}
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

            {/* Ranking Section */}
            <section className="py-32 relative overflow-hidden" id="ranking">
                {/* Decorative Elements */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] -z-10"></div>
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[120px] -z-10"></div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="flex flex-col items-center text-center mb-20 gap-6">
                        <span className="text-gold text-[10px] font-bold uppercase tracking-[0.5em] mb-2">Performance & Reconhecimento</span>
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-off-white font-serif uppercase tracking-tight">
                            PREMIAÇÕES <span className="text-gold-gradient italic pr-2">ENTREGUES</span>
                        </h2>
                        <div className="h-1 w-32 bg-gold/30 rounded-full"></div>
                        <p className="text-off-white/40 max-w-3xl text-xl font-light leading-relaxed italic">
                            A elite da excelência: as categorias com maior volume de reconhecimento e mérito distribuído em todo o grupo.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-7xl mx-auto">
                        {rankingData.map((award: any, i: number) => (
                            <div key={i} className="group relative pt-12">
                                {/* Top Rank Medallion */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 size-24 rounded-full bg-navy-deep border-2 border-gold/30 flex items-center justify-center z-20 shadow-[0_0_40px_rgba(212,175,55,0.2)] group-hover:border-gold group-hover:shadow-[0_0_60px_rgba(212,175,55,0.4)] transition-all duration-700 overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-b from-gold/10 to-transparent opacity-50"></div>
                                    <span className="text-3xl font-serif italic text-gold relative z-10">
                                        #{(i + 1).toString().padStart(2, '0')}
                                    </span>
                                </div>

                                <div className="relative h-full flex flex-col items-center p-10 pt-20 rounded-[4rem] bg-white/[0.02] border border-white/5 hover:border-gold/40 transition-all duration-700 hover:bg-white/[0.05] text-center overflow-hidden">
                                    {/* Decorative Inner Glow */}
                                    <div className="absolute -top-24 -left-24 size-48 bg-gold/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                                    <h3 className="text-2xl font-bold text-off-white font-serif mb-6 group-hover:text-gold transition-colors duration-500 leading-tight">{award.name}</h3>

                                    <div className="flex flex-col items-center mb-10 relative z-10">
                                        <span className="text-6xl font-bold text-gold-gradient gold-glow mb-2">{award.count}</span>
                                        <span className="text-[10px] text-off-white/30 uppercase tracking-[0.5em] font-black">Láureas Totais</span>
                                    </div>

                                    {/* Bottom Stats Badges */}
                                    <div className="flex flex-wrap justify-center gap-3 mt-auto relative z-10">
                                        <div className="px-5 py-2.5 rounded-2xl bg-gold/5 border border-gold/10 text-[9px] text-gold font-bold uppercase tracking-widest flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[12px]">public</span>
                                            {Object.keys(award.regionals).length} Regionais
                                        </div>
                                        <div className="px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-[9px] text-off-white/40 font-bold uppercase tracking-widest flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[12px]">location_city</span>
                                            {Object.keys(award.units).length} Unidades
                                        </div>
                                    </div>

                                    {/* Premium Hover Panel */}
                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-[110%] w-[600px] p-12 bg-navy-deep/98 backdrop-blur-[60px] border border-gold/40 rounded-[4rem] shadow-[0_60px_150px_rgba(0,0,0,0.95)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-700 z-[100] pointer-events-none scale-90 group-hover:scale-100 origin-bottom">
                                        <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-8">
                                            <div>
                                                <h4 className="text-3xl font-serif italic text-gold mb-2">{award.name}</h4>
                                                <p className="text-[11px] text-off-white/40 uppercase tracking-[0.4em]">Detalhamento de Distribuição</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-5xl font-bold text-off-white font-serif italic">{award.count}</span>
                                                <p className="text-[9px] text-gold uppercase tracking-[0.3em] font-black">Total</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-8">
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="material-symbols-outlined text-gold text-sm">public</span>
                                                    <p className="text-[11px] font-black text-gold uppercase tracking-widest">Regionais</p>
                                                </div>
                                                <div className="space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar pr-3">
                                                    {Object.values(award.regionals).sort((a: any, b: any) => b.count - a.count).map((reg: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between items-center bg-white/[0.04] p-4 rounded-2xl border border-white/5">
                                                            <p className="text-[11px] text-off-white/80 font-medium truncate pr-2">{reg.name}</p>
                                                            <p className="text-[11px] font-black text-gold">{reg.count}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="material-symbols-outlined text-gold text-sm">hub</span>
                                                    <p className="text-[11px] font-black text-gold uppercase tracking-widest">Marcas</p>
                                                </div>
                                                <div className="space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar pr-3">
                                                    {Object.values(award.brands).sort((a: any, b: any) => b.count - a.count).map((brand: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between items-center bg-white/[0.04] p-4 rounded-2xl border border-white/5">
                                                            <p className="text-[11px] text-off-white/80 font-medium truncate pr-2">{brand.name}</p>
                                                            <p className="text-[11px] font-black text-gold">{brand.count}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="material-symbols-outlined text-gold text-sm">location_city</span>
                                                    <p className="text-[11px] font-black text-gold uppercase tracking-widest">Unidades</p>
                                                </div>
                                                <div className="space-y-3 max-h-[250px] overflow-y-auto custom-scrollbar pr-3">
                                                    {Object.values(award.units).sort((a: any, b: any) => b.count - a.count).map((unit: any, idx: number) => (
                                                        <div key={idx} className="flex justify-between items-center bg-white/[0.04] p-4 rounded-2xl border border-white/5">
                                                            <p className="text-[11px] text-off-white/80 font-medium truncate pr-2">{unit.name}</p>
                                                            <p className="text-[11px] font-black text-gold">{unit.count}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}; export default HomePage;
