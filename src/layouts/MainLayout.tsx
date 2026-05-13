import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

const MainLayout: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen text-brand-dark selection:bg-brand-blue/10 selection:text-brand-blue relative overflow-hidden bg-bg-main">
            {/* Background Image */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <img src="/assets/tech_award_bg.png" alt="Background" className="w-full h-full object-cover opacity-100" />
            </div>

            <Header variant="public" className="z-10 relative" />
            <main className="flex-1 flex flex-col items-center w-full z-10 relative">
                <Outlet />
            </main>
            <Footer className="z-10 relative" />
        </div>
    );
};

export default MainLayout;
