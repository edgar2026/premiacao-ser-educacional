import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import GlassCard from '../../components/ui/GlassCard';
import type { Database } from '../../types/supabase';
import ConfirmModal from '../../components/ui/ConfirmModal';

type Regional = Database['public']['Tables']['regionals']['Row'];
type Brand = Database['public']['Tables']['brands']['Row'];
type Unit = Database['public']['Tables']['units']['Row'];

const GeographicRegistrationPage: React.FC = () => {
    const [regionals, setRegionals] = useState<Regional[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [units, setUnits] = useState<(Unit & { brands?: Brand; regionals?: Regional })[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Form States
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editType, setEditType] = useState<'regional' | 'brand' | 'unit' | null>(null);
    const [formData, setFormData] = useState({ name: '', location: '', brandId: '', regionalId: '' });

    // Modal States
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ type: 'regional' | 'brand' | 'unit', id: string } | null>(null);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertConfig, setAlertConfig] = useState({ title: 'Aviso', message: '', type: 'warning' as 'warning' | 'info' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [regRes, brandRes, unitRes] = await Promise.all([
                supabase.from('regionals').select('*').order('name'),
                supabase.from('brands').select('*').order('name'),
                supabase.from('units').select('*, brands(*), regionals(*)').order('name')
            ]);

            setRegionals(regRes.data || []);
            setBrands(brandRes.data || []);
            setUnits(unitRes.data || []);
        } catch (error) {
            console.error('Error fetching geographic data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const showAlert = (message: string, title = 'Aviso', type: 'warning' | 'info' = 'warning') => {
        setAlertConfig({ title, message, type });
        setIsAlertModalOpen(true);
    };

    const handleSave = async (type: 'regional' | 'brand' | 'unit') => {
        try {
            // Validação básica
            if (!formData.name.trim()) {
                showAlert('Por favor, preencha o nome.');
                return;
            }

            if (type === 'unit') {
                if (!formData.location.trim()) {
                    showAlert('Por favor, preencha a localização.');
                    return;
                }
                if (!formData.brandId) {
                    showAlert('Por favor, selecione uma marca.');
                    return;
                }
            }

            let error;
            if (type === 'regional') {
                if (editingId) {
                    ({ error } = await supabase.from('regionals').update({ name: formData.name.trim() }).eq('id', editingId));
                } else {
                    ({ error } = await supabase.from('regionals').insert([{ name: formData.name.trim() }]));
                }
            } else if (type === 'brand') {
                if (editingId) {
                    ({ error } = await supabase.from('brands').update({ name: formData.name.trim() }).eq('id', editingId));
                } else {
                    ({ error } = await supabase.from('brands').insert([{ name: formData.name.trim() }]));
                }
            } else if (type === 'unit') {
                const unitData = {
                    name: formData.name.trim(),
                    location: formData.location.trim(),
                    brand_id: formData.brandId,
                    regional_id: formData.regionalId || null
                };
                if (editingId) {
                    ({ error } = await supabase.from('units').update(unitData).eq('id', editingId));
                } else {
                    ({ error } = await supabase.from('units').insert([unitData]));
                }
            }

            if (error) throw error;

            // Mostrar mensagem de sucesso
            const action = editingId ? 'atualizado' : 'cadastrado';
            const typeLabel = type === 'regional' ? 'Regional' : type === 'brand' ? 'Marca' : 'Unidade';
            showAlert(`${typeLabel} ${action} com sucesso!`, 'Sucesso', 'info');

            resetForm();
            fetchData();
        } catch (error: any) {
            console.error('Erro ao salvar:', error);

            // Mensagens de erro mais específicas
            if (error.code === '23505') {
                showAlert('Erro: Já existe um registro com esse nome.');
            } else if (error.code === '23503') {
                showAlert('Erro: Referência inválida. Verifique se todos os dados relacionados existem.');
            } else {
                showAlert('Erro ao salvar: ' + (error.message || 'Erro desconhecido'));
            }
        }
    };

    const handleDeleteClick = (type: 'regional' | 'brand' | 'unit', id: string) => {
        setItemToDelete({ type, id });
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            const { error } = await supabase.from(itemToDelete.type === 'regional' ? 'regionals' : itemToDelete.type === 'brand' ? 'brands' : 'units').delete().eq('id', itemToDelete.id);
            if (error) throw error;
            fetchData();
        } catch (error: any) {
            showAlert('Erro ao excluir: ' + error.message);
        }
        setItemToDelete(null);
    };

    const resetForm = () => {
        setEditingId(null);
        setEditType(null);
        setFormData({ name: '', location: '', brandId: '', regionalId: '' });
    };

    const startEdit = (type: 'regional' | 'brand' | 'unit', item: any) => {
        setEditType(type);
        setEditingId(item.id);
        setFormData({
            name: item.name,
            location: item.location || '',
            brandId: item.brand_id || '',
            regionalId: item.regional_id || ''
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-fade-in pb-20 px-6 md:px-10 lg:px-16 pt-20 lg:pt-8">
            <div className="flex flex-wrap justify-between items-end gap-8 mb-16">
                <div className="space-y-4">
                    <span className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] block">Administração Central</span>
                    <h2 className="text-5xl font-bold font-serif text-off-white italic">Gestão <span className="text-gold-gradient">Regional</span></h2>
                    <p className="text-off-white/40 max-w-2xl text-lg font-light italic">
                        Configure regionais, marcas e unidades em um único lugar.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Regionais Section */}
                <GlassCard className="p-8 rounded-[2.5rem] border-white/5 flex flex-col h-fit">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-bold font-serif text-off-white italic">Regionais</h3>
                        <button
                            onClick={() => { resetForm(); setEditType('regional'); }}
                            className="size-10 rounded-full bg-gold/10 text-gold flex items-center justify-center hover:bg-gold hover:text-navy-deep transition-all"
                        >
                            <span className="material-symbols-outlined">add</span>
                        </button>
                    </div>

                    {editType === 'regional' && (
                        <div className="mb-8 p-6 rounded-2xl bg-white/5 border border-gold/20 space-y-4 animate-slide-down">
                            <input
                                className="w-full bg-navy-deep border border-white/10 p-3 rounded-xl text-off-white outline-none focus:border-gold/50"
                                placeholder="Nome da Regional"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                            <div className="flex gap-2">
                                <button onClick={() => handleSave('regional')} className="flex-1 bg-gold text-navy-deep py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest">Salvar</button>
                                <button onClick={resetForm} className="flex-1 bg-white/5 text-off-white/40 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest">Cancelar</button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {regionals.map(reg => (
                            <div key={reg.id} className="flex justify-between items-center p-4 rounded-xl bg-white/[0.02] border border-white/5 group hover:border-gold/20 transition-all">
                                <span className="text-off-white font-medium">{reg.name}</span>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => startEdit('regional', reg)} className="text-gold hover:scale-110 transition-transform"><span className="material-symbols-outlined text-sm">edit</span></button>
                                    <button onClick={() => handleDeleteClick('regional', reg.id)} className="text-red-400 hover:scale-110 transition-transform"><span className="material-symbols-outlined text-sm">delete</span></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                {/* Marcas Section */}
                <GlassCard className="p-8 rounded-[2.5rem] border-white/5 flex flex-col h-fit">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-bold font-serif text-off-white italic">Marcas</h3>
                        <button
                            onClick={() => { resetForm(); setEditType('brand'); }}
                            className="size-10 rounded-full bg-gold/10 text-gold flex items-center justify-center hover:bg-gold hover:text-navy-deep transition-all"
                        >
                            <span className="material-symbols-outlined">add</span>
                        </button>
                    </div>

                    {editType === 'brand' && (
                        <div className="mb-8 p-6 rounded-2xl bg-white/5 border border-gold/20 space-y-4 animate-slide-down">
                            <input
                                className="w-full bg-navy-deep border border-white/10 p-3 rounded-xl text-off-white outline-none focus:border-gold/50"
                                placeholder="Nome da Marca"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                            <div className="flex gap-2">
                                <button onClick={() => handleSave('brand')} className="flex-1 bg-gold text-navy-deep py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest">Salvar</button>
                                <button onClick={resetForm} className="flex-1 bg-white/5 text-off-white/40 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest">Cancelar</button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {brands.map(brand => (
                            <div key={brand.id} className="flex justify-between items-center p-4 rounded-xl bg-white/[0.02] border border-white/5 group hover:border-gold/20 transition-all">
                                <span className="text-off-white font-medium">{brand.name}</span>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => startEdit('brand', brand)} className="text-gold hover:scale-110 transition-transform"><span className="material-symbols-outlined text-sm">edit</span></button>
                                    <button onClick={() => handleDeleteClick('brand', brand.id)} className="text-red-400 hover:scale-110 transition-transform"><span className="material-symbols-outlined text-sm">delete</span></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                {/* Unidades Section */}
                <GlassCard className="p-8 rounded-[2.5rem] border-white/5 flex flex-col h-fit lg:col-span-1">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-bold font-serif text-off-white italic">Unidades</h3>
                        <button
                            onClick={() => { resetForm(); setEditType('unit'); }}
                            className="size-10 rounded-full bg-gold/10 text-gold flex items-center justify-center hover:bg-gold hover:text-navy-deep transition-all"
                        >
                            <span className="material-symbols-outlined">add</span>
                        </button>
                    </div>

                    {editType === 'unit' && (
                        <div className="mb-8 p-6 rounded-2xl bg-white/5 border border-gold/20 space-y-4 animate-slide-down">
                            <input
                                className="w-full bg-navy-deep border border-white/10 p-3 rounded-xl text-off-white outline-none focus:border-gold/50"
                                placeholder="Nome da Unidade"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                            <input
                                className="w-full bg-navy-deep border border-white/10 p-3 rounded-xl text-off-white outline-none focus:border-gold/50"
                                placeholder="Localização (Cidade, UF)"
                                value={formData.location}
                                onChange={e => setFormData({ ...formData, location: e.target.value })}
                            />
                            <select
                                className="w-full bg-navy-deep border border-white/10 p-3 rounded-xl text-off-white outline-none focus:border-gold/50"
                                value={formData.brandId}
                                onChange={e => setFormData({ ...formData, brandId: e.target.value })}
                            >
                                <option value="">Selecionar Marca</option>
                                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                            <select
                                className="w-full bg-navy-deep border border-white/10 p-3 rounded-xl text-off-white outline-none focus:border-gold/50"
                                value={formData.regionalId}
                                onChange={e => setFormData({ ...formData, regionalId: e.target.value })}
                            >
                                <option value="">Selecionar Regional (Opcional)</option>
                                {regionals.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                            <div className="flex gap-2">
                                <button onClick={() => handleSave('unit')} className="flex-1 bg-gold text-navy-deep py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest">Salvar</button>
                                <button onClick={resetForm} className="flex-1 bg-white/5 text-off-white/40 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest">Cancelar</button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {units.map(unit => (
                            <div key={unit.id} className="flex flex-col p-4 rounded-xl bg-white/[0.02] border border-white/5 group hover:border-gold/20 transition-all">
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col">
                                        <span className="text-off-white font-medium">{unit.name}</span>
                                        <span className="text-[9px] text-gold uppercase tracking-widest font-bold">{unit.brands?.name} • {unit.regionals?.name || 'Sem Regional'}</span>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => startEdit('unit', unit)} className="text-gold hover:scale-110 transition-transform"><span className="material-symbols-outlined text-sm">edit</span></button>
                                        <button onClick={() => handleDeleteClick('unit', unit.id)} className="text-red-400 hover:scale-110 transition-transform"><span className="material-symbols-outlined text-sm">delete</span></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Excluir Registro"
                message="Tem certeza que deseja excluir este registro? Esta ação não poderá ser desfeita."
                confirmLabel="Sim, Excluir"
                cancelLabel="Cancelar"
                type="danger"
            />

            <ConfirmModal
                isOpen={isAlertModalOpen}
                onClose={() => setIsAlertModalOpen(false)}
                onConfirm={() => setIsAlertModalOpen(false)}
                title={alertConfig.title}
                message={alertConfig.message}
                confirmLabel="OK"
                type={alertConfig.type === 'warning' ? 'warning' : 'info'}
            />
        </div>
    );
};

export default GeographicRegistrationPage;
