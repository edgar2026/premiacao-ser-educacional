import React from 'react';

interface StatusStateProps {
    title?: string;
    message?: string;
    type: 'loading' | 'error' | 'empty';
    onRetry?: () => void;
}

const StatusStates: React.FC<StatusStateProps> = ({ title, message, type, onRetry }) => {
    const configs = {
        loading: {
            icon: 'sync',
            defaultTitle: 'Sincronizando Dados',
            defaultMessage: 'Conectando ao servidor institucional para atualizar as informações...',
            iconClass: 'animate-spin text-brand-blue',
        },
        error: {
            icon: 'error_outline',
            defaultTitle: 'Ocorreu um Erro',
            defaultMessage: 'Não foi possível recuperar os dados. Verifique sua conexão e tente novamente.',
            iconClass: 'text-red-500',
        },
        empty: {
            icon: 'inbox',
            defaultTitle: 'Lista Vazia',
            defaultMessage: 'Nenhum registro foi encontrado nos critérios selecionados no momento.',
            iconClass: 'text-brand-text-secondary/20',
        }
    };

    const config = configs[type];

    return (
        <div className="min-h-[450px] flex items-center justify-center p-8 animate-fade-in">
            <div className="card-static max-w-md w-full p-16 text-center shadow-xl">
                <div className={`size-28 rounded-[2.5rem] bg-bg-main flex items-center justify-center mx-auto mb-10 border border-brand-gray shadow-sm`}>
                    <span className={`material-symbols-outlined text-5xl font-bold ${config.iconClass}`}>
                        {config.icon}
                    </span>
                </div>
                <h3 className="text-[28px] font-[800] text-brand-dark mb-4 tracking-tight">
                    {title || config.defaultTitle}
                </h3>
                <p className="text-brand-text-secondary font-medium leading-relaxed mb-12 opacity-60">
                    {message || config.defaultMessage}
                </p>
                {type === 'error' && onRetry && (
                    <button
                        onClick={onRetry}
                        className="btn-premium !px-12 !py-5 !text-[11px] !tracking-[0.3em]"
                    >
                        Tentar Novamente
                    </button>
                )}
                {type === 'loading' && (
                    <div className="max-w-[200px] mx-auto space-y-4">
                        <div className="w-full h-2 bg-brand-gray rounded-full overflow-hidden">
                            <div className="h-full bg-brand-blue w-1/3 animate-[loading_2s_infinite_linear]"></div>
                        </div>
                        <span className="text-[10px] font-[800] uppercase tracking-[0.2em] text-brand-blue opacity-50">Carregando...</span>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(300%); }
                }
            `}</style>
        </div>
    );
};

export default StatusStates;
