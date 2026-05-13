import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';
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
            const { data: mediaData } = await supabase
                .from('home_media')
                .select('*')
                .eq('is_active', true)
                .single();

            if (mediaData) setHomeMedia(mediaData);

            const { data: awardsData } = await supabase
                .from('awards')
                .select('*');

            if (awardsData) setAwards(awardsData);

            const { data: honoreesData } = await supabase
                .from('honorees')
                .select('*, awards(name)')
                .eq('is_published', true)
                .limit(8);

            if (honoreesData) setHonorees(honoreesData as any);

            const { data: allHonoreesData } = await supabase
                .from('honorees')
                .select('*')
                .eq('is_published', true);

            if (allHonoreesData) setAllHonorees(allHonoreesData);

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

        return Object.values(byAward).sort((a, b) => b.count - a.count).slice(0, 3);
    }, [allHonorees, awards, units, regionals, brands]);

    if (isLoading) {
        return (
            <div className="w-full min-h-screen bg-transparent flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-blue"></div>
            </div>
        );
    }

    return (
        <div className="w-full bg-transparent min-h-screen text-brand-dark overflow-hidden font-sans relative">

            {/* HERO SECTION - 100vh */}
            <motion.section 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="relative min-h-[100vh] flex items-center justify-center w-full"
            >
                <div className="max-w-[1600px] w-full mx-auto px-6 lg:px-[60px] relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24 pt-20">
                    
                    {/* Left Column - Text */}
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="flex-1 text-left"
                    >
                        <h1 className="text-[48px] lg:text-[72px] font-[800] leading-[1] tracking-[-2px] mb-6 text-brand-dark">
                            O Prêmio de <br />
                            <span className="text-gradient-main">Maior Prestígio</span>
                        </h1>

                        <p className="text-[20px] lg:text-[24px] font-[500] leading-[1.6] text-brand-dark mb-6">
                            Celebrando a excelência e inovação da Ser Educacional.
                        </p>

                        <p className="text-[16px] lg:text-[18px] leading-[1.8] text-brand-text-secondary max-w-xl mb-10">
                            {homeMedia?.description || 'Um ambiente de alta performance dedicado ao reconhecimento de talentos excepcionais, inovação constante e resultados institucionais que transformam a educação.'}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link to="/homenageados" className="btn-premium">
                                Conhecer Homenageados
                            </Link>
                            <Link to="/premios" className="btn-premium-outline bg-white/80 backdrop-blur-md">
                                Ver Categorias
                            </Link>
                        </div>
                    </motion.div>

                    {/* Right Column - Video */}
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="flex-[1.4] w-full relative"
                    >
                        <div className="absolute -inset-6 bg-gradient-to-tr from-brand-blue to-brand-blue-light opacity-20 blur-3xl"></div>
                        <div className="overflow-hidden relative z-10 aspect-video">
                            <PremiumVideoPlayer
                                src={homeMedia?.video_url || "https://assets.mixkit.co/videos/preview/mixkit-awards-ceremony-with-golden-confetti-42442-large.mp4"}
                                poster={homeMedia?.image_url || "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=2071"}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </motion.div>
                </div>
            </motion.section>

            {/* SEÇÃO 1: CATEGORIAS (TEXTO + CARDS) */}
            <motion.section 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="py-[120px] relative w-full" 
                id="premios"
            >
                <div className="max-w-[1600px] mx-auto px-6 lg:px-[60px]">
                    <div className="flex flex-col lg:flex-row gap-20 items-center">
                        <div className="flex-1">
                            <h2 className="text-[40px] lg:text-[48px] font-[700] leading-[1.2] tracking-tight text-brand-dark mb-6">
                                Categorias de <br />
                                <span className="text-gradient-main">Excelência</span>
                            </h2>
                            <p className="text-[18px] leading-[1.8] text-brand-text-secondary mb-10">
                                Exploramos as fronteiras da inovação, reconhecendo indivíduos e unidades que se destacam pela alta performance e gestão de qualidade inquestionável.
                            </p>
                            <Link to="/premios" className="btn-premium-outline">
                                Explorar Todas
                            </Link>
                        </div>

                        <div className="flex-[1.5] w-full grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-brand-blue-light/40 rounded-full blur-[100px] -z-10"></div>
                            {awards.slice(0, 4).map((award, i) => (
                                <Link to={`/premio/${award.id}`} key={award.id} className="group block h-full pt-14">
                                    <div className="card-premium h-full relative overflow-visible flex flex-col text-center">
                                        
                                        {/* Container da Imagem Centralizado no Topo */}
                                        {/* Container da Imagem Centralizado no Topo */}
                                        {/* Container da Imagem Centralizado no Topo */}
                                        {/* Container da Imagem Centralizado no Topo */}
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 size-20 rounded-xl bg-white border-[3px] border-brand-blue shadow-xl shadow-brand-blue/20 flex items-center justify-center overflow-hidden z-20 group-hover:-translate-y-2 transition-all duration-300">
                                            {award.image_url ? (
                                                <img 
                                                    src={award.image_url} 
                                                    alt={award.name} 
                                                    className="w-full h-full object-contain p-2 transform group-hover:scale-110 transition-transform duration-500"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                        target.parentElement!.innerHTML = '<span class="material-symbols-outlined text-[32px] text-brand-blue flex h-full w-full items-center justify-center">emoji_events</span>';
                                                    }}
                                                />
                                            ) : (
                                                <span className="material-symbols-outlined text-[32px] text-brand-blue">emoji_events</span>
                                            )}
                                        </div>

                                        {/* Efeito de brilho no hover */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-brand-blue-light/60 to-transparent rounded-bl-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 ease-out z-0"></div>
                                        
                                        <div className="relative z-10 flex-1 flex flex-col pt-10">
                                            <h3 className="text-[26px] font-[800] mb-4 text-brand-dark tracking-tight group-hover:text-brand-blue transition-colors duration-300">
                                                {award.name}
                                            </h3>
                                            
                                            <p className="text-brand-text-secondary text-[17px] leading-[1.7] mb-10 line-clamp-3">
                                                {award.description}
                                            </p>
                                            
                                            <div className="mt-auto flex items-center justify-center gap-2 text-[12px] font-[700] uppercase tracking-[0.15em] text-brand-blue opacity-80 group-hover:opacity-100 transition-opacity pt-4 border-t border-brand-gray/50 w-full">
                                                Explorar
                                                <span className="material-symbols-outlined text-[16px] group-hover:translate-x-2 transition-transform duration-300">
                                                    arrow_forward
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* SEÇÃO 2: HOMENAGEADOS (TEXTO CENTRALIZADO + GRID DE CARDS) */}
            <motion.section 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1 }}
                className="py-[120px] relative" 
                id="homenageados"
            >
                <div className="max-w-[1600px] mx-auto px-6 lg:px-[60px] relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
                        <div>
                            <h2 className="text-[40px] lg:text-[48px] font-[700] leading-[1.2] tracking-tight text-brand-dark mb-4">
                                Destaques do <br />
                                <span className="text-gradient-main">Ano Educacional</span>
                            </h2>
                        </div>
                        <Link to="/homenageados" className="btn-premium-outline">
                            Ver Galeria Completa
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {honorees.map((honoree) => {
                            const profData = JSON.parse(honoree.professional_data || '{}');
                            return (
                                <motion.div 
                                    key={honoree.id}
                                    whileHover={{ y: -10 }}
                                    transition={{ duration: 0.4 }}
                                >
                                    <Link to={`/homenageado/${honoree.id}`} className="group relative block h-full">
                                        <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-white p-2 border border-brand-gray shadow-sm hover:shadow-2xl hover:border-brand-blue-light transition-all duration-400">
                                            <div className="relative h-full w-full overflow-hidden rounded-xl bg-brand-dark">
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-transparent opacity-90 z-10 group-hover:opacity-100 transition-opacity"></div>
                                                
                                                <img
                                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out"
                                                    src={honoree.photo_url || '/assets/default-fallback.png'}
                                                    alt={profData.name}
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = '/assets/default-fallback.png';
                                                    }}
                                                />
                                                
                                                <div className="absolute bottom-6 left-6 right-6 z-20">
                                                    <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-none text-[10px] text-white font-bold uppercase tracking-widest mb-3 border border-white/20">
                                                        {honoree.awards?.name || 'Prêmio'}
                                                    </span>
                                                    <h4 className="text-[20px] font-bold text-white font-display mb-1 leading-tight">{profData.name}</h4>
                                                    <p className="text-[12px] text-white/80 font-medium">{profData.role || profData.external_role}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </motion.section>

            {/* SEÇÃO 3: DADOS (ILUSTRAÇÃO + DADOS) */}
            <motion.section 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="py-[120px] relative border-y border-brand-gray/20 bg-white/30 backdrop-blur-sm" 
                id="ranking"
            >
                <div className="max-w-[1600px] mx-auto px-6 lg:px-[60px]">
                    <div className="flex flex-col lg:flex-row-reverse gap-20 items-center">
                        <div className="flex-1">
                            <h2 className="text-[40px] lg:text-[48px] font-[700] leading-[1.2] tracking-tight text-brand-dark mb-6">
                                Impacto em <br />
                                <span className="text-gradient-main">Números</span>
                            </h2>
                            <p className="text-[18px] leading-[1.8] text-brand-text-secondary mb-10">
                                As categorias com maior volume de reconhecimento distribuído através de nossas unidades e marcas, refletindo nosso compromisso com a escalabilidade do sucesso corporativo.
                            </p>
                        </div>

                        <div className="flex-[1.5] w-full flex flex-col gap-6 relative">
                            {rankingData.map((award: any, i: number) => (
                                <div key={i} className="card-premium flex items-center gap-6 !p-6 lg:!p-8 !rounded-2xl">
                                    <div className="size-16 rounded-xl bg-brand-gray flex items-center justify-center text-3xl font-black text-brand-blue">
                                        {i + 1}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-brand-dark mb-1">{award.name}</h3>
                                        <p className="text-sm text-brand-text-secondary">{Object.keys(award.units).length} Unidades premiadas</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-4xl font-black text-brand-dark tracking-tighter">{award.count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.section>
        </div>
    );
}; 

export default HomePage;
