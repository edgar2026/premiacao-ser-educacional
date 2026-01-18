import React from 'react';
import GlassCard from '../../components/ui/GlassCard';

const PartnersPage: React.FC = () => {
    const partners = [
        { name: 'Fundação de Amparo', type: 'Parceiro Estratégico', logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=300' },
        { name: 'Instituto de Inovação', type: 'Apoiador Institucional', logo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=300' },
        { name: 'Global Education Group', type: 'Parceiro Internacional', logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=300' },
        { name: 'Tech Excellence', type: 'Patrocinador Master', logo: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=300' },
    ];

    return (
        <div className="w-full mesh-gradient-premium min-h-screen">
            <div className="max-w-7xl mx-auto px-6 py-32 animate-fade-in">
                <div className="text-center mb-28">
                    <span className="inline-block px-8 py-2.5 mb-10 text-[10px] font-bold tracking-[0.4em] text-gold uppercase border border-gold/30 rounded-full bg-navy-deep/40 backdrop-blur-2xl">
                        Alianças de Valor
                    </span>
                    <h1 className="text-6xl md:text-8xl font-bold mb-10 tracking-tighter font-serif text-off-white uppercase">
                        PARCEIROS E <span className="text-gold-gradient italic">APOIADORES</span>
                    </h1>
                    <p className="text-off-white/60 max-w-2xl mx-auto text-xl font-light leading-relaxed italic">
                        Instituições que compartilham nossa visão de excelência e tornam este reconhecimento possível.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                    {partners.map((partner) => (
                        <GlassCard key={partner.name} className="p-12 rounded-[2.5rem] flex flex-col items-center text-center group hover:-translate-y-4 transition-all duration-700 border-white/5 bg-white/[0.02]">
                            <div className="size-32 mb-10 rounded-full overflow-hidden border border-gold/20 p-1.5 glass-card group-hover:border-gold transition-all duration-700">
                                <img src={partner.logo} alt={partner.name} className="w-full h-full object-cover rounded-full grayscale group-hover:grayscale-0 transition-all duration-1000" />
                            </div>
                            <h3 className="text-2xl font-serif font-bold text-off-white mb-3 italic">{partner.name}</h3>
                            <span className="text-[10px] font-bold text-gold uppercase tracking-[0.3em]">{partner.type}</span>
                        </GlassCard>
                    ))}
                </div>

                <div className="mt-40 text-center">
                    <button className="px-16 py-6 glass-card rounded-full text-off-white font-bold text-[11px] uppercase tracking-[0.4em] hover:bg-gold hover:text-navy-deep transition-all duration-700 border-gold/30">
                        Torne-se um Parceiro Institucional
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PartnersPage;
