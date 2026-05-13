import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';

interface Award {
    id: string;
    name: string;
    description: string;
    image_url?: string;
}

interface Honoree {
    id: string;
    professional_data: string;
    photo_url: string;
}

const AwardDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [award, setAward] = useState<Award | null>(null);
    const [honorees, setHonorees] = useState<Honoree[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const { data: awardData } = await supabase
                .from('awards')
                .select('*')
                .eq('id', id)
                .single();

            if (awardData) setAward(awardData);

            const { data: honoreesData } = await supabase
                .from('honorees')
                .select('*')
                .eq('award_id', id)
                .eq('is_published', true);

            if (honoreesData) setHonorees(honoreesData as any);
        } catch (error) {
            console.error('Error fetching award details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full min-h-screen bg-transparent flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-blue"></div>
            </div>
        );
    }

    if (!award) {
        return (
            <div className="w-full min-h-screen bg-transparent flex flex-col items-center justify-center">
                <h2 className="text-3xl font-[800] mb-6 text-brand-dark">Prêmio não encontrado</h2>
                <Link to="/" className="btn-premium">Voltar para Início</Link>
            </div>
        );
    }

    return (
        <div className="w-full bg-transparent min-h-screen text-brand-dark font-sans relative">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <img src="/assets/tech_award_bg.png" alt="" className="w-full h-full object-cover opacity-50 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-b from-bg-main/60 via-bg-main/80 to-bg-main/95"></div>
            </div>

            <div className="max-w-[1280px] mx-auto px-6 lg:px-[80px] py-24 relative z-10">
                {/* Breadcrumbs */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 mb-12 text-[13px] font-semibold"
                >
                    <Link to="/" className="text-brand-text-secondary hover:text-brand-blue transition-colors">Início</Link>
                    <span className="text-brand-text-secondary/30">/</span>
                    <Link to="/premios" className="text-brand-text-secondary hover:text-brand-blue transition-colors">Prêmios</Link>
                    <span className="text-brand-text-secondary/30">/</span>
                    <span className="text-brand-blue">{award.name}</span>
                </motion.div>

                {/* Award Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="card-premium p-10 md:p-16 mb-16"
                >
                    <div className="flex flex-col md:flex-row gap-12 items-center md:items-start">
                        <div className="size-32 md:size-40 shrink-0 bg-white border-[3px] border-brand-blue flex items-center justify-center overflow-hidden shadow-xl shadow-brand-blue/20 rounded-2xl">
                            {award.image_url ? (
                                <img
                                    src={award.image_url}
                                    alt={award.name}
                                    className="w-full h-full object-contain p-3"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        target.parentElement!.innerHTML = '<span class="material-symbols-outlined text-brand-blue text-6xl">workspace_premium</span>';
                                    }}
                                />
                            ) : (
                                <span className="material-symbols-outlined text-brand-blue text-6xl">workspace_premium</span>
                            )}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-[40px] lg:text-[56px] font-[800] leading-[1.1] tracking-[-1px] mb-6 text-brand-dark">
                                {award.name}
                            </h1>
                            <p className="text-[18px] leading-[1.8] text-brand-text-secondary max-w-3xl">
                                {award.description} Esta honraria é concedida àqueles que demonstram um compromisso inabalável com a missão institucional do Grupo Ser Educacional.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Honorees Section */}
                <div className="space-y-10">
                    <div className="flex items-end justify-between border-b border-brand-gray pb-6">
                        <h3 className="text-[32px] font-[700] text-brand-dark">
                            Destaques <span className="text-gradient-main">Recentes</span>
                        </h3>
                        <Link to="/homenageados" className="text-[12px] font-[700] uppercase tracking-[0.15em] text-brand-blue hover:underline">
                            Ver Galeria Completa →
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
                                                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                                    src={honoree.photo_url || '/assets/default-fallback.png'}
                                                    alt={profData.name}
                                                    onError={(e) => { (e.target as HTMLImageElement).src = '/assets/default-fallback.png'; }}
                                                />
                                                <div className="absolute bottom-6 left-6 right-6 z-20">
                                                    <h4 className="text-[20px] font-bold text-white mb-1 leading-tight">{profData.name}</h4>
                                                    <p className="text-[12px] text-white/80 font-medium">{profData.role || profData.external_role}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>

                    {honorees.length === 0 && (
                        <div className="text-center py-16">
                            <p className="text-brand-text-secondary text-lg">Nenhum homenageado registrado nesta categoria ainda.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AwardDetailsPage;
