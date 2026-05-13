import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';

interface Honoree {
    id: string;
    professional_data: string;
    photo_url: string;
    award_id: string;
    is_published: boolean;
    awards?: { name: string };
}

const HonoreesGalleryPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('Todos');
    const [honorees, setHonorees] = useState<Honoree[]>([]);
    const [filters, setFilters] = useState<string[]>(['Todos']);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const { data: honoreesData } = await supabase
                .from('honorees')
                .select('*, awards(name)')
                .eq('is_published', true);

            if (honoreesData) {
                setHonorees(honoreesData as any);
                const awardNames = Array.from(new Set(honoreesData.map(h => (h as any).awards?.name).filter(Boolean))) as string[];
                setFilters(['Todos', ...awardNames]);
            }
        } catch (error) {
            console.error('Error fetching honorees:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredHonorees = honorees.filter(h => {
        const profData = JSON.parse(h.professional_data || '{}');
        const name = profData.name || '';
        const role = profData.role || profData.external_role || '';
        const awardName = h.awards?.name || '';

        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            role.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = activeFilter === 'Todos' || awardName === activeFilter;
        return matchesSearch && matchesFilter;
    });

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
                        <span className="text-gradient-main">Homenageados</span>
                    </h1>
                    <p className="text-[18px] leading-[1.8] text-brand-text-secondary max-w-xl mb-10">
                        Um registro dos líderes e colaboradores que moldam o futuro da educação através de sua dedicação.
                    </p>
                </motion.div>

                {/* Search & Filters */}
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between mb-12">
                    <div className="w-full md:max-w-xl">
                        <div className="flex items-center gap-4 px-6 py-5 bg-white/80 backdrop-blur-md border border-brand-gray/50 rounded-2xl shadow-xl shadow-brand-blue/5 focus-within:border-brand-blue focus-within:ring-4 focus-within:ring-brand-blue/10 hover:border-brand-blue/60 hover:shadow-brand-blue/10 transition-all duration-300">
                            <span className="material-symbols-outlined text-brand-blue text-[24px]">search</span>
                            <input
                                type="text"
                                placeholder="Buscar por nome, cargo ou prêmio..."
                                className="bg-transparent border-none outline-none text-brand-dark w-full text-[17px] font-medium placeholder:text-brand-text-secondary/50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {filters.map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-5 py-2.5 rounded-xl text-[12px] font-[800] uppercase tracking-wider transition-all duration-300 border-2 ${
                                    activeFilter === filter
                                        ? 'bg-[#1D4ED8] text-white border-[#1D4ED8]'
                                        : 'bg-white text-[#0F172A] border-[#E2E8F0] hover:bg-[#1D4ED8] hover:text-white hover:border-[#1D4ED8]'
                                }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                {filteredHonorees.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {filteredHonorees.map((honoree, i) => {
                            const profData = JSON.parse(honoree.professional_data || '{}');
                            return (
                                <motion.div
                                    key={honoree.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: i * 0.05 }}
                                    whileHover={{ y: -10 }}
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
                                                    <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-none text-[10px] text-white font-bold uppercase tracking-widest mb-3 border border-white/20">
                                                        {honoree.awards?.name || 'Prêmio'}
                                                    </span>
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
                ) : (
                    <div className="py-20 text-center">
                        <span className="material-symbols-outlined text-6xl text-brand-text-secondary/30 mb-4 block">search_off</span>
                        <p className="text-brand-text-secondary text-xl">Nenhum homenageado encontrado.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HonoreesGalleryPage;
