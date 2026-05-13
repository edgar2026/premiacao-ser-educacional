import React from 'react';

interface TimelineItem {
    id: string;
    semester: string;
    title: string;
    category: string;
    description?: string;
}

interface TimelineModalProps {
    isOpen: boolean;
    onClose: () => void;
    honoreeName: string;
    timeline: TimelineItem[];
}

const TimelineModal: React.FC<TimelineModalProps> = ({ isOpen, onClose, honoreeName, timeline }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-brand-dark/40 backdrop-blur-md animate-fade-in"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in z-10 bg-[#F7FAFF] rounded-3xl border border-brand-gray/50 shadow-2xl">
                {/* Header */}
                <div className="p-10 md:p-14 border-b border-brand-gray flex items-center justify-between shrink-0 bg-white relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-brand-blue"></div>
                    <div>
                        <span className="text-brand-blue text-[12px] font-[800] uppercase tracking-[0.4em] mb-4 block">Registro de Excelência</span>
                        <h3 className="text-4xl md:text-6xl font-[800] text-brand-dark tracking-tighter leading-none">{honoreeName}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="size-14 rounded-full bg-brand-gray/20 flex items-center justify-center text-brand-dark hover:bg-brand-blue hover:text-white transition-all duration-300"
                    >
                        <span className="material-symbols-outlined text-3xl">close</span>
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-10 md:p-14 custom-scrollbar bg-white">
                    <div className="relative space-y-20 before:content-[''] before:absolute before:top-0 before:bottom-0 before:left-[27px] before:w-[2px] before:bg-gradient-to-b before:from-brand-blue before:via-brand-blue/10 before:to-transparent">
                        {timeline.map((item, index) => (
                            <div key={item.id} className="relative pl-24 group">
                                {/* Dot/Icon */}
                                <div className={`absolute left-0 top-0 flex items-center justify-center w-[56px] h-[56px] rounded-2xl z-10 transition-all duration-500 ${index === 0 ? 'bg-brand-blue text-white shadow-xl shadow-brand-blue/30' : 'bg-white text-brand-blue border-2 border-brand-blue/10'}`}>
                                    <span className="material-symbols-outlined text-[26px]">
                                        {index === 0 ? 'military_tech' : 'verified'}
                                    </span>
                                </div>

                                <div className="space-y-4 transition-all duration-500 group-hover:translate-x-3">
                                    <div className="flex flex-col md:flex-row md:items-center gap-5">
                                        <time className="font-[800] text-brand-blue text-[14px] uppercase tracking-[0.2em] bg-brand-blue/5 px-4 py-1.5 rounded-full border border-brand-blue/10">{item.semester}</time>
                                        <span className="text-brand-text-secondary/60 text-[11px] font-[700] uppercase tracking-[0.3em]">{item.category}</span>
                                    </div>

                                    <h4 className="text-3xl md:text-4xl font-[800] text-brand-dark tracking-tight leading-tight">{item.title}</h4>

                                    {item.description && (
                                        <p className="text-brand-text-secondary text-[18px] font-[400] leading-relaxed max-w-3xl">
                                            {item.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}

                        {timeline.length === 0 && (
                            <div className="text-center py-32 flex flex-col items-center">
                                <div className="size-24 bg-brand-gray/30 rounded-3xl flex items-center justify-center mb-8">
                                    <span className="material-symbols-outlined text-5xl text-brand-text-secondary/20">history_edu</span>
                                </div>
                                <p className="text-brand-text-secondary/40 text-2xl font-[600] tracking-tight">Nenhum marco registrado neste período.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-10 border-t border-brand-gray bg-white flex justify-center shrink-0">
                    <p className="text-[11px] font-[800] text-brand-text-secondary/20 uppercase tracking-[0.5em]">
                        © 2026 SER EDUCACIONAL • SISTEMA DE GESTÃO DE MÉRITO
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TimelineModal;
