import React, { useRef, useState, useEffect } from 'react';

interface CustomVideoPlayerProps {
    src: string;
    className?: string;
}

const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({ src, className = '' }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [showControls, setShowControls] = useState(false);

    const togglePlay = () => {
        if (!videoRef.current) return;

        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
        }
    };

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleEnded = () => setIsPlaying(false);
        video.addEventListener('ended', handleEnded);

        return () => {
            video.removeEventListener('ended', handleEnded);
        };
    }, []);

    return (
        <div
            className={`relative group ${className}`}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
        >
            <video
                ref={videoRef}
                src={src}
                className="w-full rounded-2xl"
                onClick={togglePlay}
            />

            {/* Play/Pause Button no Centro */}
            <div
                className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
                    }`}
                onClick={togglePlay}
            >
                <button className="size-20 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/60 hover:border-gold/50 transition-all">
                    <span className="material-symbols-outlined text-5xl text-white">
                        {isPlaying ? 'pause' : 'play_arrow'}
                    </span>
                </button>
            </div>

            {/* Controles na Parte Inferior */}
            <div
                className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'
                    }`}
            >
                <div className="flex items-center gap-4">
                    {/* Botão Play/Pause */}
                    <button
                        onClick={togglePlay}
                        className="text-white hover:text-gold transition-colors"
                    >
                        <span className="material-symbols-outlined text-2xl">
                            {isPlaying ? 'pause' : 'play_arrow'}
                        </span>
                    </button>

                    {/* Controle de Volume */}
                    <div className="  flex items-center gap-2 group/volume">
                        <span className="material-symbols-outlined text-white text-xl">
                            {volume === 0 ? 'volume_off' : volume < 0.5 ? 'volume_down' : 'volume_up'}
                        </span>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={volume}
                            onChange={handleVolumeChange}
                            className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer
                                [&::-webkit-slider-thumb]:appearance-none 
                                [&::-webkit-slider-thumb]:w-3 
                                [&::-webkit-slider-thumb]:h-3 
                                [&::-webkit-slider-thumb]:rounded-full 
                                [&::-webkit-slider-thumb]:bg-gold
                                [&::-webkit-slider-thumb]:cursor-pointer
                                [&::-moz-range-thumb]:border-0
                                [&::-moz-range-thumb]:w-3 
                                [&::-moz-range-thumb]:h-3 
                                [&::-moz-range-thumb]:rounded-full 
                                [&::-moz-range-thumb]:bg-gold
                                [&::-moz-range-thumb]:cursor-pointer"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomVideoPlayer;
