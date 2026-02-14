'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [permissions, setPermissions] = useState<import('@/types').Permissions | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token || token === 'undefined' || token === 'null') {
            router.push('/login');
            return;
        }

        const permsStr = localStorage.getItem('permissions');
        if (permsStr && permsStr !== 'undefined') {
            try {
                // eslint-disable-next-line
                setPermissions(JSON.parse(permsStr));
            } catch {
                console.error('Failed to parse permissions');
            }
        }

        setLoading(false);
    }, [router]);

    if (loading) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-primary)'
            }}>
                <h2>Loading...</h2>
            </div>
        );
    }

    return (
        <div className="app-layout">
            <Sidebar permissions={permissions} />
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
