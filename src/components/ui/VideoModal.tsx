import React from 'react';
import PremiumVideoPlayer from './PremiumVideoPlayer';

interface VideoModalProps {
    isOpen: boolean;
    onClose: () => void;
    videoSrc: string;
    title: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, videoSrc, title }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-brand-dark/40 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-4xl animate-scale-in z-10 bg-white p-6 md:p-10 rounded-[3rem] shadow-2xl border border-brand-gray">
                <div className="flex items-center justify-between mb-8 px-4">
                    <h3 className="text-2xl md:text-3xl font-[800] text-brand-dark tracking-tight">{title}</h3>
                    <button
                        onClick={onClose}
                        className="size-14 rounded-[1.5rem] bg-bg-main border border-brand-gray flex items-center justify-center text-brand-text-secondary hover:bg-brand-blue hover:text-white transition-all shadow-sm"
                    >
                        <span className="material-symbols-outlined text-3xl font-bold">close</span>
                    </button>
                </div>

                <div className="rounded-[2rem] overflow-hidden shadow-2xl border border-brand-gray bg-black">
                    <PremiumVideoPlayer src={videoSrc} className="w-full" />
                </div>
            </div>
        </div>
    );
};

export default VideoModal;
