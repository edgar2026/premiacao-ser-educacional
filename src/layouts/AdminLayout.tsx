import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';

const AdminLayout: React.FC = () => {
    return (
        <div className="bg-mesh-vibrant font-display text-blue-950 min-h-screen selection:bg-vibrant-cyan/30 flex">
            <Sidebar variant="admin" />
            <main className="flex-1 min-w-0 pb-12">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
