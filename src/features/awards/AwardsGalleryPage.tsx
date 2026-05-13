import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';

interface Award {
    id: string;
    name: string;
    description: string;
    image_url?: string;
}

const AwardsGalleryPage: React.FC = () => {
    const [awards, setAwards] = useState<Award[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchAwards();
    }, []);

    const fetchAwards = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('awards')
                .select('*')
                .order('name');

            if (error) throw error;
            if (data) setAwards(data);
        } catch (error) {
            console.error('Error fetching awards:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredAwards = awards.filter(award =>
        award.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        award.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="w-full min-h-screen bg-transparent flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-blue"></div>
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

            <div className="max-w-[1600px] mx-auto px-6 lg:px-[60px] py-32 relative z-10">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-16"
                >
                    <h1 className="text-[48px] lg:text-[64px] font-[800] leading-[1] tracking-[-2px] mb-6 text-brand-dark">
                        Galeria de <br />
                        <span className="text-gradient-main">Prêmios</span>
                    </h1>
                    <p className="text-[18px] leading-[1.8] text-brand-text-secondary max-w-xl mb-10">
                        Explore todas as categorias de reconhecimento e excelência da Ser Educacional.
                    </p>

                    {/* Search */}
                    <div className="max-w-xl">
                        <div className="flex items-center gap-4 px-6 py-5 bg-white/80 backdrop-blur-md border border-brand-gray/50 rounded-2xl shadow-xl shadow-brand-blue/5 focus-within:border-brand-blue focus-within:ring-4 focus-within:ring-brand-blue/10 hover:border-brand-blue/60 hover:shadow-brand-blue/10 transition-all duration-300">
                            <span className="material-symbols-outlined text-brand-blue text-[24px]">search</span>
                            <input
                                type="text"
                                placeholder="Buscar prêmio por nome ou descrição..."
                                className="bg-transparent border-none outline-none text-brand-dark w-full text-[17px] font-medium placeholder:text-brand-text-secondary/50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredAwards.map((award, i) => (
                        <motion.div
                            key={award.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                        >
                            <Link to={`/premio/${award.id}`} className="group block h-full pt-14">
                                <div className="card-premium h-full relative overflow-visible flex flex-col text-center">
                                    {/* Imagem no topo */}
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 size-20 rounded-xl bg-white border-[3px] border-brand-blue shadow-xl shadow-brand-blue/20 flex items-center justify-center overflow-hidden z-20 group-hover:-translate-y-2 transition-all duration-300">
                                         {award.image_url ? (
                                             <img 
                                                 src={award.image_url} 
                                                 alt={award.name} 
                                                 className="w-full h-full object-contain p-2 transition-all duration-500"
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

                                    <div className="relative z-10 flex-1 flex flex-col pt-10">
                                        <h3 className="text-[26px] font-[800] mb-4 text-brand-dark tracking-tight group-hover:text-brand-blue transition-colors duration-300">
                                            {award.name}
                                        </h3>
                                        
                                        <p className="text-brand-text-secondary text-[17px] leading-[1.7] mb-10 line-clamp-3">
                                            {award.description}
                                        </p>
                                        <div className="mt-auto flex items-center justify-center gap-2 text-[12px] font-[700] uppercase tracking-[0.15em] text-brand-blue opacity-80 group-hover:opacity-100 transition-opacity pt-4 border-t border-brand-gray/50 w-full">
                                            Ver Detalhes
                                            <span className="material-symbols-outlined text-[16px] group-hover:translate-x-2 transition-transform duration-300">
                                                arrow_forward
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {filteredAwards.length === 0 && (
                    <div className="text-center py-20">
                        <span className="material-symbols-outlined text-6xl text-brand-text-secondary/30 mb-4 block">search_off</span>
                        <p className="text-brand-text-secondary text-xl">Nenhum prêmio encontrado.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AwardsGalleryPage;
