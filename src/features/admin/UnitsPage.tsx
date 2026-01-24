import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../../components/ui/GlassCard';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/supabase';
import UnitsMap from './components/UnitsMap';
import ConfirmModal from '../../components/ui/ConfirmModal';

type Unit = Database['public']['Tables']['units']['Row'];
type Brand = Database['public']['Tables']['brands']['Row'];

interface UnitWithBrand extends Unit {
    brands?: Brand;
}

const UnitsPage: React.FC = () => {
    const navigate = useNavigate();
    const [units, setUnits] = useState<UnitWithBrand[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedBrandId, setSelectedBrandId] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [unitsRes, brandsRes] = await Promise.all([
                supabase.from('units').select('*, brands(*)').order('name'),
                supabase.from('brands').select('*').order('name')
            ]);

            if (unitsRes.error) throw unitsRes.error;
            if (brandsRes.error) throw brandsRes.error;

            setUnits(unitsRes.data || []);
            setBrands(brandsRes.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteClick = (id: string) => {
        setItemToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;

        const { error } = await supabase
            .from('units')
            .delete()
            .eq('id', itemToDelete);

        if (error) {
            console.error('Error deleting unit:', error);
            setAlertMessage('Erro ao excluir unidade: ' + error.message);
            setIsAlertModalOpen(true);
        } else {
            fetchData();
        }
        setItemToDelete(null);
    };

    const filteredUnits = units.filter(unit => {
        const matchesSearch = unit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            unit.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesBrand = selectedBrandId === 'all' || unit.brand_id === selectedBrandId;
        return matchesSearch && matchesBrand;
    });

    const totalPages = Math.ceil(filteredUnits.length / itemsPerPage);
    const paginatedUnits = filteredUnits.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="space-y-12 animate-fade-in pb-20 px-6 md:px-10 lg:px-16 pt-20 lg:pt-8">
            <div className="flex flex-wrap justify-between items-end gap-8 mb-16">
                <div className="space-y-4">
                    <span className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] block">Gestão Geográfica</span>
                    <h2 className="text-5xl font-bold font-serif text-off-white italic">Gestão de <span className="text-gold-gradient">Unidades</span></h2>
                    <p className="text-off-white/40 max-w-2xl text-lg font-light italic">
                        Administração de polos e centros universitários Ser Educacional.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/admin/unidades/novo')}
                    className="bg-gold hover:bg-gold-light hover:scale-[1.02] active:scale-[0.98] transition-all text-navy-deep px-8 py-5 rounded-full font-bold text-[10px] uppercase tracking-[0.3em] shadow-[0_20px_40px_rgba(212,175,55,0.2)] group"
                >
                    <span className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-lg">add_location</span>
                        Nova Unidade
                    </span>
                </button>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] backdrop-blur-xl">
                <div className="flex flex-1 gap-4 w-full">
                    <div className="relative flex-1 group">
                        <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-off-white/20 group-focus-within:text-gold transition-colors">search</span>
                        <input
                            type="text"
                            placeholder="Buscar por nome ou localização..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full bg-white/5 border border-white/10 py-4 pl-16 pr-6 rounded-xl text-off-white outline-none focus:border-gold/30 transition-all"
                        />
                    </div>

                    <select
                        value={selectedBrandId}
                        onChange={(e) => {
                            setSelectedBrandId(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="bg-white/5 border border-white/10 px-6 py-4 rounded-xl text-off-white outline-none focus:border-gold/30 transition-all text-xs font-bold uppercase tracking-widest"
                    >
                        <option value="all">Todas as Marcas</option>
                        {brands.map(brand => (
                            <option key={brand.id} value={brand.id}>{brand.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-4 bg-white/5 p-1.5 rounded-xl border border-white/10">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-gold text-navy-deep shadow-lg' : 'text-off-white/40 hover:text-off-white'}`}
                    >
                        <span className="material-symbols-outlined text-lg">grid_view</span>
                        Grade
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-gold text-navy-deep shadow-lg' : 'text-off-white/40 hover:text-off-white'}`}
                    >
                        <span className="material-symbols-outlined text-lg">view_list</span>
                        Lista
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
                </div>
            ) : (
                <div className="space-y-12">
                    {viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {paginatedUnits.map((unit) => (
                                <GlassCard key={unit.id} className="p-8 rounded-[2.5rem] border-white/5 hover:border-gold/20 transition-all group relative">
                                    <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => navigate(`/admin/unidades/${unit.id}/editar`)}
                                            className="p-2 rounded-full bg-white/5 text-gold hover:bg-gold hover:text-navy-deep transition-all"
                                        >
                                            <span className="material-symbols-outlined text-sm">edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(unit.id)}
                                            className="p-2 rounded-full bg-white/5 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                                        >
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </div>
                                    <div className="size-12 rounded-2xl bg-gold/5 flex items-center justify-center mb-6 group-hover:bg-gold transition-all duration-500">
                                        <span className="material-symbols-outlined text-gold group-hover:text-navy-deep">location_city</span>
                                    </div>
                                    <div className="space-y-1 mb-6">
                                        <span className="text-[8px] font-bold text-gold uppercase tracking-[0.3em]">{unit.brands?.name || 'Sem Marca'}</span>
                                        <h3 className="text-xl font-bold text-off-white font-serif">{unit.name}</h3>
                                    </div>
                                    <p className="text-off-white/40 text-[10px] uppercase tracking-widest">{unit.location}</p>
                                </GlassCard>
                            ))}
                        </div>
                    ) : (
                        <div className="glass-card rounded-[2.5rem] border-white/5 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/5 border-b border-white/10">
                                        <th className="px-8 py-6 text-[10px] font-bold text-gold uppercase tracking-[0.2em]">Unidade</th>
                                        <th className="px-8 py-6 text-[10px] font-bold text-gold uppercase tracking-[0.2em]">Marca</th>
                                        <th className="px-8 py-6 text-[10px] font-bold text-gold uppercase tracking-[0.2em]">Localização</th>
                                        <th className="px-8 py-6 text-[10px] font-bold text-gold uppercase tracking-[0.2em] text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedUnits.map((unit) => (
                                        <tr key={unit.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 rounded-xl bg-gold/5 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-navy-deep transition-all">
                                                        <span className="material-symbols-outlined text-lg">location_city</span>
                                                    </div>
                                                    <span className="text-off-white font-serif italic text-lg">{unit.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-gold text-[10px] font-bold uppercase tracking-widest">{unit.brands?.name || '-'}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="text-off-white/40 text-[10px] font-bold uppercase tracking-widest">{unit.location}</span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex justify-end gap-3">
                                                    <button
                                                        onClick={() => navigate(`/admin/unidades/${unit.id}/editar`)}
                                                        className="size-10 rounded-xl bg-white/5 text-gold hover:bg-gold hover:text-navy-deep transition-all flex items-center justify-center"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(unit.id)}
                                                        className="size-10 rounded-xl bg-white/5 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {filteredUnits.length === 0 && (
                        <div className="py-20 text-center">
                            <span className="material-symbols-outlined text-6xl text-white/5 mb-6">search_off</span>
                            <p className="text-off-white/20 text-xl italic">Nenhuma unidade encontrada para sua busca.</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-12">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="size-12 rounded-xl glass-card border-white/10 flex items-center justify-center text-off-white disabled:opacity-20 disabled:cursor-not-allowed hover:border-gold/30 transition-all"
                            >
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>

                            <div className="flex items-center gap-2">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`size-12 rounded-xl font-bold text-[10px] transition-all ${currentPage === i + 1 ? 'bg-gold text-navy-deep shadow-lg' : 'glass-card border-white/10 text-off-white/40 hover:text-off-white'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="size-12 rounded-xl glass-card border-white/10 flex items-center justify-center text-off-white disabled:opacity-20 disabled:cursor-not-allowed hover:border-gold/30 transition-all"
                            >
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    )}
                </div>
            )}

            <GlassCard className="rounded-[3rem] overflow-hidden border-white/5 mt-12">
                <div className="p-10 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-2xl font-bold font-serif text-off-white italic">Mapa de <span className="text-gold">Atuação</span></h3>
                </div>
                <div className="aspect-[21/9] bg-navy-light/30 relative">
                    <UnitsMap units={units} />
                </div>
            </GlassCard>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Excluir Unidade"
                message="Tem certeza que deseja excluir esta unidade? Esta ação não poderá ser desfeita."
                confirmLabel="Sim, Excluir"
                cancelLabel="Cancelar"
                type="danger"
            />

            <ConfirmModal
                isOpen={isAlertModalOpen}
                onClose={() => setIsAlertModalOpen(false)}
                onConfirm={() => setIsAlertModalOpen(false)}
                title="Aviso"
                message={alertMessage}
                confirmLabel="OK"
                type="warning"
            />
        </div>
    );
};

export default UnitsPage;
