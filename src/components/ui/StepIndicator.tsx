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
        <div className="flex items-center justify-between w-full max-w-4xl mx-auto mb-20 px-4">
            {steps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isActive = index === currentStep;

                return (
                    <React.Fragment key={index}>
                        <div className="flex flex-col items-center gap-4 relative z-10">
                            <div
                                className={`size-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 shadow-sm ${isActive
                                        ? 'bg-brand-blue border-brand-blue text-white scale-110'
                                        : isCompleted
                                            ? 'bg-brand-blue/10 border-brand-blue/20 text-brand-blue'
                                            : 'bg-white border-brand-gray text-brand-text-secondary/30'
                                    }`}
                            >
                                {isCompleted ? (
                                    <span className="material-symbols-outlined text-2xl font-[800]">check</span>
                                ) : (
                                    <span className="font-[800] text-lg">{index + 1}</span>
                                )}
                            </div>
                            <div className="text-center absolute -bottom-12 w-32">
                                <p className={`text-[11px] font-[800] uppercase tracking-[0.1em] transition-colors ${isActive ? 'text-brand-dark' : 'text-brand-text-secondary/40'}`}>
                                    {step.title}
                                </p>
                            </div>
                        </div>

                        {index < steps.length - 1 && (
                            <div className="flex-1 h-[2px] mx-2 bg-brand-gray relative overflow-hidden">
                                <div
                                    className="absolute inset-0 bg-brand-blue transition-all duration-700 ease-in-out"
                                    style={{
                                        width: isCompleted ? '100%' : '0%',
                                        opacity: isCompleted ? 0.6 : 0
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
