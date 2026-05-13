const fs = require('fs');

const files = [
    'src/features/timeline/TimelinePage.tsx',
    'src/features/honoree/HonoreesGalleryPage.tsx',
    'src/features/honoree/HonoreePage.tsx',
    'src/features/partners/PartnersPage.tsx',
    'src/features/awards/AwardsGalleryPage.tsx',
    'src/features/about/AboutPage.tsx',
    'src/features/awards/AwardDetailsPage.tsx',
    'src/features/home/HomePage.tsx'
];

files.forEach(f => {
    try {
        let text = fs.readFileSync(f, 'utf8');
        text = text.replace(/bg-bg-main([^]*?)min-h-screen/g, 'bg-transparent$1min-h-screen');
        text = text.replace(/className="w-full min-h-screen bg-bg-main/g, 'className="w-full min-h-screen bg-transparent');
        text = text.replace(/className="w-full bg-bg-main/g, 'className="w-full bg-transparent');
        fs.writeFileSync(f, text);
    } catch(e) {
        console.error("Error modifying " + f, e);
    }
});

const layouts = [
    'src/layouts/MainLayout.tsx',
    'src/layouts/AdminLayout.tsx',
    'src/features/auth/LoginPage.tsx'
];

layouts.forEach(l => {
    try {
        let text = fs.readFileSync(l, 'utf8');
        text = text.replace(/opacity-40/g, 'opacity-100');
        fs.writeFileSync(l, text);
    } catch(e) {
        console.error("Error modifying " + l, e);
    }
});

console.log("Done");
