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
                className="absolute inset-0 bg-navy-deep/95 backdrop-blur-2xl animate-fade-in"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in z-10 glass-card rounded-[3rem] border-white/10">
                {/* Header */}
                <div className="p-8 md:p-12 border-b border-white/10 flex items-center justify-between shrink-0">
                    <div>
                        <span className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] mb-2 block">Registro Histórico</span>
                        <h3 className="text-3xl md:text-4xl font-serif font-bold text-off-white italic">{honoreeName}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="size-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-off-white hover:bg-white/10 hover:text-gold transition-all"
                    >
                        <span className="material-symbols-outlined text-2xl">close</span>
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar">
                    <div className="relative space-y-16 before:content-[''] before:absolute before:top-0 before:bottom-0 before:left-[23px] before:w-[2px] before:bg-gradient-to-b before:from-gold before:via-gold/20 before:to-transparent">
                        {timeline.map((item, index) => (
                            <div key={item.id} className="relative pl-20 group">
                                {/* Dot/Icon */}
                                <div className={`absolute left-0 top-0 flex items-center justify-center w-[48px] h-[48px] rounded-full z-10 transition-all duration-500 ${index === 0 ? 'bg-gold text-navy-deep shadow-[0_0_30px_rgba(212,175,55,0.4)]' : 'glass-card text-gold border-gold/30'}`}>
                                    <span className="material-symbols-outlined text-[22px]">
                                        {index === 0 ? 'star' : 'verified'}
                                    </span>
                                </div>

                                <div className="space-y-4 transition-all duration-500 group-hover:translate-x-2">
                                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                                        <time className="font-bold text-gold text-sm uppercase tracking-[0.2em]">{item.semester}</time>
                                        <span className="hidden md:block text-white/10">•</span>
                                        <span className="text-off-white/40 text-[10px] font-bold uppercase tracking-widest">{item.category}</span>
                                    </div>

                                    <h4 className="text-2xl font-serif font-bold text-off-white italic">{item.title}</h4>

                                    {item.description && (
                                        <p className="text-off-white/60 text-lg font-light leading-relaxed italic max-w-2xl">
                                            {item.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}

                        {timeline.length === 0 && (
                            <div className="text-center py-20">
                                <span className="material-symbols-outlined text-6xl text-white/5 mb-6">history_edu</span>
                                <p className="text-off-white/20 text-xl italic">Nenhum registro histórico encontrado para este perfil.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-white/5 bg-white/[0.02] flex justify-center shrink-0">
                    <p className="text-[10px] font-bold text-off-white/20 uppercase tracking-[0.3em]">
                        © 2026 SER EDUCACIONAL • SISTEMA DE GESTÃO DE MÉRITO
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TimelineModal;
