import React from 'react';

interface GlassCardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'light' | 'hover' | 'panel';
    onClick?: () => void;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', variant = 'default', onClick }) => {
    const baseStyles = {
        default: 'glass-card',
        light: 'glass-panel-light',
        hover: 'glass-panel-light glass-panel-hover',
        panel: 'glass-panel'
    };

    return (
        <div className={`${baseStyles[variant]} ${className}`} onClick={onClick}>
            {children}
        </div>
    );
};

export default GlassCard;
