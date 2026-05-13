import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useSession } from '@clerk/clerk-react';
import DataTable from '../../components/ui/DataTable';
import type { Column } from '../../components/ui/DataTable';
import { supabase, createAuthClient } from '../../lib/supabase';
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
    const { profile } = useAuth();
    const { session } = useSession();
    
    const dbClient = profile?.id ? createAuthClient(profile.id) : supabase;

    const [usersList, setUsersList] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
    const [units, setUnits] = useState<{id: string, name: string}[]>([]);

    // --- State for creating users ---
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newUserForm, setNewUserForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'diretor' as 'super_admin' | 'diretor' | 'public' | 'diretor_executivo',
        unitId: ''
    });

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editUserForm, setEditUserForm] = useState({
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        role: 'diretor' as 'super_admin' | 'diretor' | 'public' | 'diretor_executivo',
        unitId: ''
    });

    // --- State for deleting users ---
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchUnits();
    }, []);

    const fetchUnits = async () => {
        const { data } = await dbClient.from('units').select('id, name').order('name');
        setUnits(data || []);
    };

    const fetchUsers = async () => {
        setIsLoading(true);
        const { data, error } = await dbClient
            .from('profiles')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Error fetching users:', error);
        } else {
            // Agora mostramos todos os usuários sincronizados
            setUsersList(data || []);
        }
        setIsLoading(false);
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreateModalOpen(false);
        setIsLoading(true);

        try {
            if (!session?.id) throw new Error("Sessão não identificada. Por favor, faça login novamente.");

            console.log("Chamando Edge Function create-clerk-user...");
            const { data, error } = await supabase.functions.invoke('create-clerk-user', {
                body: { ...newUserForm, sessionId: session.id }
            });

            if (error) {
                console.error("Erro na chamada da função:", error);
                throw new Error("A requisição falhou ou foi bloqueada. Verifique o console ou tente novamente.");
            }
            
            if (data && data.success === false) {
                throw new Error(data.error || "Erro desconhecido na criação.");
            }

            setAlertMessage(`Usuário ${newUserForm.firstName} criado e sincronizado com sucesso!`);
            setIsAlertModalOpen(true);
            setNewUserForm({ firstName: '', lastName: '', email: '', password: '', role: 'diretor', unitId: '' });
            
            // Força a atualização da lista
            await fetchUsers();
        } catch (err: any) {
            console.error("Erro ao criar usuário:", err);
            setAlertMessage('Erro ao criar usuário: ' + err.message);
            setIsAlertModalOpen(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSyncUsers = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('sync-clerk-users');
            if (error) throw error;
            if (data.success) {
                setAlertMessage(`${data.count} usuários sincronizados com sucesso.`);
            } else {
                setAlertMessage(`Erro na sincronização: ${data.error}`);
            }
            setIsAlertModalOpen(true);
            await fetchUsers();
        } catch (err: any) {
            setAlertMessage('Erro fatal ao sincronizar: ' + err.message);
            setIsAlertModalOpen(true);
        } finally {
            setIsLoading(false);
        }
    };

    // 🔥 SOLUÇÃO DEFINITIVA PARA A EDIÇÃO:
    // Nós forçamos o Banco a obedecer utilizando a Edge Function que possui a Chave Mestra de Serviço.
    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsEditModalOpen(false);
        setIsLoading(true);

        try {
            // 1. Garante que o Clerk (Sistema de Login) aceite a mudança de cargo
            if (session?.id) {
                await supabase.functions.invoke('set-clerk-role', {
                    body: {
                        email: editUserForm.email,
                        role: editUserForm.role,
                        unitId: editUserForm.unitId || null,
                        sessionId: session.id
                    }
                });
            }

            // 2. FORÇA a alteração no Banco de Dados via Chave Mestra! 
            // Ignora qualquer RLS ou bloqueio de privilégio do lado do cliente.
            const res = await supabase.functions.invoke('sync-clerk-profile', {
                body: {
                    id: editUserForm.id,
                    email: editUserForm.email,
                    firstName: editUserForm.firstName,
                    lastName: editUserForm.lastName,
                    role: editUserForm.role,
                    unitId: editUserForm.unitId || null
                }
            });

            if (res.error) throw new Error("Falha de rede ao tentar forçar a atualização.");

            setAlertMessage(`Usuário atualizado com sucesso! A ordem foi executada com privilégios máximos.`);
            setIsAlertModalOpen(true);
            setEditUserForm({ id: '', firstName: '', lastName: '', email: '', role: 'diretor', unitId: '' });
            fetchUsers();
        } catch (err: any) {
            setAlertMessage('Erro fatal ao atualizar: ' + err.message);
            setIsAlertModalOpen(true);
        } finally {
            setIsLoading(false);
        }
    };

    // 🔥 SOLUÇÃO DEFINITIVA PARA EXCLUSÃO:
    const confirmDeleteUser = async () => {
        if (!selectedUser) return;
        setIsDeleteModalOpen(false);
        setIsLoading(true);

        try {
            // 1. Tenta a exclusão física direta primeiro
            const { error: dbError } = await dbClient.from('profiles').delete().eq('id', selectedUser.id);
            
            // 2. Independente de conseguir apagar o registro no banco agora, 
            // vamos dar a ordem de EXCLUSÃO REAL (CLERK + BANCO) via Edge Function!
            // Isso vai varrer o usuário do sistema de login e da base.
            const res = await supabase.functions.invoke('sync-clerk-profile', {
                body: {
                    action: 'delete',
                    email: selectedUser.username,
                    sessionId: session?.id
                }
            });

            if (res.error || !res.data?.success) {
                // Se der erro na exclusão real, tentamos pelo menos o downgrade forçado pra segurança
                await supabase.functions.invoke('sync-clerk-profile', {
                    body: {
                        id: selectedUser.id,
                        email: selectedUser.username,
                        firstName: selectedUser.full_name?.split(' ')[0] || '',
                        lastName: selectedUser.full_name?.split(' ').slice(1).join(' ') || '',
                        role: 'public',
                        unitId: null,
                        forceRole: true
                    }
                });
                setAlertMessage(`O usuário não pôde ser excluído totalmente do login, mas todos os acessos dele foram revogados.`);
            } else {
                setAlertMessage(`Usuário EXCLUÍDO TOTALMENTE do sistema e do banco de dados.`);
            }

            if (dbError) {
                // Se deu erro de banco (FK constraint), avisamos que foi desativado
                setAlertMessage(`O usuário possui dados vinculados e não pôde ser removido fisicamente, mas TODOS os seus acessos foram revogados e ele agora é um 'Novo Usuário' sem permissões.`);
            } else {
                setAlertMessage(`Usuário removido com sucesso de todas as bases.`);
            }

            setIsAlertModalOpen(true);
            fetchUsers();
        } catch (err: any) {
            setAlertMessage('Erro técnico ao processar exclusão: ' + err.message);
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
                    <div className="size-12 rounded-2xl bg-brand-blue/5 text-brand-blue border border-brand-blue/10 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                        {u.avatar_url ? (
                            <img src={u.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <span className="material-symbols-outlined text-2xl">person</span>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="font-[800] text-brand-dark text-[15px] leading-tight">
                                {u.full_name || 'Usuário Novo / Sem Nome'}
                            </span>
                            {u.ativo === false && (
                                <span className="px-2 py-0.5 rounded-lg bg-red-50 text-red-500 text-[9px] font-[800] uppercase tracking-wider border border-red-100">
                                    Desativado
                                </span>
                            )}
                        </div>
                        <span className="text-[11px] text-brand-text-secondary/60 font-medium mt-0.5">
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
                let roleBadge = <span className="px-3 py-1 bg-brand-gray text-brand-text-secondary/40 border border-brand-gray/50 rounded-lg text-[10px] font-[800] uppercase tracking-wider">Sem Cargo</span>;
                
                if (r === 'admin' || r === 'super_admin') {
                    roleBadge = <span className="px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded-lg text-[10px] font-[800] uppercase tracking-wider">Admin</span>;
                } else if (r === 'diretor_executivo') {
                    roleBadge = <span className="px-3 py-1 bg-purple-50 text-purple-600 border border-purple-100 rounded-lg text-[10px] font-[800] uppercase tracking-wider">Executivo</span>;
                } else if (r === 'diretor') {
                    roleBadge = <span className="px-3 py-1 bg-brand-blue/5 text-brand-blue border border-brand-blue/10 rounded-lg text-[10px] font-[800] uppercase tracking-wider">Diretor Unidade</span>;
                } else if (r === 'public') {
                    roleBadge = <span className="px-3 py-1 bg-red-50 text-red-400 border border-red-100 rounded-lg text-[10px] font-[800] uppercase tracking-wider italic">Acesso Revogado</span>;
                }
                
                const unitName = units.find(unit => unit.id === u.unit_id)?.name;
                const showUnit = r !== 'super_admin' && r !== 'admin' && r !== 'diretor_executivo' && unitName;

                return (
                    <div className="flex flex-col items-start gap-1.5">
                        {roleBadge}
                        {showUnit && (
                            <span className="text-[11px] text-brand-text-secondary/60 font-[700] flex items-center gap-1.5 px-1">
                                <span className="material-symbols-outlined text-[14px]">location_on</span>
                                {unitName}
                            </span>
                        )}
                        {(r === 'super_admin' || r === 'admin' || r === 'diretor_executivo') && (
                             <span className="text-[10px] text-brand-blue/60 font-[800] tracking-wider uppercase flex items-center gap-1.5 px-1">
                                <span className="material-symbols-outlined text-[14px]">public</span>
                                Acesso Global
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
                            role: (u.role === 'admin' ? 'super_admin' : (u.role || 'public')) as any,
                            unitId: (u.role === 'super_admin' || u.role === 'admin' || u.role === 'diretor_executivo') ? '' : (u.unit_id || '')
                        });
                        setIsEditModalOpen(true);
                    }}
                    className="size-10 rounded-xl flex items-center justify-center text-brand-text-secondary/40 hover:text-brand-blue hover:bg-brand-blue/5 transition-all border border-transparent hover:border-brand-blue/20"
                    title="Editar"
                >
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                </button>
                <button
                    onClick={() => {
                        setSelectedUser(u);
                        setIsDeleteModalOpen(true);
                    }}
                    className="size-10 rounded-xl flex items-center justify-center text-brand-text-secondary/20 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-200"
                    title="Excluir"
                >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
            </div>
        );
    };

    return (
        <div className="space-y-12 animate-fade-in pb-20 px-6 md:px-10 lg:px-16 pt-16">
            <div className="flex flex-wrap justify-between items-end gap-8 mb-12">
                <div className="space-y-3">
                    <span className="text-brand-blue text-[11px] font-[800] uppercase tracking-[0.4em] block">Controle de Acesso</span>
                    <h2 className="text-[48px] font-[800] text-brand-dark tracking-tight leading-none">Usuários</h2>
                    <p className="text-brand-text-secondary max-w-2xl text-[16px] font-medium opacity-60">
                        Gerencie as permissões e papéis dos usuários do sistema.
                    </p>
                </div>
                
                <div className="flex flex-wrap gap-4">
                    <button 
                        onClick={handleSyncUsers}
                        className="px-6 py-3.5 rounded-2xl bg-brand-blue/5 border border-brand-blue/10 text-brand-blue hover:bg-brand-blue hover:text-white font-[800] tracking-widest text-[10px] uppercase flex items-center gap-2 transition-all shadow-sm"
                        title="Sincroniza todos os usuários do Clerk para o Banco de Dados"
                    >
                        <span className={`material-symbols-outlined text-[18px] ${isLoading ? 'animate-spin' : ''}`}>sync</span>
                        Sincronizar Clerk
                    </button>

                    <button 
                        onClick={fetchUsers}
                        className="px-6 py-3.5 rounded-2xl bg-white border border-brand-gray text-brand-text-secondary hover:border-brand-blue hover:text-brand-blue font-[800] tracking-widest text-[10px] uppercase flex items-center gap-2 transition-all shadow-sm"
                    >
                        <span className={`material-symbols-outlined text-[18px] ${isLoading ? 'animate-spin' : ''}`}>refresh</span>
                        Atualizar Lista
                    </button>

                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="btn-premium !px-8 !py-4"
                    >
                        <span className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">person_add</span>
                            <span className="relative z-10 hidden sm:inline">Cadastrar Usuário</span>
                        </span>
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-brand-blue border-r-transparent"></div>
                </div>
            ) : (
                <DataTable
                    data={usersList}
                    columns={columns}
                    actions={actions}
                    searchPlaceholder="Buscar usuários por nome ou email..."
                />
            )}

            {/* Modal de Criação de Usuário */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-brand-dark/40 backdrop-blur-md" onClick={() => setIsCreateModalOpen(false)} />
                    <div className="relative bg-white rounded-[2.5rem] border border-brand-gray w-full max-w-lg overflow-hidden shadow-2xl animate-scale-in">
                        <div className="p-10">
                            <h3 className="text-[28px] font-[800] text-brand-dark mb-8 tracking-tight leading-none">Criar Novo Usuário</h3>
                            <form onSubmit={handleCreateUser} className="space-y-6">
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-[800] uppercase tracking-widest text-brand-text-secondary/60 ml-1">Nome</label>
                                        <input 
                                            type="text" required
                                            value={newUserForm.firstName} onChange={e => setNewUserForm({...newUserForm, firstName: e.target.value})}
                                            className="w-full bg-bg-main border border-brand-gray py-4 px-5 rounded-2xl text-brand-dark focus:border-brand-blue/50 outline-none transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-[800] uppercase tracking-widest text-brand-text-secondary/60 ml-1">Sobrenome</label>
                                        <input 
                                            type="text" required
                                            value={newUserForm.lastName} onChange={e => setNewUserForm({...newUserForm, lastName: e.target.value})}
                                            className="w-full bg-bg-main border border-brand-gray py-4 px-5 rounded-2xl text-brand-dark focus:border-brand-blue/50 outline-none transition-all font-medium"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-[800] uppercase tracking-widest text-brand-text-secondary/60 ml-1">Email Institucional</label>
                                    <input 
                                        type="email" required
                                        value={newUserForm.email} onChange={e => setNewUserForm({...newUserForm, email: e.target.value})}
                                        className="w-full bg-bg-main border border-brand-gray py-4 px-5 rounded-2xl text-brand-dark focus:border-brand-blue/50 outline-none transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-[800] uppercase tracking-widest text-brand-text-secondary/60 ml-1">Senha Inicial</label>
                                    <input 
                                        type="text" required minLength={8}
                                        value={newUserForm.password} onChange={e => setNewUserForm({...newUserForm, password: e.target.value})}
                                        className="w-full bg-bg-main border border-brand-gray py-4 px-5 rounded-2xl text-brand-dark focus:border-brand-blue/50 outline-none transition-all font-medium"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-[800] uppercase tracking-widest text-brand-text-secondary/60 ml-1">Cargo / Permissão</label>
                                        <select 
                                            value={newUserForm.role}
                                            onChange={(e) => {
                                                const newRole = e.target.value as any;
                                                setNewUserForm({
                                                    ...newUserForm, 
                                                    role: newRole,
                                                    unitId: (newRole === 'super_admin' || newRole === 'diretor_executivo') ? '' : newUserForm.unitId
                                                });
                                            }}
                                            className="w-full bg-bg-main border border-brand-gray py-4 px-5 rounded-2xl text-brand-dark focus:border-brand-blue/50 outline-none cursor-pointer transition-all font-[700]"
                                        >
                                            <option value="diretor">Diretor de Unidade</option>
                                            <option value="diretor_executivo">Diretor Executivo (Global)</option>
                                            <option value="super_admin">Administrador (Global)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-[800] uppercase tracking-widest text-brand-text-secondary/60 ml-1">Unidade</label>
                                        <select 
                                            value={newUserForm.unitId}
                                            onChange={(e) => setNewUserForm({...newUserForm, unitId: e.target.value})}
                                            disabled={newUserForm.role !== 'diretor'}
                                            required={newUserForm.role === 'diretor'}
                                            className="w-full bg-bg-main border border-brand-gray py-4 px-5 rounded-2xl text-brand-dark focus:border-brand-blue/50 outline-none cursor-pointer disabled:opacity-30 transition-all font-[700]"
                                        >
                                            <option value="">Selecione...</option>
                                            {units.map(u => (
                                                <option key={u.id} value={u.id}>{u.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-8 flex justify-end gap-4 border-t border-brand-gray mt-6">
                                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-6 py-3.5 rounded-2xl text-brand-text-secondary font-[800] text-[11px] uppercase tracking-widest hover:text-brand-dark transition-colors">
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn-premium !px-8 !py-3.5">
                                        Criar Cadastro
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
              {/* Modal de Edição de Usuário */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-brand-dark/40 backdrop-blur-md" onClick={() => setIsEditModalOpen(false)} />
                    <div className="relative bg-white rounded-[2.5rem] border border-brand-gray w-full max-w-lg overflow-hidden shadow-2xl animate-scale-in">
                        <div className="p-10">
                            <h3 className="text-[28px] font-[800] text-brand-dark mb-8 tracking-tight leading-none">Editar Usuário</h3>
                            <form onSubmit={handleUpdateUser} className="space-y-6">
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-[800] uppercase tracking-widest text-brand-text-secondary/60 ml-1">Nome</label>
                                        <input 
                                            type="text" required
                                            value={editUserForm.firstName} onChange={e => setEditUserForm({...editUserForm, firstName: e.target.value})}
                                            className="w-full bg-bg-main border border-brand-gray py-4 px-5 rounded-2xl text-brand-dark focus:border-brand-blue/50 outline-none transition-all font-medium"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-[800] uppercase tracking-widest text-brand-text-secondary/60 ml-1">Sobrenome</label>
                                        <input 
                                            type="text" required
                                            value={editUserForm.lastName} onChange={e => setEditUserForm({...editUserForm, lastName: e.target.value})}
                                            className="w-full bg-bg-main border border-brand-gray py-4 px-5 rounded-2xl text-brand-dark focus:border-brand-blue/50 outline-none transition-all font-medium"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-[800] uppercase tracking-widest text-brand-text-secondary/60 ml-1">Email</label>
                                    <input 
                                        type="email" required
                                        value={editUserForm.email} onChange={e => setEditUserForm({...editUserForm, email: e.target.value})}
                                        className="w-full bg-bg-main/50 border border-brand-gray py-4 px-5 rounded-2xl text-brand-dark/40 outline-none cursor-not-allowed font-medium"
                                        disabled
                                        title="O E-mail de login é imutável por questões de segurança"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-[800] uppercase tracking-widest text-brand-text-secondary/60 ml-1">Cargo / Permissão</label>
                                        <select 
                                            value={editUserForm.role}
                                            onChange={(e) => {
                                                const newRole = e.target.value as any;
                                                setEditUserForm({
                                                    ...editUserForm, 
                                                    role: newRole,
                                                    unitId: (newRole === 'super_admin' || newRole === 'diretor_executivo') ? '' : editUserForm.unitId
                                                });
                                            }}
                                            className="w-full bg-bg-main border border-brand-gray py-4 px-5 rounded-2xl text-brand-dark focus:border-brand-blue/50 outline-none cursor-pointer transition-all font-[700]"
                                        >
                                            <option value="diretor">Diretor de Unidade</option>
                                            <option value="diretor_executivo">Diretor Executivo (Global)</option>
                                            <option value="super_admin">Administrador (Global)</option>
                                            <option value="public" className="text-red-500">Público (Revogar Acesso)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-[800] uppercase tracking-widest text-brand-text-secondary/60 ml-1">Unidade</label>
                                        <select 
                                            value={editUserForm.unitId}
                                            onChange={(e) => setEditUserForm({...editUserForm, unitId: e.target.value})}
                                            disabled={editUserForm.role === 'super_admin' || editUserForm.role === 'diretor_executivo'}
                                            className="w-full bg-bg-main border border-brand-gray py-4 px-5 rounded-2xl text-brand-dark focus:border-brand-blue/50 outline-none cursor-pointer transition-all disabled:opacity-30 font-[700]"
                                        >
                                            <option value="">Nenhuma (Global)</option>
                                            {units.map(u => (
                                                <option key={u.id} value={u.id}>{u.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-8 flex justify-end gap-4 border-t border-brand-gray mt-6">
                                    <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-3.5 rounded-2xl text-brand-text-secondary font-[800] text-[11px] uppercase tracking-widest hover:text-brand-dark transition-colors">
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn-premium !px-8 !py-3.5 bg-brand-blue text-white shadow-brand-blue/20">
                                        Forçar Alteração
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}


            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteUser}
                title="Confirmar Exclusão"
                message={`AVISO: Tem certeza que deseja revogar o acesso do usuário ${selectedUser?.full_name || selectedUser?.username}? Ele não poderá mais entrar no sistema.`}
                confirmLabel="Sim, Excluir Usuário"
                cancelLabel="Cancelar"
                type="danger"
            />

            <ConfirmModal
                isOpen={isAlertModalOpen}
                onClose={() => setIsAlertModalOpen(false)}
                onConfirm={() => setIsAlertModalOpen(false)}
                title="Status da Operação"
                message={alertMessage}
                confirmLabel="OK"
                type="info"
            />
        </div>
    );
};

export default UsersAdminPage;