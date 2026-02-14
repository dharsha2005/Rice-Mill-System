'use client';

import { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';

interface Role {
    _id: string;
    role: string;
    permissions: import('@/types').Permissions;
    isDirty?: boolean;
}

export default function RoleManagement() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/roles');
            if (res.ok) {
                setRoles(await res.json());
            }
        } catch (err) {
            console.error('Failed to fetch roles', err);
        } finally {
            setLoading(false);
        }
    };

    const modules = ['dashboard', 'procurement', 'milling', 'inventory', 'sales', 'expenses', 'reports', 'accounts', 'settings'];

    const handlePermissionChange = (roleName: string, module: string, type: 'read' | 'write') => {
        setRoles(prevRoles => prevRoles.map(r => {
            if (r.role === roleName) {
                const newPermissions = { ...r.permissions };
                if (!newPermissions[module]) newPermissions[module] = { read: false, write: false };
                newPermissions[module] = {
                    ...newPermissions[module],
                    [type]: !newPermissions[module][type]
                };
                return { ...r, permissions: newPermissions, isDirty: true };
            }
            return r;
        }));
    };

    const saveRole = async (role: Role) => {
        try {
            const res = await fetch('/api/roles/permissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: role.role, permissions: role.permissions })
            });

            if (res.ok) {
                // Update local state to remove dirty flag
                setRoles(prev => prev.map(r => r.role === role.role ? { ...r, isDirty: false } : r));
            }
        } catch (err) {
            console.error('Failed to save role', err);
        }
    };

    const handleSeed = async () => {
        await fetch('/api/roles/seed', { method: 'POST' });
        fetchRoles();
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.2rem' }}>Role Permissions</h3>
                <button onClick={handleSeed} style={{ background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                    <RefreshCw size={14} /> Reset Defaults
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {roles.map(role => (
                    <div key={role._id} className="glass-panel" style={{ padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
                            <h4 style={{ color: 'var(--accent-gold)' }}>{role.role}</h4>
                            {role.isDirty && (
                                <button onClick={() => saveRole(role)} style={{ background: 'var(--accent-green)', color: '#000', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: '600' }}>
                                    <Save size={14} /> Save
                                </button>
                            )}
                        </div>

                        <div style={{ display: 'flex', marginBottom: '10px', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                            <span style={{ flex: 1 }}>Module</span>
                            <span style={{ width: '40px', textAlign: 'center' }}>Read</span>
                            <span style={{ width: '40px', textAlign: 'center' }}>Write</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {modules.map(mod => {
                                const perm = role.permissions[mod] || { read: false, write: false };
                                return (
                                    <div key={mod} style={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem' }}>
                                        <span style={{ flex: 1, textTransform: 'capitalize' }}>{mod.replace('_', '& ')}</span>
                                        <div style={{ width: '40px', textAlign: 'center' }}>
                                            <input
                                                type="checkbox"
                                                checked={perm.read}
                                                onChange={() => handlePermissionChange(role.role, mod, 'read')}
                                            />
                                        </div>
                                        <div style={{ width: '40px', textAlign: 'center' }}>
                                            <input
                                                type="checkbox"
                                                checked={perm.write}
                                                onChange={() => handlePermissionChange(role.role, mod, 'write')}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {roles.length === 0 && !loading && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    <p>No roles found. Click &quot;Reset Defaults&quot; to initialize.</p>
                </div>
            )}
        </div>
    );
}
