import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="relative py-12 bg-[#000d2c]">
            <div className="max-w-[1600px] mx-auto px-8 relative flex flex-col items-center justify-center">
                {/* Logo no Canto Esquerdo - Bem mais à esquerda */}
                <div className="md:absolute md:left-8 md:top-1/2 md:-translate-y-1/2 mb-6 md:mb-0 h-16">
                    <img
                        alt="Ser Educacional"
                        className="h-full w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
                        src="/assets/logo-ser.png"
                    />
                </div>

                {/* Copy no Centro - Letras menores */}
                <div className="text-center space-y-2">
                    <p className="text-[9px] text-white/40 tracking-[0.4em] uppercase font-bold">
                        © 2026 SER EDUCACIONAL. Todos os direitos reservados.
                    </p>
                    <p className="text-[8px] text-white/20 tracking-[0.3em] uppercase font-semibold">
                        Desenvolvido por Edgar Tavares.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
