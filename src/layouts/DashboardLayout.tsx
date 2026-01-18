import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Header from '../components/common/Header';

const DashboardLayout: React.FC = () => {
    return (
        <div className="flex min-h-screen overflow-hidden mesh-gradient-navy text-blue-50 antialiased font-display">
            <Sidebar variant="dashboard" />
            <main className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar">
                <Header variant="dashboard" />
                <div className="p-10 flex flex-col gap-10">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
