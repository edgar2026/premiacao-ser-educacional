import React from 'react';
import { motion } from 'framer-motion';

const AboutPage: React.FC = () => {
    return (
        <div className="w-full bg-transparent min-h-screen text-brand-dark font-sans relative">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <img src="/assets/tech_award_bg.png" alt="" className="w-full h-full object-cover opacity-50 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-b from-bg-main/60 via-bg-main/80 to-bg-main/95"></div>
            </div>

            <div className="max-w-[1280px] mx-auto px-6 lg:px-[80px] py-32 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-24"
                >
                    <span className="inline-block px-6 py-2 mb-8 text-[11px] font-bold tracking-[0.2em] text-brand-blue uppercase bg-brand-blue/5 border border-brand-blue/10">
                        Nossa História
                    </span>
                    <h1 className="text-[48px] lg:text-[72px] font-[800] leading-[1] tracking-[-2px] mb-6 text-brand-dark">
                        O PROPÓSITO DO <br />
                        <span className="text-gradient-main">RECONHECIMENTO</span>
                    </h1>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="card-premium p-10 md:p-20 space-y-16"
                >
                    <section>
                        <h2 className="text-[28px] lg:text-[36px] font-[800] text-brand-dark mb-8 tracking-tight">Um Legado de Excelência</h2>
                        <p className="text-brand-text-secondary text-[18px] lg:text-[20px] leading-[1.8] font-medium">
                            As Premiações Ser Educacional nasceram da convicção de que a educação é a força motriz da transformação social. 
                            Mais do que um evento, esta plataforma é um registro vivo daqueles que, com coragem e intelecto, 
                            desafiam o status quo e constroem novos horizontes para o conhecimento.
                        </p>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <h3 className="text-[20px] font-[800] text-brand-dark tracking-tight">Missão de Honra</h3>
                            <p className="text-brand-text-secondary text-[16px] leading-[1.7]">
                                Identificar e celebrar talentos que personificam os valores de meritocracia, inovação e compromisso ético, 
                                servindo como referência para as futuras gerações de líderes.
                            </p>
                        </div>
                        <div className="space-y-6">
                            <h3 className="text-[20px] font-[800] text-brand-dark tracking-tight">Visão de Futuro</h3>
                            <p className="text-brand-text-secondary text-[16px] leading-[1.7]">
                                Consolidar-se como a mais prestigiosa distinção acadêmica e executiva do país, 
                                fomentando um ecossistema de alta performance e impacto social duradouro.
                            </p>
                        </div>
                    </div>

                    <section className="pt-16 border-t border-brand-gray">
                        <blockquote className="text-center">
                            <p className="text-[24px] lg:text-[32px] font-[700] text-brand-dark mb-8 leading-tight tracking-tight italic">
                                "O reconhecimento é o combustível da alma que busca a perfeição."
                            </p>
                            <cite className="text-brand-blue text-[12px] font-bold uppercase tracking-[0.3em] not-italic">
                                — Conselho Superior de Excelência
                            </cite>
                        </blockquote>
                    </section>
                </motion.div>
            </div>
        </div>
    );
};

export default AboutPage;
