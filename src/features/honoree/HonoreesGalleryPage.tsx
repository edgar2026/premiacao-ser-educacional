import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

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
            // Fetch Published Honorees
            const { data: honoreesData } = await supabase
                .from('honorees')
                .select('*, awards(name)')
                .eq('is_published', true);

            if (honoreesData) {
                setHonorees(honoreesData as any);

                // Extract unique award names for filters
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
            <div className="w-full min-h-screen mesh-gradient-premium flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gold"></div>
            </div>
        );
    }

    return (
        <div className="w-full mesh-gradient-premium min-h-screen">
            <div className="max-w-7xl mx-auto px-6 py-20">
                {/* Header */}
                <div className="text-center mb-16 animate-fade-in">
                    <span className="text-gold text-[10px] font-bold uppercase tracking-[0.5em] mb-6 block">Legado de Excelência</span>
                    <h1 className="text-5xl md:text-8xl font-bold text-off-white font-serif uppercase italic mb-8">
                        Galeria de <span className="text-gold-gradient">Notáveis</span>
                    </h1>
                    <p className="text-off-white/40 max-w-2xl mx-auto text-xl font-light italic leading-relaxed">
                        Um registro histórico dos líderes, acadêmicos e colaboradores que moldam o futuro da educação através de sua dedicação inabalável.
                    </p>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col md:flex-row gap-8 items-center justify-between mb-16">
                    <div className="relative w-full md:max-w-md group">
                        <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-off-white/20 group-focus-within:text-gold transition-colors">search</span>
                        <input
                            type="text"
                            placeholder="Buscar por nome ou cargo..."
                            className="w-full bg-white/[0.03] border border-white/10 pl-16 pr-8 py-5 rounded-3xl text-off-white focus:border-gold/40 outline-none transition-all placeholder:text-off-white/10 italic"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-wrap gap-4 justify-center">
                        {filters.map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-8 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeFilter === filter ? 'bg-gold text-navy-deep shadow-[0_10px_30px_rgba(212,175,55,0.3)]' : 'glass-card text-off-white/40 hover:text-off-white hover:bg-white/5'}`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                {filteredHonorees.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                        {filteredHonorees.map((honoree) => {
                            const profData = JSON.parse(honoree.professional_data || '{}');
                            return (
                                <Link key={honoree.id} to={`/homenageado/${honoree.id}`} className="group">
                                    <div className="relative aspect-[3/4.5] overflow-hidden rounded-[3rem] glass-card p-1 border-white/10 transition-all duration-700 group-hover:-translate-y-4">
                                        <div className="relative h-full w-full overflow-hidden rounded-[2.8rem]">
                                            <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/20 to-transparent opacity-90 z-10"></div>
                                            <img
                                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 transform group-hover:scale-110"
                                                src={honoree.photo_url || 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=2071'}
                                                alt={profData.name}
                                            />
                                            <div className="absolute bottom-8 left-8 right-8 z-20">
                                                <span className="inline-block px-4 py-1.5 bg-gold/10 backdrop-blur-md border border-gold/20 rounded-full text-[8px] text-gold font-bold uppercase tracking-widest mb-4">
                                                    {honoree.awards?.name || 'Prêmio'}
                                                </span>
                                                <h4 className="text-2xl font-bold text-off-white font-serif mb-2 italic">{profData.name}</h4>
                                                <p className="text-[10px] text-off-white/40 uppercase tracking-[0.2em] font-medium mb-6">{profData.role || profData.external_role}</p>

                                                <div className="flex items-center gap-3 text-gold text-[9px] font-bold uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                                                    DETALHES <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-40 text-center">
                        <span className="material-symbols-outlined text-6xl text-off-white/10 mb-6">search_off</span>
                        <h3 className="text-2xl font-serif text-off-white/40 italic">Nenhum notável encontrado</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HonoreesGalleryPage;
