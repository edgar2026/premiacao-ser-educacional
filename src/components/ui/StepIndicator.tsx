import React from 'react';

interface Step {
    title: string;
    description?: string;
}

interface StepIndicatorProps {
    steps: Step[];
    currentStep: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => {
    return (
        <div className="flex items-center justify-between w-full max-w-4xl mx-auto mb-16">
            {steps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isActive = index === currentStep;

                return (
                    <React.Fragment key={index}>
                        <div className="flex flex-col items-center gap-4 relative z-10">
                            <div
                                className={`size-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${isActive
                                        ? 'bg-gold border-gold text-navy-deep shadow-[0_0_30px_rgba(212,175,55,0.4)] scale-110'
                                        : isCompleted
                                            ? 'bg-gold/20 border-gold/40 text-gold'
                                            : 'bg-white/5 border-white/10 text-off-white/20'
                                    }`}
                            >
                                {isCompleted ? (
                                    <span className="material-symbols-outlined text-2xl">check</span>
                                ) : (
                                    <span className="font-serif italic text-xl font-bold">{index + 1}</span>
                                )}
                            </div>
                            <div className="text-center absolute -bottom-12 w-32">
                                <p className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${isActive ? 'text-gold' : 'text-off-white/40'}`}>
                                    {step.title}
                                </p>
                            </div>
                        </div>

                        {index < steps.length - 1 && (
                            <div className="flex-1 h-[2px] mx-4 bg-white/5 relative overflow-hidden">
                                <div
                                    className="absolute inset-0 bg-gold transition-all duration-700 ease-in-out"
                                    style={{
                                        width: isCompleted ? '100%' : '0%',
                                        opacity: isCompleted ? 1 : 0
                                    }}
                                />
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
};

export default StepIndicator;
