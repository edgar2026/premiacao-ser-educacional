import React from 'react';
import GlassCard from '../../components/ui/GlassCard';

const TimelinePage: React.FC = () => {
    const milestones = [
        { year: '2024', title: 'Edição de Gala', description: 'Expansão para categorias internacionais e foco em IA na educação.' },
        { year: '2023', title: 'Década de Ouro', description: 'Celebração de 10 anos de premiações ininterruptas.' },
        { year: '2022', title: 'Inovação Pós-Pandemia', description: 'Reconhecimento de metodologias híbridas e resiliência acadêmica.' },
        { year: '2021', title: 'Transformação Digital', description: 'Foco total em tecnologias educacionais e alcance global.' },
    ];

    return (
        <div className="w-full mesh-gradient-premium min-h-screen">
            <div className="max-w-6xl mx-auto px-6 py-32 animate-fade-in">
                <div className="text-center mb-28">
                    <span className="inline-block px-8 py-2.5 mb-10 text-[10px] font-bold tracking-[0.4em] text-gold uppercase border border-gold/30 rounded-full bg-navy-deep/40 backdrop-blur-2xl">
                        Jornada Histórica
                    </span>
                    <h1 className="text-6xl md:text-8xl font-bold mb-10 tracking-tighter font-serif text-off-white uppercase">
                        LINHA DO <span className="text-gold-gradient italic">TEMPO</span>
                    </h1>
                </div>

                <div className="relative space-y-24 before:content-[''] before:absolute before:top-0 before:bottom-0 before:left-1/2 before:-translate-x-1/2 before:w-[1px] before:bg-gradient-to-b before:from-gold before:via-gold/20 before:to-transparent hidden md:block">
                    {milestones.map((m, i) => (
                        <div key={m.year} className={`relative flex items-center justify-between w-full ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                            <div className="w-[45%]">
                                <GlassCard className="p-10 rounded-[2.5rem] border-white/5 hover:bg-white/[0.05] transition-all duration-700 group">
                                    <span className="text-gold text-5xl font-serif font-bold mb-6 block group-hover:scale-110 transition-transform">{m.year}</span>
                                    <h3 className="text-2xl font-serif text-off-white mb-4 italic">{m.title}</h3>
                                    <p className="text-off-white/50 text-lg font-light leading-relaxed italic">{m.description}</p>
                                </GlassCard>
                            </div>
                            <div className="absolute left-1/2 -translate-x-1/2 size-4 bg-gold rounded-full shadow-[0_0_20px_rgba(212,175,55,1)] z-10"></div>
                            <div className="w-[45%]"></div>
                        </div>
                    ))}
                </div>

                {/* Mobile Timeline */}
                <div className="md:hidden space-y-12 relative before:content-[''] before:absolute before:top-0 before:bottom-0 before:left-4 before:w-[1px] before:bg-gold/30">
                    {milestones.map((m) => (
                        <div key={m.year} className="relative pl-12">
                            <div className="absolute left-3 top-2 size-3 bg-gold rounded-full shadow-[0_0_15px_rgba(212,175,55,1)]"></div>
                            <GlassCard className="p-8 rounded-[2rem] border-white/5">
                                <span className="text-gold text-3xl font-serif font-bold mb-4 block">{m.year}</span>
                                <h3 className="text-xl font-serif text-off-white mb-2 italic">{m.title}</h3>
                                <p className="text-off-white/50 text-base font-light leading-relaxed italic">{m.description}</p>
                            </GlassCard>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TimelinePage;
