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
    unit_id: string | null;
    regional_id: string | null;
    brand_id: string | null;
}

interface AuthContextType {
    user: any | null;
    profile: Profile | null;
    loading: boolean;
    isAuthorized: boolean;
    isAdmin: boolean;
    isDirector: boolean;
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
    const isSuperAdmin = profile?.role === 'super_admin' || profile?.role === 'admin';
    const isAdmin = isSuperAdmin;
    const isDirector = profile?.role === 'diretor';

    const fetchProfile = async (userId: string, email: string, clerkOrgId?: string) => {
        try {
            if (REQUIRED_ORG_ID && clerkOrgId !== REQUIRED_ORG_ID) {
                console.warn(`[Auth] Usuário não pertence à organização obrigatória.`);
                setIsAuthorized(false);
                setProfile(null);
                return;
            }

            setIsAuthorized(true);

            // CHAMA A EDGE FUNCTION PARA SINCRONIZAR 100% O CLERK COM O SUPABASE
            const { data: syncData, error: syncError } = await supabase.functions.invoke('sync-clerk-profile', {
                body: {
                    id: userId,
                    email: email,
                    firstName: user?.firstName,
                    lastName: user?.lastName,
                    role: user?.publicMetadata?.role || 'public',
                    unitId: user?.publicMetadata?.unit_id || null,
                }
            });

            if (!syncError && syncData?.profile) {
                setProfile(syncData.profile);
            } else {
                console.error("Failed to sync profile:", syncError || syncData?.error);
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
        <AuthContext.Provider value={{ user, profile, loading, isAuthorized, isAdmin, isDirector, signOut, refreshProfile }}>
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