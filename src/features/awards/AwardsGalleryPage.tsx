import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import GlassCard from '../../components/ui/GlassCard';
import { supabase } from '../../lib/supabase';

interface Award {
    id: string;
    name: string;
    description: string;
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
            <div className="w-full min-h-screen mesh-gradient-premium flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gold"></div>
            </div>
        );
    }

    return (
        <div className="w-full mesh-gradient-premium min-h-screen">
            <div className="max-w-7xl mx-auto px-6 py-32 animate-fade-in">
                <div className="text-center mb-20">
                    <span className="inline-block px-8 py-2.5 mb-10 text-[10px] font-bold tracking-[0.4em] text-gold uppercase border border-gold/30 rounded-full bg-navy-deep/40 backdrop-blur-2xl">
                        Reconhecimento e Prestígio
                    </span>
                    <h1 className="text-6xl md:text-8xl font-bold mb-10 tracking-tighter font-serif text-off-white uppercase">
                        GALERIA DE <span className="text-gold-gradient italic">PRÊMIOS</span>
                    </h1>

                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto relative group">
                        <div className="absolute inset-0 bg-gold/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        <div className="relative flex items-center glass-card rounded-full px-8 py-4 border-white/10 focus-within:border-gold/50 transition-all duration-500">
                            <span className="material-symbols-outlined text-gold/50 mr-4">search</span>
                            <input
                                type="text"
                                placeholder="Buscar prêmio por nome ou descrição..."
                                className="bg-transparent border-none outline-none text-off-white w-full font-light italic placeholder:text-white/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {filteredAwards.map((award) => (
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

                {filteredAwards.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-off-white/40 font-serif italic text-2xl">Nenhum prêmio encontrado para sua busca.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AwardsGalleryPage;
