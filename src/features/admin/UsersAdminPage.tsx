import React, { useEffect, useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';
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
    const { sessionId } = useClerkAuth();
    const [usersList, setUsersList] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
    const [actionType, setActionType] = useState<'diretor' | 'admin' | 'public'>('diretor');
    const [units, setUnits] = useState<{id: string, name: string}[]>([]);
    const [selectedUnitId, setSelectedUnitId] = useState<string>('');

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
            // Using our Edge Function to update Clerk user metadata and Supabase
            if (!sessionId) {
                throw new Error("Sessão não identificada. Por favor, faça login novamente.");
            }

            const res = await supabase.functions.invoke('set-clerk-role', {
                body: {
                    email: selectedUser.username,
                    role: actionType,
                    unitId: actionType === 'diretor' ? selectedUnitId : null,
                    sessionId: sessionId
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
