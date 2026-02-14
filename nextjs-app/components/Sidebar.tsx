'use client';

import { LayoutDashboard, Wheat, Settings, LogOut, Factory, Package, ShoppingCart, CreditCard, TrendingUp, BookOpen, FileText, Shield } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

interface SidebarProps {
    permissions: import('@/types').Permissions | null;
}

export default function Sidebar({ permissions }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { id: 'procurement', label: 'Procurement', icon: Wheat, path: '/procurement' },
        { id: 'milling', label: 'Milling', icon: Factory, path: '/milling' },
        { id: 'inventory', label: 'Inventory', icon: Package, path: '/inventory' },
        { id: 'sales', label: 'Sales', icon: ShoppingCart, path: '/sales' },
        { id: 'expenses', label: 'Expenses', icon: CreditCard, path: '/expenses' },
        { id: 'reports', label: 'Reports', icon: FileText, path: '/reports' },
        { id: 'profit-loss', label: 'Profit & Loss', icon: TrendingUp, path: '/profit-loss' },
        { id: 'accounts', label: 'Accounts', icon: BookOpen, path: '/accounts' },
        { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
        { id: 'audit-logs', label: 'Audit Logs', icon: Shield, path: '/audit-logs' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('permissions');
        router.push('/login');
    };

    return (
        <div className="sidebar glass-panel" style={{
            width: '260px',
            height: 'calc(100vh - 40px)',
            margin: '20px',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px'
        }}>
            <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--accent-gold)', borderRadius: '8px' }}></div>
                <h2 style={{ fontSize: '1.2rem', color: 'var(--text-accent)' }}>Golden Rice</h2>
            </div>

            <nav style={{ flex: 1 }}>
                {menuItems.filter(item => {
                    let permKey = item.id;
                    if (item.id === 'profit-loss') permKey = 'reports';
                    if (item.id === 'audit-logs') permKey = 'audit_logs';

                    if (!permissions) return true;

                    const modulePerm = permissions[permKey];
                    return modulePerm?.read ?? true;
                }).map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.path;
                    return (
                        <button
                            key={item.id}
                            onClick={() => router.push(item.path)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                width: '100%',
                                padding: '12px 16px',
                                marginBottom: '8px',
                                background: isActive ? 'var(--accent-gold-dim)' : 'transparent',
                                border: isActive ? '1px solid var(--accent-gold)' : '1px solid transparent',
                                borderRadius: '8px',
                                color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <Icon size={20} style={{ marginRight: '12px' }} />
                            <span style={{ fontWeight: 500 }}>{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <button onClick={handleLogout} style={{
                display: 'flex',
                alignItems: 'center',
                color: 'var(--text-secondary)',
                background: 'transparent',
                border: 'none',
                padding: '12px',
                cursor: 'pointer'
            }}>
                <LogOut size={20} style={{ marginRight: '12px' }} />
                Logout
            </button>
        </div>
    );
}
