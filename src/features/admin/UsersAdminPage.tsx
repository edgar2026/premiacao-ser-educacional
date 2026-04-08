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
}

const UsersAdminPage: React.FC = () => {
    const { profile } = useAuth();
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

    // --- State for creating users ---
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newUserForm, setNewUserForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'diretor' as 'admin' | 'diretor' | 'public',
        unitId: ''
    });

    // --- State for deleting users ---
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchUnits();
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
            console.log('Fetched users:', data);
            setUsersList(data || []);
        }
        setIsLoading(false);
    };

    const handleRoleChangeClick = (u: Profile, newRole: 'diretor' | 'admin' | 'public') => {
        setSelectedUser(u);
        setActionType(newRole);
        setSelectedUnitId(''); // Reset selection
        setIsConfirmModalOpen(true);
    };

    const confirmRoleChange = async () => {
        if (!selectedUser) return;
        setIsConfirmModalOpen(false);
        setIsLoading(true);

        try {
            if (!session?.id) {
                throw new Error("Sessão não identificada. Por favor, faça login novamente.");
            }

            const res = await supabase.functions.invoke('set-clerk-role', {
                body: {
                    email: selectedUser.username,
                    role: actionType,
                    unitId: actionType === 'diretor' ? selectedUnitId : null,
                    sessionId: session.id
                }
            });

            if (res.error) {
                console.error("Clerk role set failed:", res.error);
                throw new Error("Ocorreu um erro ao atualizar a permissão no serviço de autenticação.");
            }

            setAlertMessage(`Usuário ${selectedUser.full_name || selectedUser.username} agora é ${actionType}!`);
            setIsAlertModalOpen(true);
            fetchUsers();
        } catch (err: any) {
            setAlertMessage('Erro ao alterar cargo: ' + err.message);
            setIsAlertModalOpen(true);
        } finally {
            setIsLoading(false);
            setSelectedUser(null);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreateModalOpen(false);
        setIsLoading(true);

        try {
            if (!session?.id) {
                throw new Error("Sessão não identificada. Por favor, faça login novamente.");
            }

            const res = await supabase.functions.invoke('create-clerk-user', {
                body: {
                    ...newUserForm,
                    sessionId: session.id
                }
            });

            if (res.error) {
                throw new Error("Erro da API: " + res.error.message);
            }
            if (res.data && res.data.success === false) {
                throw new Error(res.data.error || "Erro desconhecido na Edge Function");
            }

            setAlertMessage(`Usuário ${newUserForm.firstName} criado com sucesso!`);
            setIsAlertModalOpen(true);
            setNewUserForm({ firstName: '', lastName: '', email: '', password: '', role: 'diretor', unitId: '' });
            fetchUsers();
        } catch (err: any) {
            setAlertMessage('Erro ao criar usuário: ' + err.message + '\n\nCertifique-se de que a Edge Function "create-clerk-user" foi feito deploy no Supabase.');
            setIsAlertModalOpen(true);
        } finally {
            setIsLoading(false);
        }
    };

    const confirmDeleteUser = async () => {
        if (!selectedUser) return;
        setIsDeleteModalOpen(false);
        setIsLoading(true);

        try {
            if (!session?.id) {
                throw new Error("Sessão não identificada. Por favor, faça login novamente.");
            }

            const res = await supabase.functions.invoke('delete-clerk-user', {
                body: {
                    email: selectedUser.username,
                    targetUserId: selectedUser.id,
                    sessionId: session.id
                }
            });

            if (res.error) {
                throw new Error("Erro da API: " + res.error.message);
            }

            setAlertMessage(`Usuário removido com sucesso.`);
            setIsAlertModalOpen(true);
            fetchUsers();
        } catch (err: any) {
            setAlertMessage('Erro ao excluir usuário: ' + err.message + '\n\nCertifique-se de que a Edge Function "delete-clerk-user" foi feito deploy no Supabase.');
            setIsAlertModalOpen(true);
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
                            {u.full_name || 'Usuário Sem Nome'}
                        </span>
                        <span className="text-[11px] text-off-white/40">
                            {u.username}
                        </span>
                    </div>
                </div>
            )
        },
        {
            header: 'Papel (Role)',
            accessor: (u: Profile) => {
                const r = u.role;
                if (r === 'admin' || r === 'super_admin') {
                    return <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">Admin</span>;
                }
                if (r === 'diretor') {
                    return <span className="px-3 py-1 bg-gold/10 text-gold border border-gold/20 rounded-full text-[10px] font-bold uppercase tracking-wider">Diretor</span>;
                }
                return <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-[10px] font-bold uppercase tracking-wider">Público</span>;
            }
        }
    ];

    const actions = (u: Profile) => {
        // Prevent editing own role here or super admins
        if (u.id === profile?.id || u.role === 'super_admin') return null;

        return (
            <div className="flex gap-2">
                {u.role !== 'diretor' && (
                    <button
                        onClick={() => handleRoleChangeClick(u, 'diretor')}
                        className="px-3 py-1.5 rounded-lg bg-gold/10 text-gold hover:bg-gold hover:text-navy-deep font-bold transition-colors text-xs"
                    >
                        Tornar Diretor
                    </button>
                )}
                {u.role !== 'admin' && (
                    <button
                        onClick={() => handleRoleChangeClick(u, 'admin')}
                        className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white font-bold transition-colors text-xs"
                    >
                        Tornar Admin
                    </button>
                )}
                {u.role !== 'public' && u.role !== 'admin' && (
                    <button
                        onClick={() => handleRoleChangeClick(u, 'public')}
                        className="px-3 py-1.5 rounded-lg bg-off-white/5 text-off-white/40 hover:bg-off-white/20 hover:text-white font-bold transition-colors text-xs"
                    >
                        Remover Cargo
                    </button>
                )}
                <button
                    onClick={() => {
                        setSelectedUser(u);
                        setIsDeleteModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-red-900/40 text-red-400 border border-red-900/50 hover:bg-red-500 hover:text-white hover:border-red-400 font-bold transition-colors text-xs ml-2"
                >
                    Excluir
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
                
                <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="group relative px-6 py-3 rounded-full bg-gold text-navy-deep font-bold tracking-widest text-[10px] uppercase overflow-hidden flex items-center gap-2 hover:scale-105 active:scale-95 transition-all duration-300"
                >
                    <span className="material-symbols-outlined text-lg">person_add</span>
                    <span className="relative z-10 hidden sm:inline">Cadastrar Usuário</span>
                </button>
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

            {/* Modal de Criação de Usuário */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-navy-deep/90 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)} />
                    <div className="relative bg-navy rounded-3xl border border-white/10 w-full max-w-lg overflow-hidden shadow-2xl animate-scale-in">
                        <div className="p-8">
                            <h3 className="text-2xl font-serif text-gold mb-6">Criar Novo Usuário</h3>
                            <form onSubmit={handleCreateUser} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-off-white/40">Nome</label>
                                        <input 
                                            type="text" required
                                            value={newUserForm.firstName} onChange={e => setNewUserForm({...newUserForm, firstName: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 py-3 px-4 rounded-xl text-white focus:border-gold outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-off-white/40">Sobrenome</label>
                                        <input 
                                            type="text" required
                                            value={newUserForm.lastName} onChange={e => setNewUserForm({...newUserForm, lastName: e.target.value})}
                                            className="w-full bg-white/5 border border-white/10 py-3 px-4 rounded-xl text-white focus:border-gold outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-off-white/40">Email</label>
                                    <input 
                                        type="email" required
                                        value={newUserForm.email} onChange={e => setNewUserForm({...newUserForm, email: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 py-3 px-4 rounded-xl text-white focus:border-gold outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-off-white/40">Senha (Acesso Inicial)</label>
                                    <input 
                                        type="text" required minLength={8}
                                        value={newUserForm.password} onChange={e => setNewUserForm({...newUserForm, password: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 py-3 px-4 rounded-xl text-white focus:border-gold outline-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-off-white/40">Cargo</label>
                                        <select 
                                            value={newUserForm.role}
                                            onChange={(e) => setNewUserForm({...newUserForm, role: e.target.value as any})}
                                            className="w-full bg-white/5 border border-white/10 py-3 px-4 rounded-xl text-white focus:border-gold outline-none cursor-pointer"
                                        >
                                            <option value="diretor" className="bg-navy-deep">Diretor</option>
                                            <option value="admin" className="bg-navy-deep">Administrador</option>
                                            <option value="public" className="bg-navy-deep">Público (S/ Permissão)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-off-white/40">Unidade (Se Diretor)</label>
                                        <select 
                                            value={newUserForm.unitId}
                                            onChange={(e) => setNewUserForm({...newUserForm, unitId: e.target.value})}
                                            disabled={newUserForm.role !== 'diretor'}
                                            required={newUserForm.role === 'diretor'}
                                            className="w-full bg-white/5 border border-white/10 py-3 px-4 rounded-xl text-white focus:border-gold outline-none cursor-pointer disabled:opacity-50"
                                        >
                                            <option value="" className="bg-navy-deep">Selecione...</option>
                                            {units.map(u => (
                                                <option key={u.id} value={u.id} className="bg-navy-deep">{u.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-6 flex justify-end gap-3">
                                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-5 py-3 rounded-full text-white/50 hover:text-white font-bold text-xs uppercase cursor-pointer">
                                        Cancelar
                                    </button>
                                    <button type="submit" className="px-5 py-3 rounded-full bg-gold text-navy-deep font-bold tracking-widest text-[10px] uppercase hover:scale-105 transition-transform cursor-pointer">
                                        Criar Cadastro
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
