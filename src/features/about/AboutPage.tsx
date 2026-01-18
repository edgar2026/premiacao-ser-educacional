import React from 'react';

const AboutPage: React.FC = () => {
    return (
        <div className="w-full mesh-gradient-premium min-h-screen">
            <div className="max-w-5xl mx-auto px-6 py-32 animate-fade-in">
                <div className="text-center mb-24">
                    <span className="inline-block px-8 py-2.5 mb-10 text-[10px] font-bold tracking-[0.4em] text-gold uppercase border border-gold/30 rounded-full bg-navy-deep/40 backdrop-blur-2xl">
                        Nossa História
                    </span>
                    <h1 className="text-6xl md:text-8xl font-bold mb-10 tracking-tighter font-serif text-off-white">
                        O PROPÓSITO DO <br />
                        <span className="text-gold-gradient italic">RECONHECIMENTO</span>
                    </h1>
                </div>

                <div className="glass-card rounded-[3rem] p-12 md:p-20 border-white/5 space-y-16">
                    <section>
                        <h2 className="text-3xl font-serif text-gold mb-8 italic">Um Legado de Excelência</h2>
                        <p className="text-off-white/70 text-xl leading-relaxed font-light italic">
                            As Premiações Ser Educacional nasceram da convicção de que a educação é a força motriz da transformação social.
                            Mais do que um evento, esta plataforma é um registro vivo daqueles que, com coragem e intelecto,
                            desafiam o status quo e constroem novos horizontes para o conhecimento.
                        </p>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <h3 className="text-xl font-serif text-off-white italic">Missão de Honra</h3>
                            <p className="text-off-white/50 text-base leading-relaxed font-light">
                                Identificar e celebrar talentos que personificam os valores de meritocracia, inovação e compromisso ético,
                                servindo como referência para as futuras gerações de líderes.
                            </p>
                        </div>
                        <div className="space-y-6">
                            <h3 className="text-xl font-serif text-off-white italic">Visão de Futuro</h3>
                            <p className="text-off-white/50 text-base leading-relaxed font-light">
                                Consolidar-se como a mais prestigiosa distinção acadêmica e executiva do país,
                                fomentando um ecossistema de alta performance e impacto social duradouro.
                            </p>
                        </div>
                    </div>

                    <section className="pt-16 border-t border-white/10">
                        <blockquote className="text-center">
                            <p className="text-3xl md:text-4xl font-serif text-off-white italic mb-8 leading-tight">
                                "O reconhecimento é o combustível da alma que busca a perfeição."
                            </p>
                            <cite className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] not-italic">
                                — Conselho Superior de Excelência
                            </cite>
                        </blockquote>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
