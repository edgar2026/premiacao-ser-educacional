import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useAuth as useClerkAuth, useOrganization } from '@clerk/clerk-react';
import { supabase } from '../../lib/supabase';

const REQUIRED_ORG_ID = import.meta.env.VITE_CLERK_ORGANIZATION_ID;

interface Profile {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    role: string | null;
    primeiro_acesso: boolean;
    username: string | null;
    organization_id: string | null;
}

interface AuthContextType {
    user: any | null;
    profile: Profile | null;
    loading: boolean;
    isAuthorized: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, isLoaded: isUserLoaded } = useUser();
    const { organization, isLoaded: isOrgLoaded } = useOrganization();
    const { signOut: clerkSignOut } = useClerkAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    const fetchProfile = async (userId: string, email: string, clerkOrgId?: string) => {
        try {
            // 1. Verifica restrição de organização se configurada
            if (REQUIRED_ORG_ID && clerkOrgId !== REQUIRED_ORG_ID) {
                console.warn(`[Auth] Usuário não pertence à organização obrigatória: ${REQUIRED_ORG_ID}`);
                setIsAuthorized(false);
                setProfile(null);
                return;
            }

            setIsAuthorized(true);

            // 2. Busca ou sincroniza perfil no Supabase
            // Verifica se o userId é um UUID válido para evitar erro de sintaxe no Postgres
            const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

            let query = supabase.from('profiles').select('*');

            if (isUuid) {
                query = query.or(`id.eq.${userId},username.eq.${email}`);
            } else {
                query = query.eq('username', email);
            }

            const { data, error } = await query.maybeSingle();

            if (error) throw error;

            if (data) {
                // Sincroniza organization_id se necessário
                if (clerkOrgId && data.organization_id !== clerkOrgId) {
                    await supabase
                        .from('profiles')
                        .update({ organization_id: clerkOrgId })
                        .eq('id', data.id);
                }
                setProfile({ ...data, organization_id: clerkOrgId || data.organization_id });
            } else {
                setProfile(null);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setProfile(null);
        }
    };

    const refreshProfile = async () => {
        if (user) {
            await fetchProfile(user.id, user.primaryEmailAddress?.emailAddress || '', organization?.id);
        }
    };

    useEffect(() => {
        if (isUserLoaded && isOrgLoaded) {
            if (user) {
                fetchProfile(user.id, user.primaryEmailAddress?.emailAddress || '', organization?.id)
                    .finally(() => setLoading(false));
            } else {
                setProfile(null);
                setIsAuthorized(false);
                setLoading(false);
            }
        }
    }, [user, isUserLoaded, organization, isOrgLoaded]);

    const signOut = async () => {
        await clerkSignOut();
        setProfile(null);
        setIsAuthorized(false);
    };

    return (
        <AuthContext.Provider value={{ user, profile, loading, isAuthorized, signOut, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
