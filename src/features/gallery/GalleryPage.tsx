import React from 'react';

const GalleryPage: React.FC = () => {
    const videos = [
        { id: 1, title: 'Manifesto de Excelência', duration: '04:20', thumbnail: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=2070' },
        { id: 2, title: 'Cerimônia de Abertura 2024', duration: '12:45', thumbnail: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=2012' },
        { id: 3, title: 'Destaques Acadêmicos', duration: '08:15', thumbnail: 'https://images.unsplash.com/photo-1524178232363-1fb28f74b671?auto=format&fit=crop&q=80&w=2070' },
        { id: 4, title: 'Inovação e Gestão', duration: '06:30', thumbnail: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=2070' },
    ];

    return (
        <div className="w-full mesh-gradient-premium min-h-screen">
            <div className="max-w-7xl mx-auto px-6 py-32 animate-fade-in">
                <div className="text-center mb-28">
                    <span className="inline-block px-8 py-2.5 mb-10 text-[10px] font-bold tracking-[0.4em] text-gold uppercase border border-gold/30 rounded-full bg-navy-deep/40 backdrop-blur-2xl">
                        Acervo Audiovisual
                    </span>
                    <h1 className="text-6xl md:text-8xl font-bold mb-10 tracking-tighter font-serif text-off-white uppercase">
                        GALERIA DE <span className="text-gold-gradient italic">VÍDEOS</span>
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {videos.map((video) => (
                        <div key={video.id} className="group relative">
                            <div className="aspect-video rounded-[2.5rem] overflow-hidden glass-card p-2 border-white/5 transition-all duration-700 group-hover:scale-[1.02] group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.6)]">
                                <div className="relative h-full w-full overflow-hidden rounded-[2.2rem]">
                                    <div className="absolute inset-0 bg-navy-deep/40 group-hover:bg-navy-deep/10 transition-colors duration-700 z-10"></div>
                                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100" />

                                    <div className="absolute inset-0 flex items-center justify-center z-20">
                                        <button className="size-20 rounded-full bg-gold/10 backdrop-blur-2xl border border-gold/30 flex items-center justify-center group-hover:scale-125 transition-all duration-700 shadow-[0_0_40px_rgba(212,175,55,0.3)]">
                                            <span className="material-symbols-outlined text-gold text-4xl fill-1">play_arrow</span>
                                        </button>
                                    </div>

                                    <div className="absolute bottom-8 left-10 right-10 z-20 flex items-end justify-between">
                                        <div className="max-w-[70%]">
                                            <h3 className="text-2xl font-serif font-bold text-off-white mb-2 italic drop-shadow-lg">{video.title}</h3>
                                            <span className="text-[10px] font-bold text-gold uppercase tracking-[0.2em]">{video.duration}</span>
                                        </div>
                                        <button className="text-off-white/60 hover:text-gold transition-colors">
                                            <span className="material-symbols-outlined text-2xl">share</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GalleryPage;
