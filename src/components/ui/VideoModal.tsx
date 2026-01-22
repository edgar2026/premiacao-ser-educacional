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
                className="absolute inset-0 bg-navy-deep/90 backdrop-blur-xl animate-fade-in"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-4xl animate-scale-in z-10">
                <div className="flex items-center justify-between mb-6 px-4">
                    <h3 className="text-2xl md:text-3xl font-serif font-bold text-off-white italic">{title}</h3>
                    <button
                        onClick={onClose}
                        className="size-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-off-white hover:bg-white/10 hover:text-gold transition-all"
                    >
                        <span className="material-symbols-outlined text-2xl">close</span>
                    </button>
                </div>

                <PremiumVideoPlayer src={videoSrc} className="w-full" />
            </div>
        </div>
    );
};

export default VideoModal;
