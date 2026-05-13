import React, { useState, useRef } from 'react';

interface PremiumVideoPlayerProps {
    src: string;
    poster?: string;
    className?: string;
}

const PremiumVideoPlayer: React.FC<PremiumVideoPlayerProps> = ({ src, poster, className = "" }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);

    // Detectar se é um link do YouTube
    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const youtubeId = getYouTubeId(src);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleFullScreen = () => {
        if (videoRef.current) {
            if (videoRef.current.requestFullscreen) {
                videoRef.current.requestFullscreen();
            } else if ((videoRef.current as any).webkitRequestFullscreen) {
                (videoRef.current as any).webkitRequestFullscreen();
            } else if ((videoRef.current as any).msRequestFullscreen) {
                (videoRef.current as any).msRequestFullscreen();
            }
        }
    };

    if (youtubeId) {
        return (
            <div className={`relative group overflow-hidden rounded-[2.5rem] bg-white p-2 border border-brand-gray shadow-2xl ${className}`}>
                <div className="relative aspect-video bg-black rounded-[2.2rem] overflow-hidden">
                    <iframe
                        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&rel=0&modestbranding=1`}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="YouTube video player"
                    ></iframe>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`relative group overflow-hidden rounded-[2.5rem] bg-white p-2 border border-brand-gray shadow-2xl ${className}`}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
        >
            <div className="relative aspect-video bg-black rounded-[2.2rem] overflow-hidden">
                <video
                    ref={videoRef}
                    src={src}
                    poster={poster}
                    className="w-full h-full object-contain"
                    onClick={togglePlay}
                    controls
                />

                {/* Botão Play/Pause no Centro */}
                {(!isPlaying || showControls) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-brand-dark/20 backdrop-blur-[2px] z-10">
                        <button
                            onClick={togglePlay}
                            className="size-24 rounded-full bg-white/20 backdrop-blur-3xl border border-white/30 flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-500 group/play"
                        >
                            <span className="material-symbols-outlined text-white text-5xl font-black group-hover/play:text-brand-blue transition-colors">
                                {isPlaying ? 'pause' : 'play_arrow'}
                            </span>
                        </button>
                    </div>
                )}

                {/* Controles Simplificados */}
                <div className={`absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-brand-dark/80 via-brand-dark/20 to-transparent transition-opacity duration-500 z-20 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="flex items-center justify-between">
                        {/* Botão Play/Pause Esquerda */}
                        <button onClick={togglePlay} className="text-white hover:text-brand-blue transition-colors">
                            <span className="material-symbols-outlined text-4xl font-black">
                                {isPlaying ? 'pause' : 'play_arrow'}
                            </span>
                        </button>

                        {/* Controle de Volume Direita */}
                        <div className="flex items-center gap-6">
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/30 text-[11px] font-[800] text-white hover:bg-white/20 transition-colors uppercase tracking-widest">
                                <span className="material-symbols-outlined text-lg">hd</span>
                                HD
                            </button>
                            <button onClick={toggleMute} className="text-white/80 hover:text-brand-blue transition-colors">
                                <span className="material-symbols-outlined text-3xl font-bold">
                                    {isMuted ? 'volume_off' : 'volume_up'}
                                </span>
                            </button>
                            <button onClick={toggleFullScreen} className="text-white/80 hover:text-brand-blue transition-colors">
                                <span className="material-symbols-outlined text-3xl font-bold">fullscreen</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PremiumVideoPlayer;
