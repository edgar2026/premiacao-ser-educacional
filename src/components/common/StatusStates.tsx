import React from 'react';
import GlassCard from '../ui/GlassCard';

interface StatusStateProps {
    title?: string;
    message?: string;
    type: 'loading' | 'error' | 'empty';
    onRetry?: () => void;
}

const StatusStates: React.FC<StatusStateProps> = ({ title, message, type, onRetry }) => {
    const configs = {
        loading: {
            icon: 'hourglass_empty',
            defaultTitle: 'Processando Dados',
            defaultMessage: 'Sincronizando informações com o servidor institucional...',
            iconClass: 'animate-spin text-gold',
        },
        error: {
            icon: 'report',
            defaultTitle: 'Falha na Conexão',
            defaultMessage: 'Não foi possível recuperar as informações no momento. Por favor, tente novamente.',
            iconClass: 'text-red-400',
        },
        empty: {
            icon: 'folder_open',
            defaultTitle: 'Nenhum Registro',
            defaultMessage: 'Não encontramos dados para os critérios selecionados.',
            iconClass: 'text-off-white/20',
        }
    };

    const config = configs[type];

    return (
        <div className="min-h-[400px] flex items-center justify-center p-6 animate-fade-in">
            <GlassCard className="max-w-md w-full p-12 rounded-[3rem] text-center border-white/5 bg-white/[0.02]">
                <div className={`size-24 rounded-[2rem] bg-white/5 flex items-center justify-center mx-auto mb-8 border border-white/10`}>
                    <span className={`material-symbols-outlined text-5xl ${config.iconClass}`}>
                        {config.icon}
                    </span>
                </div>
                <h3 className="text-2xl font-bold font-serif text-off-white italic mb-4">
                    {title || config.defaultTitle}
                </h3>
                <p className="text-off-white/40 text-sm font-light leading-relaxed mb-10 italic">
                    {message || config.defaultMessage}
                </p>
                {type === 'error' && onRetry && (
                    <button
                        onClick={onRetry}
                        className="bg-gold text-navy-deep px-10 py-4 rounded-full font-bold text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-gold/10 hover:scale-105 transition-all"
                    >
                        Tentar Novamente
                    </button>
                )}
                {type === 'loading' && (
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gold w-1/3 animate-[loading_2s_infinite_linear]"></div>
                    </div>
                )}
            </GlassCard>
        </div>
    );
};

export default StatusStates;
