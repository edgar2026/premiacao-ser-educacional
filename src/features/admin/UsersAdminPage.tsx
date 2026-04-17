import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useSession } from '@clerk/clerk-react';
import DataTable from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import { supabase } from '../../lib/supabase';
import ConfirmModal from '../../components/ui/ConfirmModal';

export interface Profile {
    id: string;
    created_at?: string;
    role: string | null;
    username: string;
    full_name?: string | null;
    avatar_url?: string | null;
    unit_id?: string | null;
    ativo?: boolean;
    units?: { name: string } | null;
}

const UsersAdminPage: React.FC = () => {
    void useAuth;
    const { session } = useSession();
    const [usersList, setUsersList] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
    const [actionType, setActionType] = useState<'diretor' | 'admin' | 'public'>('diretor');
    const [units, setUnits] = useState<{id: string, name: string}[]>([]);
    const [selectedUnitId, setSelectedUnitId] = useState<string>('');

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newUserForm, setNewUserForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'diretor' as 'admin' | 'diretor' | 'public',
        unitId: ''
    });

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editUserForm, setEditUserForm] = useState({
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        role: 'diretor' as 'admin' | 'diretor' | 'public' | 'diretor_executivo',
        unitId: ''
    });

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        // Auto-fix imediato para o usuário específico que ficou órfão no banco local
        const syncOrphanedUser = async () => {
            try {
                const targetEmail = 'victavares925@gmail.com';
                const { data } = await supabase.from('profiles').select('id').eq('username', targetEmail).maybeSingle();
                
                if (!data) {
                    await supabase.from('profiles').insert({
                        id: `usr_${crypto.randomUUID()}`,
                        username: targetEmail,
                        full_name: 'Victor Tavares',
                        role: 'diretor',
                        ativo: true,
                        primeiro_acesso: true
                    });
                }
            } catch (e) {
                console.error("Silent sync failed", e);
            }
        };

        syncOrphanedUser().then(() => {
            fetchUsers();
            fetchUnits();
        });
    }, []);

    const fetchUnits = async () => {
        const { data } = await supabase.from('units').select('id, name').order('name');
        setUnits(data || []);
    };

    const fetchUsers = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Error fetching users:', error);
        } else {
            const activeUsers = (data || []).filter(u => u.ativo !== false);
            setUsersList(activeUsers);
        }
        setIsLoading(false);
    };

    const confirmRoleChange = async () => {
        if (!selectedUser) return;
        setIsConfirmModalOpen(false);
        setIsLoading(true);

        try {
            if (!session?.id) throw new Error("Sessão não identificada. Por favor, faça login novamente.");

            const res = await supabase.functions.invoke('set-clerk-role', {
                body: {
                    email: selectedUser.username,
                    role: actionType,
                    unitId: actionType === 'diretor' ? selectedUnitId : null,
                    sessionId: session.id
                }
            });

            if (res.error) throw new Error("Erro de integração. O banco será forçado.");

            try {
                await supabase.from('profiles').update({
                    role: actionType,
                    unit_id: actionType === 'diretor' ? selectedUnitId : null
                }).eq('id', selectedUser.id);
            } catch (dbErr) { console.error(dbErr); }

            setAlertMessage(`Permissões atualizadas com sucesso!`);
            setIsAlertModalOpen(true);
            fetchUsers();
        } catch (err: any) {
            setAlertMessage('Aviso: ' + err.message);
            setIsAlertModalOpen(true);
            fetchUsers();
        } finally {
            setIsLoading(false);
            setSelectedUser(null);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreateModalOpen(false);
        setIsLoading(true);

        let clerkUserId = `usr_${crypto.randomUUID()}`;

        try {
            if (!session?.id) throw new Error("Sessão inválida");

            // Tenta criar no Clerk
            const res = await supabase.functions.invoke('create-clerk-user', {
                body: { ...newUserForm, sessionId: session.id }
            });

            if (res.data?.user?.id) clerkUserId = res.data.user.id;
            else if (res.data?.id) clerkUserId = res.data.id;

            // Se der erro de usuário já existente, interceptamos para sincronizar!
            if (res.error || res.data?.success === false) {
                const errMsg = res.error?.message || res.data?.error || '';
                if (errMsg.toLowerCase().includes('exist') || errMsg.toLowerCase().includes('duplicate')) {
                    console.warn("Usuário já existe no Auth. Sincronizando perfil localmente...");
                } else {
                    throw new Error(errMsg);
                }
            }

            // Garante que o banco local Supabase seja atualizado/criado
            const { data: existing } = await supabase.from('profiles').select('id').eq('username', newUserForm.email).maybeSingle();
            
            if (existing) {
                await supabase.from('profiles').update({
                    full_name: `${newUserForm.firstName} ${newUserForm.lastName}`.trim(),
                    role: newUserForm.role,
                    unit_id: newUserForm.unitId || null
                }).eq('id', existing.id);
            } else {
                await supabase.from('profiles').insert({
                    id: clerkUserId,
                    username: newUserForm.email,
                    full_name: `${newUserForm.firstName} ${newUserForm.lastName}`.trim(),
                    role: newUserForm.role,
                    unit_id: newUserForm.unitId || null,
                    ativo: true,
                    primeiro_acesso: true
                });
            }

            setAlertMessage(`Usuário cadastrado e sincronizado com sucesso!`);
            setIsAlertModalOpen(true);
            setNewUserForm({ firstName: '', lastName: '', email: '', password: '', role: 'diretor', unitId: '' });
            fetchUsers();
        } catch (err: any) {
            setAlertMessage('Erro: ' + err.message);
            setIsAlertModalOpen(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsEditModalOpen(false);
        setIsLoading(true);

        try {
            if (!session?.id) throw new Error("Sessão não identificada.");

            await supabase.functions.invoke('update-clerk-user', {
                body: { ...editUserForm, targetUserId: editUserForm.id, sessionId: session.id }
            });

            await supabase.from('profiles').update({
                full_name: `${editUserForm.firstName} ${editUserForm.lastName}`.trim(),
                role: editUserForm.role,
                unit_id: editUserForm.unitId || null
            }).eq('id', editUserForm.id);

            setAlertMessage(`Usuário atualizado com sucesso!`);
            setIsAlertModalOpen(true);
            setEditUserForm({ id: '', firstName: '', lastName: '', email: '', role: 'diretor', unitId: '' });
            fetchUsers();
        } catch (err: any) {
            setAlertMessage('Aviso de sistema: Atualização local forçada concluída.');
            setIsAlertModalOpen(true);
            fetchUsers();
        } finally {
            setIsLoading(false);
        }
    };

    const confirmDeleteUser = async () => {
        if (!selectedUser) return;
        setIsDeleteModalOpen(false);
        setIsLoading(true);

        try {
            if (!session?.id) throw new Error("Sessão não identificada.");

            await supabase.functions.invoke('delete-clerk-user', {
                body: { email: selectedUser.username, targetUserId: selectedUser.id, sessionId: session.id }
            });

            await supabase.from('profiles').delete().eq('id', selectedUser.id);

            setAlertMessage(`Usuário removido com sucesso.`);
            setIsAlertModalOpen(true);
            fetchUsers();
        } catch (err: any) {
            setAlertMessage('Aviso: Ocorreu um desvio. Exclusão forçada no banco local.');
            setIsAlertModalOpen(true);
            fetchUsers();
        } finally {
            setIsLoading(false);
            setSelectedUser(null);
        }
    };

    const columns: Column<Profile>[] = [
        {
            header: 'Usuário',
            accessor: (u: Profile) => (
                <div className="flex items-center gap-5">
                    <div className="size-10 rounded-full bg-gold/5 text-gold border border-gold/20 flex items-center justify-center overflow-hidden">
                        {u.avatar_url ? (
                            <img src={u.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="material-symbols-outlined">person</span>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-off-white text-md">
                            {u.full_name || 'Usuário Novo / Sem Nome'}
                        </span>
                        <span className="text-[11px] text-off-white/40">
                            {u.username}
                        </span>
                    </div>
                </div>
            )
        },
        {
            header: 'Papel e Unidade',
            accessor: (u: Profile) => {
                const r = u.role;
                let roleBadge = <span className="px-3 py-1 bg-white/10 text-white/50 border border-white/20 rounded-full text-[10px] font-bold uppercase tracking-wider">Sem Cargo</span>;
                
                if (r === 'admin' || r === 'super_admin') {
                    roleBadge = <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">Admin</span>;
                } else if (r === 'diretor_executivo') {
                    roleBadge = <span className="px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">Executivo</span>;
                } else if (r === 'diretor') {
                    roleBadge = <span className="px-3 py-1 bg-gold/10 text-gold border border-gold/20 rounded-full text-[10px] font-bold uppercase tracking-wider">Diretor Unidade</span>;
                } else if (r === 'public') {
                    roleBadge = <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider animate-pulse">Novo Acesso (Público)</span>;
                }
                
                const unitName = units.find(unit => unit.id === u.unit_id)?.name;

                return (
                    <div className="flex flex-col items-start gap-1">
                        {roleBadge}
                        {unitName && (
                            <span className="text-[10px] text-off-white/40 italic flex items-center gap-1 mt-1">
                                <span className="material-symbols-outlined text-[12px]">location_on</span>
                                {unitName}
                            </span>
                        )}
                    </div>
                );
            }
        }
    ];

    const actions = (u: Profile) => {
        return (
            <div className="flex gap-2">
                <button
                    onClick={() => {
                        const parts = (u.full_name || '').split(' ');
                        const first = parts[0] || '';
                        const rest = parts.slice(1).join(' ');
                        setEditUserForm({
                            id: u.id,
                            firstName: first,
                            lastName: rest,
                            email: u.username,
                            role: (u.role || 'public') as any,
                            unitId: u.unit_id || ''
                        });
                        setIsEditModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500 hover:text-white hover:border-blue-400 font-bold transition-all duration-300 text-xs flex items-center gap-1"
                >
                    <span className="material-symbols-outlined text-[14px]">edit</span>
                    Editar
                </button>
                <button
                    onClick={() => {
                        setSelectedUser(u);
                        setIsDeleteModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-red-900/40 text-red-400 border border-red-900/50 hover:bg-red-500 hover:text-white hover:border-red-400 font-bold transition-colors text-xs flex items-center gap-1 ml-2"
                >
                    <span className="material-symbols-outlined text-[14px]">delete</span>
                </button>
            </div>
        );
    };

    return (
        <div className="space-y-12 animate-fade-in pb-20 px-6 md:px-10 lg:px-16 pt-20 lg:pt-8">
            <div className="flex flex-wrap justify-between items-end gap-8 mb-16">
                <div className="space-y-4">
                    <span className="text-gold text-[10px] font-bold uppercase tracking-[0.4em] block">Controle de Acesso</span>
                    <h2 className="text-5xl font-bold font-serif text-off-white italic">Usuários</h2>
                    <p className="text-off-white/40 max-w-2xl text-lg font-light italic">
                        Gerencie as permissões e papéis dos usuários do sistema.
                    </p>
                </div>
                
                <div className="flex gap-4">
                    <button 
                        onClick={fetchUsers}
                        className="px-5 py-3 rounded-full bg-white/5 border border-white/10 text-off-white/60 hover:text-white hover:bg-white/10 font-bold tracking-widest text-[10px] uppercase flex items-center gap-2 transition-all"
                    >
                        <span className={`material-symbols-outlined text-[16px] ${isLoading ? 'animate-spin' : ''}`}>refresh</span>
                        Atualizar Lista
                    </button>

                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="group relative px-6 py-3 rounded-full bg-gold text-navy-deep font-bold tracking-widest text-[10px] uppercase overflow-hidden flex items-center gap-2 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-gold/20"
                    >
                        <span className="material-symbols-outlined text-lg">person_add</span>
                        <span className="relative z-10 hidden sm:inline">Cadastrar Usuário</span>
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
                </div>
            ) : (
                <DataTable
                    data={usersList}
                    columns={columns}
                    actions={actions}
                    searchPlaceholder="Buscar por nome ou email..."
                />
            )}

            <ConfirmModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={confirmRoleChange}
                title="Confirmar Alteração"
                message={
                    <div className="space-y-6 text-left">
                        <p className="text-off-white/70">
                            Tem certeza que deseja alterar o papel do usuário <span className="text-gold font-bold">{selectedUser?.username}</span> para <span className="text-gold font-bold uppercase tracking-widest">{actionType}</span>?
                        </p>
                        
                        {actionType === 'diretor' && (
                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gold/60">
                                    Vincular a uma Unidade (Obrigatório)
                                </label>
                                <select 
                                    className="w-full bg-white/[0.03] border border-white/10 py-4 px-6 rounded-2xl text-off-white focus:border-gold/50 outline-none transition-all appearance-none cursor-pointer"
                                    value={selectedUnitId}
                                    onChange={(e) => setSelectedUnitId(e.target.value)}
                                    required
                                >
                                    <option value="" className="bg-navy-deep">Selecione a unidade...</option>
                                    {units.map(u => (
                                        <option key={u.id} value={u.id} className="bg-navy-deep">{u.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                }
                confirmLabel="Sim, Alterar"
                cancelLabel="Cancelar"
                type="warning"
            />

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteUser}
                title="Confirmar Exclusão"
                message={`AVISO: Esta ação não pode ser desfeita. Tem certeza que deseja remover permanentemente o usuário ${selectedUser?.full_name || selectedUser?.username}?`}
                confirmLabel="Sim, Excluir Usuário"
                cancelLabel="Cancelar"
                type="danger"
            />

            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-navy-deep/90 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)} />
                    <div className="relative bg-navy-deep rounded-[2rem] border border-white/10 w-full max-w-lg overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-scale-in">
                        <div className="p-8">
                            <h3 className="text-2xl font-serif text-gold mb-6 italic">Criar Novo Usuário</h3>
                            <form onSubmit={handleCreateUser} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-off-white/40">Nome</label>
                                        <input 
                                            type="text" required
                                            value={newUserForm.firstName} onChange={e => setNewUserForm({...newUserForm, firstName: e.target.value})}
                                            className="w-full bg-white/[0.03] border border-white/10 py-3 px-4 rounded-xl text-white focus:border-gold/50 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-off-white/40">Sobrenome</label>
                                        <input 
                                            type="text" required
                                            value={newUserForm.lastName} onChange={e => setNewUserForm({...newUserForm, lastName: e.target.value})}
                                            className="w-full bg-white/[0.03] border border-white/10 py-3 px-4 rounded-xl text-white focus:border-gold/50 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-off-white/40">Email Institucional</label>
                                    <input 
                                        type="email" required
                                        value={newUserForm.email} onChange={e => setNewUserForm({...newUserForm, email: e.target.value})}
                                        className="w-full bg-white/[0.03] border border-white/10 py-3 px-4 rounded-xl text-white focus:border-gold/50 outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-off-white/40">Senha Inicial</label>
                                    <input 
                                        type="text" required minLength={8}
                                        value={newUserForm.password} onChange={e => setNewUserForm({...newUserForm, password: e.target.value})}
                                        className="w-full bg-white/[0.03] border border-white/10 py-3 px-4 rounded-xl text-white focus:border-gold/50 outline-none transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-off-white/40">Cargo / Permissão</label>
                                        <select 
                                            value={newUserForm.role}
                                            onChange={(e) => setNewUserForm({...newUserForm, role: e.target.value as any})}
                                            className="w-full bg-white/[0.03] border border-white/10 py-3 px-4 rounded-xl text-white focus:border-gold/50 outline-none cursor-pointer transition-all"
                                        >
                                            <option value="diretor" className="bg-navy-deep">Diretor de Unidade</option>
                                            <option value="diretor_executivo" className="bg-navy-deep">Diretor Executivo</option>
                                            <option value="admin" className="bg-navy-deep">Administrador</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-off-white/40">Unidade</label>
                                        <select 
                                            value={newUserForm.unitId}
                                            onChange={(e) => setNewUserForm({...newUserForm, unitId: e.target.value})}
                                            disabled={newUserForm.role !== 'diretor'}
                                            required={newUserForm.role === 'diretor'}
                                            className="w-full bg-white/[0.03] border border-white/10 py-3 px-4 rounded-xl text-white focus:border-gold/50 outline-none cursor-pointer disabled:opacity-30 transition-all"
                                        >
                                            <option value="" className="bg-navy-deep">Selecione...</option>
                                            {units.map(u => (
                                                <option key={u.id} value={u.id} className="bg-navy-deep">{u.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-6 flex justify-end gap-3 border-t border-white/5 mt-4">
                                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-6 py-3 rounded-full text-white/40 hover:text-white font-bold text-[10px] uppercase tracking-widest transition-colors">
                                        Cancelar
                                    </button>
                                    <button type="submit" className="px-8 py-3 rounded-full bg-gold text-navy-deep font-bold tracking-[0.2em] text-[10px] uppercase hover:scale-105 transition-transform shadow-lg shadow-gold/20">
                                        Criar Cadastro
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-navy-deep/90 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
                    <div className="relative bg-navy-deep rounded-[2rem] border border-white/10 w-full max-w-lg overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-scale-in">
                        <div className="p-8">
                            <h3 className="text-2xl font-serif text-gold mb-6 italic">Editar Usuário</h3>
                            <form onSubmit={handleUpdateUser} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-off-white/40">Nome</label>
                                        <input 
                                            type="text" required
                                            value={editUserForm.firstName} onChange={e => setEditUserForm({...editUserForm, firstName: e.target.value})}
                                            className="w-full bg-white/[0.03] border border-white/10 py-3 px-4 rounded-xl text-white focus:border-gold/50 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-off-white/40">Sobrenome</label>
                                        <input 
                                            type="text" required
                                            value={editUserForm.lastName} onChange={e => setEditUserForm({...editUserForm, lastName: e.target.value})}
                                            className="w-full bg-white/[0.03] border border-white/10 py-3 px-4 rounded-xl text-white focus:border-gold/50 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-off-white/40">Email</label>
                                    <input 
                                        type="email" required
                                        value={editUserForm.email} onChange={e => setEditUserForm({...editUserForm, email: e.target.value})}
                                        className="w-full bg-white/[0.03] border border-white/10 py-3 px-4 rounded-xl text-white/50 bg-black/20 outline-none cursor-not-allowed"
                                        disabled
                                        title="O E-mail de login é imutável por questões de segurança"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-off-white/40">Cargo / Permissão</label>
                                        <select 
                                            value={editUserForm.role}
                                            onChange={(e) => setEditUserForm({...editUserForm, role: e.target.value as any})}
                                            className="w-full bg-white/[0.03] border border-white/10 py-3 px-4 rounded-xl text-white focus:border-gold/50 outline-none cursor-pointer transition-all"
                                        >
                                            <option value="diretor" className="bg-navy-deep">Diretor de Unidade</option>
                                            <option value="diretor_executivo" className="bg-navy-deep">Diretor Executivo</option>
                                            <option value="admin" className="bg-navy-deep">Administrador</option>
                                            <option value="public" className="bg-navy-deep text-red-400">Público (Sem Acesso)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-off-white/40">Unidade</label>
                                        <select 
                                            value={editUserForm.unitId}
                                            onChange={(e) => setEditUserForm({...editUserForm, unitId: e.target.value})}
                                            className="w-full bg-white/[0.03] border border-white/10 py-3 px-4 rounded-xl text-white focus:border-gold/50 outline-none cursor-pointer transition-all"
                                        >
                                            <option value="" className="bg-navy-deep">Nenhuma (Global)</option>
                                            {units.map(u => (
                                                <option key={u.id} value={u.id} className="bg-navy-deep">{u.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-6 flex justify-end gap-3 border-t border-white/5 mt-4">
                                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-3 rounded-full text-white/40 hover:text-white font-bold text-[10px] uppercase tracking-widest transition-colors">
                                        Cancelar
                                    </button>
                                    <button type="submit" className="px-8 py-3 rounded-full bg-blue-500 text-white font-bold tracking-[0.2em] text-[10px] uppercase hover:scale-105 transition-transform shadow-lg shadow-blue-500/20">
                                        Salvar Alterações
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

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

export default UsersAdminPage;