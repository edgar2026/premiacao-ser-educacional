import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface RoleGuardProps {
    allowedRoles: string[];
}

const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles }) => {
    const { profile, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-navy-deep">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
            </div>
        );
    }

    // Se não houver perfil ou o papel não estiver na lista permitida, redireciona
    if (!profile || !profile.role || !allowedRoles.includes(profile.role)) {
        return <Navigate to="/admin" replace />;
    }

    return <Outlet />;
};

export default RoleGuard;
