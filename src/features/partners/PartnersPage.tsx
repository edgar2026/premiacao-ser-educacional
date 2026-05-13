import React from 'react';
import { motion } from 'framer-motion';

const PartnersPage: React.FC = () => {
    const partners = [
        { name: 'Fundação de Amparo', type: 'Parceiro Estratégico', logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=300' },
        { name: 'Instituto de Inovação', type: 'Apoiador Institucional', logo: 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&q=80&w=300' },
        { name: 'Global Education Group', type: 'Parceiro Internacional', logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=300' },
        { name: 'Tech Excellence', type: 'Patrocinador Master', logo: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=300' },
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
                        Alianças de Valor
                    </span>
                    <h1 className="text-[48px] lg:text-[72px] font-[800] leading-[1] tracking-[-2px] mb-6 text-brand-dark uppercase">
                        PARCEIROS E <br />
                        <span className="text-gradient-main">APOIADORES</span>
                    </h1>
                    <p className="text-brand-text-secondary text-[18px] lg:text-[20px] leading-[1.8] max-w-2xl mx-auto font-medium">
                        Instituições que compartilham nossa visão de excelência e tornam este reconhecimento possível.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                    {partners.map((partner, i) => (
                        <motion.div
                            key={partner.name}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            className="card-premium p-12 flex flex-col items-center text-center group"
                        >
                            <div className="size-32 mb-10 overflow-hidden border-2 border-brand-blue/20 p-2 bg-white group-hover:border-brand-blue transition-all duration-500 shadow-sm">
                                <img src={partner.logo} alt={partner.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" />
                            </div>
                            <h3 className="text-[22px] font-[800] text-brand-dark mb-3 tracking-tight">{partner.name}</h3>
                            <span className="text-[11px] font-bold text-brand-blue uppercase tracking-[0.2em]">{partner.type}</span>
                        </motion.div>
                    ))}
                </div>

                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-40 text-center"
                >
                    <button className="btn-premium px-16 py-6">
                        Torne-se um Parceiro Institucional
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default PartnersPage;
