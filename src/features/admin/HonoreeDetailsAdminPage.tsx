import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import GlassCard from '../../components/ui/GlassCard';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/supabase';

type Honoree = Database['public']['Tables']['honorees']['Row'];

const HonoreeDetailsAdminPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [honoree, setHonoree] = useState<Honoree | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchHonoree();
        }
    }, [id]);

    const fetchHonoree = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('honorees')
            .select('*, awards!honorees_award_id_fkey(name)')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching honoree:', error);
            navigate('/admin/homenageados');
        } else {
            setHonoree(data as any);
        }
        setIsLoading(false);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
            </div>
        );
    }

    if (!honoree) return null;

    const profData = honoree.professional_data ? JSON.parse(honoree.professional_data) : {};
    const stats = (honoree.stats as any) || {};
    const timeline = (honoree.timeline as any[]) || [];
    const awardName = (honoree as any).awards?.name || 'Nenhum prêmio vinculado';

    return (
        <div className="space-y-12 animate-fade-in pb-20 px-6 md:px-10 lg:px-16 pt-20 lg:pt-8">
            <div className="flex flex-wrap justify-between items-end gap-8 mb-16">
                <div className="space-y-4">
                    <button
                        onClick={() => navigate('/admin/homenageados')}
                        className="flex items-center gap-2 text-gold text-[10px] font-bold uppercase tracking-[0.2em] hover:opacity-70 transition-opacity mb-4"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Voltar para listagem
                    </button>
                    <span className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] block">Gestão de Talentos</span>
                    <h2 className="text-5xl font-bold font-serif text-off-white italic">Detalhes do <span className="text-gold-gradient">Homenageado</span></h2>
                </div>
                <div className="flex flex-wrap gap-4">
                    <Link
                        to={`/admin/homenageados/${id}/editar`}
                        className="bg-white/5 hover:bg-white/10 text-gold px-8 py-4 rounded-full font-bold text-[10px] uppercase tracking-[0.3em] border border-gold/30 transition-all"
                    >
                        Editar Perfil
                    </Link>
                    <Link
                        to={`/homenageado/${id}`}
                        target="_blank"
                        className="bg-gold text-navy-deep px-8 py-4 rounded-full font-bold text-[10px] uppercase tracking-[0.3em] shadow-lg shadow-gold/20 hover:scale-105 transition-all"
                    >
                        Ver Página Pública
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Profile Overview */}
                <GlassCard className="p-10 rounded-[3rem] border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent lg:col-span-1">
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="size-48 rounded-[2rem] overflow-hidden border-2 border-gold/30 p-1">
                            <img
                                src={honoree.photo_url || '/assets/default-fallback.png'}
                                alt={profData.name}
                                className="w-full h-full object-cover rounded-[1.8rem]"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/assets/default-fallback.png';
                                }}
                            />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-off-white font-serif italic">{profData.name}</h3>
                            <p className="text-gold text-sm font-medium mt-1 uppercase tracking-widest">{profData.role || profData.external_role}</p>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${honoree.is_published ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
                            {honoree.is_published ? 'Publicado' : 'Rascunho'}
                        </div>
                        <div className="w-full pt-6 border-t border-white/5 space-y-4">
                            <div className="flex justify-between text-xs">
                                <span className="text-off-white/30 uppercase tracking-widest">Tipo</span>
                                <span className="text-off-white font-bold uppercase">{honoree.type}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-off-white/30 uppercase tracking-widest">Prêmio</span>
                                <span className="text-gold font-bold">{awardName}</span>
                            </div>
                        </div>
                    </div>
                </GlassCard>

                {/* Professional Data & Bio */}
                <div className="lg:col-span-2 space-y-10">
                    <GlassCard className="p-10 rounded-[3rem] border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
                        <h4 className="text-lg font-bold text-off-white uppercase tracking-widest mb-8 border-b border-white/5 pb-4">Dados Profissionais</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {honoree.type === 'interno' ? (
                                <>
                                    <div>
                                        <p className="text-[10px] text-off-white/30 uppercase tracking-widest mb-1">Unidade</p>
                                        <p className="text-off-white font-medium">{profData.unit}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-off-white/30 uppercase tracking-widest mb-1">Matrícula</p>
                                        <p className="text-off-white font-medium">{profData.registration_id}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-off-white/30 uppercase tracking-widest mb-1">Tempo de Casa</p>
                                        <p className="text-off-white font-medium">{profData.years_at_company} anos</p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <p className="text-[10px] text-off-white/30 uppercase tracking-widest mb-1">Instituição</p>
                                        <p className="text-off-white font-medium">{profData.institution}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-off-white/30 uppercase tracking-widest mb-1">Cargo Externo</p>
                                        <p className="text-off-white font-medium">{profData.external_role}</p>
                                    </div>
                                </>
                            )}
                            <div>
                                <p className="text-[10px] text-off-white/30 uppercase tracking-widest mb-1">E-mail</p>
                                <p className="text-off-white font-medium">{profData.email}</p>
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-10 rounded-[3rem] border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
                        <h4 className="text-lg font-bold text-off-white uppercase tracking-widest mb-8 border-b border-white/5 pb-4">Biografia</h4>
                        <div
                            className="text-off-white/60 leading-relaxed italic prose prose-invert max-w-none break-words"
                            dangerouslySetInnerHTML={{ __html: honoree.biography || '<p className="text-off-white/20">Nenhuma biografia cadastrada.</p>' }}
                        />
                    </GlassCard>
                </div>
            </div>

            {/* Curriculum & Stats Section */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {[
                    { label: 'Anos de Dedicação', value: stats.yearsOfService || '0' },
                    { label: 'Láureas Recebidas', value: stats.totalAwards || '0' },
                    { label: 'Projetos de Impacto', value: stats.projectsLed || '0' },
                    { label: 'Unidades Lideradas', value: stats.units || '0' }
                ].map((stat, i) => (
                    <GlassCard key={i} className="p-8 rounded-[2rem] border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent text-center">
                        <p className="text-[9px] text-off-white/30 uppercase tracking-widest mb-2">{stat.label}</p>
                        <p className="text-4xl font-bold font-serif text-gold italic">{stat.value}</p>
                    </GlassCard>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Timeline */}
                <GlassCard className="p-10 rounded-[3rem] border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
                    <h4 className="text-lg font-bold text-off-white uppercase tracking-widest mb-8 border-b border-white/5 pb-4">Linha do Tempo</h4>
                    <div className="space-y-6">
                        {timeline.map((item, i) => (
                            <div key={i} className="flex gap-4 items-start p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                <div className="size-10 rounded-full bg-gold/10 flex items-center justify-center text-gold shrink-0">
                                    <span className="text-[10px] font-bold">{item.semester}</span>
                                </div>
                                <div>
                                    <p className="text-off-white font-bold font-serif italic">{item.title}</p>
                                    <p className="text-[10px] text-off-white/40 uppercase tracking-widest">{item.category}</p>
                                </div>
                            </div>
                        ))}
                        {timeline.length === 0 && (
                            <p className="text-off-white/20 italic text-center py-10">Nenhum marco registrado.</p>
                        )}
                    </div>
                </GlassCard>

                {/* Extra Tabs Content */}
                <div className="space-y-10">
                    <GlassCard className="p-10 rounded-[3rem] border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
                        <h4 className="text-lg font-bold text-off-white uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Iniciativas</h4>
                        <div
                            className="text-off-white/60 text-sm leading-relaxed prose prose-invert max-w-none break-words"
                            dangerouslySetInnerHTML={{ __html: honoree.initiatives || '<p className="text-off-white/20">Nenhuma iniciativa cadastrada.</p>' }}
                        />
                    </GlassCard>
                    <GlassCard className="p-10 rounded-[3rem] border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
                        <h4 className="text-lg font-bold text-off-white uppercase tracking-widest mb-6 border-b border-white/5 pb-4">Reconhecimentos</h4>
                        <div
                            className="text-off-white/60 text-sm leading-relaxed prose prose-invert max-w-none break-words"
                            dangerouslySetInnerHTML={{ __html: honoree.recognitions || '<p className="text-off-white/20">Nenhum reconhecimento cadastrado.</p>' }}
                        />
                    </GlassCard>
                </div>
            </div>
        </div>
    );
};

export default HonoreeDetailsAdminPage;
