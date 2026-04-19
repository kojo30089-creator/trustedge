import Footer from '@/components/RootComponents/Footer';
import Navbar from '@/components/RootComponents/Navbar';
import React from 'react'

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Navbar />
            <main>
                {children}
            </main>
            <Footer /> 
        </>
    )
}
