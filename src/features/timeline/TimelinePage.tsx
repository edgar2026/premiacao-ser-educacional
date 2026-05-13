import React from 'react';
import { motion } from 'framer-motion';

const TimelinePage: React.FC = () => {
    const milestones = [
        { year: '2026', title: 'Edição de Gala', description: 'Expansão para categorias internacionais e foco em IA na educação.' },
        { year: '2023', title: 'Década de Ouro', description: 'Celebração de 10 anos de premiações ininterruptas.' },
        { year: '2022', title: 'Inovação Pós-Pandemia', description: 'Reconhecimento de metodologias híbridas e resiliência acadêmica.' },
        { year: '2021', title: 'Transformação Digital', description: 'Foco total em tecnologias educacionais e alcance global.' },
    ];

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
                    className="text-center mb-28"
                >
                    <span className="inline-block px-6 py-2 mb-8 text-[11px] font-bold tracking-[0.2em] text-brand-blue uppercase bg-brand-blue/5 border border-brand-blue/10">
                        Jornada Histórica
                    </span>
                    <h1 className="text-[48px] lg:text-[72px] font-[800] leading-[1] tracking-[-2px] mb-6 text-brand-dark uppercase">
                        LINHA DO <br />
                        <span className="text-gradient-main">TEMPO</span>
                    </h1>
                </motion.div>

                <div className="relative space-y-24 before:content-[''] before:absolute before:top-0 before:bottom-0 before:left-1/2 before:-translate-x-1/2 before:w-[2px] before:bg-brand-gray hidden md:block">
                    {milestones.map((m, i) => (
                        <motion.div 
                            key={m.year} 
                            initial={{ opacity: 0, x: i % 2 === 0 ? 50 : -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7 }}
                            viewport={{ once: true }}
                            className={`relative flex items-center justify-between w-full ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}
                        >
                            <div className="w-[45%]">
                                <div className="card-premium p-10 group hover:border-brand-blue transition-all duration-500">
                                    <span className="text-brand-blue text-[48px] font-[800] mb-6 block tracking-tighter group-hover:scale-105 transition-transform">{m.year}</span>
                                    <h3 className="text-[24px] font-[800] text-brand-dark mb-4 tracking-tight">{m.title}</h3>
                                    <p className="text-brand-text-secondary text-[16px] leading-[1.8] font-medium">{m.description}</p>
                                </div>
                            </div>
                            <div className="absolute left-1/2 -translate-x-1/2 size-4 bg-brand-blue ring-[8px] ring-white shadow-xl z-10"></div>
                            <div className="w-[45%]"></div>
                        </motion.div>
                    ))}
                </div>

                {/* Mobile Timeline */}
                <div className="md:hidden space-y-12 relative before:content-[''] before:absolute before:top-0 before:bottom-0 before:left-4 before:w-[2px] before:bg-brand-gray">
                    {milestones.map((m, i) => (
                        <motion.div 
                            key={m.year} 
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            viewport={{ once: true }}
                            className="relative pl-12"
                        >
                            <div className="absolute left-3 top-2 size-3 bg-brand-blue ring-[6px] ring-white shadow-lg"></div>
                            <div className="card-premium p-8">
                                <span className="text-brand-blue text-[32px] font-[800] mb-4 block tracking-tighter">{m.year}</span>
                                <h3 className="text-[20px] font-[800] text-brand-dark mb-2 tracking-tight">{m.title}</h3>
                                <p className="text-brand-text-secondary text-[15px] leading-[1.7] font-medium">{m.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TimelinePage;
