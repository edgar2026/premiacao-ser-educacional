import React from 'react';

interface CertificateTemplateProps {
    honoreeName: string;
    awardName: string;
    role: string;
    biography: string;
}

const CertificateTemplate: React.FC<CertificateTemplateProps> = ({ honoreeName, awardName, role }) => {
    return (
        <div id="certificate-content" className="hidden print:block bg-white text-navy-deep p-16 w-[210mm] h-[297mm] mx-auto relative overflow-hidden">
            {/* Border Design */}
            <div className="absolute inset-8 border-[12px] border-double border-gold/30"></div>
            <div className="absolute inset-12 border border-gold/20"></div>

            {/* Content */}
            <div className="relative h-full flex flex-col items-center justify-between py-20 px-12 text-center">
                {/* Header */}
                <div className="space-y-8">
                    <img src="/assets/logo-final.png" alt="Ser Educacional" className="h-24 mx-auto object-contain grayscale" />
                    <div className="space-y-2">
                        <h1 className="text-4xl font-serif font-bold uppercase tracking-[0.2em] text-gold">Certificado de Honra</h1>
                        <p className="text-sm font-bold uppercase tracking-[0.4em] opacity-40">Reconhecimento e Mérito</p>
                    </div>
                </div>

                {/* Main Text */}
                <div className="space-y-12">
                    <p className="text-xl font-light italic leading-relaxed">
                        O Grupo Ser Educacional tem a honra de conferir este certificado a:
                    </p>

                    <div className="space-y-4">
                        <h2 className="text-6xl font-serif font-bold text-navy-deep">{honoreeName}</h2>
                        <div className="h-0.5 w-48 bg-gold/30 mx-auto"></div>
                        <p className="text-xl font-bold uppercase tracking-[0.2em] text-gold/80">{role}</p>
                    </div>

                    <p className="text-lg leading-relaxed max-w-2xl mx-auto opacity-80">
                        Em reconhecimento à sua trajetória de excelência, dedicação inabalável e contribuições significativas para o futuro da educação, sendo laureado com o:
                    </p>

                    <div className="py-6 px-12 bg-gold/5 border border-gold/10 rounded-2xl inline-block">
                        <h3 className="text-3xl font-serif font-bold italic text-navy-deep">{awardName}</h3>
                    </div>
                </div>

                {/* Footer */}
                <div className="w-full space-y-16">
                    <div className="flex justify-around items-end">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-64 h-[1px] bg-navy-deep/20"></div>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Presidência Ser Educacional</p>
                        </div>
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-64 h-[1px] bg-navy-deep/20"></div>
                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Diretoria Executiva</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-30">
                            © 2026 SER EDUCACIONAL • SISTEMA DE GESTÃO DE MÉRITO
                        </p>
                        <p className="text-[8px] opacity-20">Documento gerado em {new Date().toLocaleDateString('pt-BR')}</p>
                    </div>
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -bottom-20 -right-20 size-80 bg-gold/5 rounded-full blur-3xl"></div>
            <div className="absolute -top-20 -left-20 size-80 bg-gold/5 rounded-full blur-3xl"></div>
        </div>
    );
};

export default CertificateTemplate;
