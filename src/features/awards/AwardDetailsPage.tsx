import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

import { supabase } from '../../lib/supabase';

interface Award {
    id: string;
    name: string;
    description: string;
    image_url?: string;
    criteria?: { title: string; desc: string }[];
    cycle_info?: {
        edition: string;
        description: string;
        button_text: string;
        button_link: string;
    };
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
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch Award Details
            const { data: awardData } = await supabase
                .from('awards')
                .select('*')
                .eq('id', id)
                .single();

            if (awardData) setAward(awardData);

            // Fetch Honorees for this Award
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
            <div className="w-full min-h-screen mesh-gradient-premium flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gold"></div>
            </div>
        );
    }

    if (!award) {
        return (
            <div className="w-full min-h-screen mesh-gradient-premium flex flex-col items-center justify-center text-off-white">
                <h2 className="text-4xl font-serif italic mb-6">Prêmio não encontrado</h2>
                <Link to="/" className="text-gold uppercase tracking-widest font-bold text-sm border-b border-gold/30 pb-1">Voltar para Início</Link>
            </div>
        );
    }

    return (
        <div className="w-full mesh-gradient-premium min-h-screen">
            <div className="max-w-7xl mx-auto px-6 py-20">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-4 mb-12 animate-fade-in">
                    <Link to="/" className="text-off-white/40 text-[10px] font-bold uppercase tracking-[0.3em] hover:text-gold transition-colors">Início</Link>
                    <span className="text-gold/30 text-xs">/</span>
                    <span className="text-gold text-[10px] font-bold uppercase tracking-[0.3em]">{award.name}</span>
                </div>

                {/* Header Section */}
                <div className="relative glass-card rounded-[3rem] p-12 md:p-20 mb-16 overflow-hidden border-white/5">
                    <div className="absolute -top-24 -right-24 size-96 bg-gold/10 rounded-full blur-[100px] pointer-events-none"></div>
                    <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center md:items-start">
                        <div className="size-32 md:size-48 rounded-[2rem] overflow-hidden bg-gold/5 flex items-center justify-center border border-gold/20 shadow-[0_0_50px_rgba(212,175,55,0.1)]">
                            {award.image_url ? (
                                <img
                                    src={award.image_url}
                                    alt={award.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        target.parentElement!.innerHTML = '<span class="material-symbols-outlined text-gold text-6xl">workspace_premium</span>';
                                    }}
                                />
                            ) : (
                                <span className="material-symbols-outlined text-gold text-5xl md:text-6xl">workspace_premium</span>
                            )}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="font-serif text-5xl md:text-7xl text-off-white font-bold mb-6 italic">{award.name}</h1>
                            <p className="text-off-white/60 text-xl leading-relaxed font-light italic max-w-3xl">
                                {award.description} Esta honraria é concedida àqueles que demonstram um compromisso inabalável com a missão institucional do Grupo Ser Educacional, elevando os padrões de excelência e inspirando toda a comunidade.
                            </p>
                        </div>
                    </div>
                </div>


                {/* Featured Honorees in this Category */}
                <div className="space-y-12">
                    <div className="flex items-end justify-between border-b border-white/10 pb-8">
                        <h3 className="font-serif text-4xl text-off-white italic">Destaques Recentes</h3>
                        <Link to="/homenageados" className="text-gold text-[10px] font-bold uppercase tracking-[0.3em] hover:underline">Ver Galeria Completa</Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {honorees.map((honoree) => {
                            const profData = JSON.parse(honoree.professional_data || '{}');
                            return (
                                <Link key={honoree.id} to={`/homenageado/${honoree.id}`} className="group relative">
                                    <div className="aspect-[3/4] overflow-hidden rounded-[2.5rem] glass-card p-1 border-white/10 transition-all duration-500 group-hover:scale-[1.02]">
                                        <div className="relative h-full w-full overflow-hidden rounded-[2.3rem]">
                                            <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/20 to-transparent opacity-80 z-10"></div>
                                            <img
                                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-[2s]"
                                                src={honoree.photo_url || '/assets/default-fallback.png'}
                                                alt={profData.name}
                                            />
                                            <div className="absolute bottom-6 left-6 right-6 z-20">
                                                <h4 className="text-lg font-bold text-off-white font-serif mb-1">{profData.name}</h4>
                                                <p className="text-[8px] text-off-white/40 uppercase tracking-[0.2em] font-medium">{profData.role || profData.external_role}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AwardDetailsPage;
