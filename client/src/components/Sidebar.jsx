import { LayoutDashboard, Wheat, Settings, LogOut, Factory, Package, ShoppingCart, CreditCard, TrendingUp, BookOpen, FileText, Shield } from 'lucide-react';
import '../styles/global.css';

const Sidebar = ({ activeTab, setActiveTab, onLogout, permissions }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'procurement', label: 'Procurement', icon: Wheat },
        { id: 'milling', label: 'Milling', icon: Factory },
        { id: 'inventory', label: 'Inventory', icon: Package },
        { id: 'sales', label: 'Sales', icon: ShoppingCart },
        { id: 'expenses', label: 'Expenses', icon: CreditCard },
        { id: 'reports', label: 'Reports', icon: FileText },
        { id: 'profit_loss', label: 'Profit & Loss', icon: TrendingUp },
        { id: 'accounts', label: 'Accounts', icon: BookOpen },
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'audit_logs', label: 'Audit Logs', icon: Shield },
    ];

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
                    // Normalize ID to permission key
                    let permKey = item.id;
                    if (item.id === 'profit_loss') permKey = 'reports'; // Group P&L with reports

                    // If no permissions loaded (e.g. admin backdoor), default allow or deny?
                    // Admin backdoor returns full permissions now.
                    // If permissions is null/undefined, allow nothing or check role?
                    if (!permissions) return true; // Fallback for safety/dev

                    const modulePerm = permissions[permKey];
                    // If permission entry exists, check read. If not exists, maybe default hidden?
                    // Let's assume if it exists in permissions object, we check read.
                    if (modulePerm) return modulePerm.read;

                    // Default behavior for items not in permission map?
                    return true;
                }).map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                width: '100%',
                                padding: '12px 16px',
                                marginBottom: '8px',
                                background: isActive ? 'var(--accent-green-dim)' : 'transparent',
                                border: isActive ? '1px solid var(--accent-green)' : '1px solid transparent',
                                borderRadius: '8px',
                                color: isActive ? 'var(--accent-green)' : 'var(--text-secondary)',
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

            <button onClick={onLogout} style={{
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
};

export default Sidebar;
