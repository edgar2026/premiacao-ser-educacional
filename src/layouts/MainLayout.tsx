import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

const MainLayout: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen mesh-gradient-blue text-white selection:bg-white/30">
            <Header variant="public" />
            <main className="flex-1 flex flex-col items-center">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
