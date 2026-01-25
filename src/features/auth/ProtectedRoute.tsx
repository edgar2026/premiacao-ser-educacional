import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute: React.FC = () => {
    const { user, loading, isAuthorized } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#001529] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (!isAuthorized) {
        return (
            <div className="min-h-screen mesh-gradient-premium flex items-center justify-center p-6">
                <div className="text-center space-y-6 max-w-md">
                    <span className="material-symbols-outlined text-red-500 text-6xl">domain_disabled</span>
                    <h1 className="text-2xl font-bold text-off-white">Acesso Restrito</h1>
                    <p className="text-off-white/60">Seu usuário não pertence à organização autorizada para acessar este portal.</p>
                    <button
                        onClick={() => window.location.href = '/login'}
                        className="text-gold font-bold uppercase tracking-widest text-xs underline"
                    >
                        Voltar para o Login
                    </button>
                </div>
            </div>
        );
    }

    return <Outlet />;
};

export default ProtectedRoute;
