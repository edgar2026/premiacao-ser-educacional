import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';

const AdminLayout: React.FC = () => {
    return (
        <div className="bg-bg-main font-sans text-brand-dark min-h-screen flex relative overflow-hidden">
            {/* Background from public pages */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <img src="/assets/tech_award_bg.png" alt="Background" className="w-full h-full object-cover opacity-100" />
            </div>

            <Sidebar variant="admin" className="z-10 relative" />
            <main className="flex-1 min-w-0 pb-12 overflow-y-auto h-screen custom-scrollbar z-10 relative">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
