import React from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: React.ReactNode;
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
                className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-white border border-brand-gray rounded-[2.5rem] p-10 shadow-[0_50px_100px_rgba(0,0,0,0.1)] animate-scale-in z-10 overflow-hidden">
                {/* Decorative background glow */}
                <div className={`absolute -top-24 -right-24 size-48 rounded-full blur-[80px] opacity-10 ${type === 'danger' ? 'bg-red-500' : 'bg-brand-blue'}`}></div>

                <div className="relative z-10 text-center">
                    <div className={`size-24 rounded-[2rem] mx-auto mb-8 flex items-center justify-center border-2 ${type === 'danger' ? 'bg-red-50 border-red-100 text-red-500' : 'bg-brand-blue/5 border-brand-blue/10 text-brand-blue'}`}>
                        <span className="material-symbols-outlined text-5xl font-bold">
                            {type === 'danger' ? 'delete_forever' : type === 'warning' ? 'warning' : 'info'}
                        </span>
                    </div>

                    <h3 className="text-3xl font-[800] text-brand-dark mb-4 tracking-tight">{title}</h3>
                    <p className="text-brand-text-secondary font-medium leading-relaxed mb-10 px-4 opacity-80">
                        {message}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 px-8 py-4 rounded-2xl border border-brand-gray text-brand-text-secondary text-[11px] font-[800] uppercase tracking-widest hover:bg-bg-main transition-all shadow-sm"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                             }}
                             className={`flex-1 px-8 py-4 rounded-2xl text-white text-[11px] font-[800] uppercase tracking-widest shadow-lg transition-all ${
                                 type === 'danger'
                                     ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20'
                                     : 'bg-brand-blue hover:bg-brand-dark shadow-brand-blue/20'
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
