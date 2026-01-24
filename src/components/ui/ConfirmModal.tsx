import React from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    type?: 'danger' | 'warning' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    type = 'danger'
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-navy-deep/80 backdrop-blur-md animate-fade-in"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-navy-deep border border-white/10 rounded-[2.5rem] p-10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] animate-scale-in z-10 overflow-hidden">
                {/* Decorative background glow */}
                <div className={`absolute -top-24 -right-24 size-48 rounded-full blur-[80px] opacity-20 ${type === 'danger' ? 'bg-red-500' : 'bg-gold'}`}></div>

                <div className="relative z-10 text-center">
                    <div className={`size-20 rounded-full mx-auto mb-8 flex items-center justify-center border-2 ${type === 'danger' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-gold/10 border-gold/20 text-gold'}`}>
                        <span className="material-symbols-outlined text-4xl">
                            {type === 'danger' ? 'delete_forever' : 'warning'}
                        </span>
                    </div>

                    <h3 className="text-3xl font-serif font-bold text-off-white mb-4 italic">{title}</h3>
                    <p className="text-off-white/50 text-base font-light leading-relaxed mb-10">
                        {message}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 px-8 py-4 rounded-2xl border border-white/10 text-off-white text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 px-8 py-4 rounded-2xl text-white text-[10px] font-bold uppercase tracking-widest shadow-lg transition-all ${type === 'danger'
                                    ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                                    : 'bg-gold text-navy-deep hover:bg-gold/90 shadow-gold/20'
                                }`}
                        >
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
