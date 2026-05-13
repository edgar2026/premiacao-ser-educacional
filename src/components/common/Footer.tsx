import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="relative py-14 bg-white border-t border-brand-gray">
            <div className="max-w-[1600px] mx-auto px-8 relative flex flex-col items-center justify-center">
                {/* Logo no Canto Esquerdo */}
                <div className="md:absolute md:left-8 md:top-1/2 md:-translate-y-1/2 mb-6 md:mb-0 h-16">
                    <img
                        alt="Ser Educacional"
                        className="h-full w-auto object-contain brightness-0 opacity-50 hover:opacity-100 transition-opacity"
                        src="/assets/logo-ser.png"
                    />
                </div>

                {/* Copy no Centro */}
                <div className="text-center space-y-2">
                    <p className="text-[11px] text-brand-dark/40 tracking-[0.3em] uppercase font-bold">
                        © 2026 Ser Educacional. Todos os direitos reservados.
                    </p>
                    <p className="text-[10px] text-brand-dark/25 tracking-[0.2em] uppercase font-semibold">
                        Desenvolvido por Edgar Tavares.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
