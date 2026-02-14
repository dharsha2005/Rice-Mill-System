'use client';

import { useState } from 'react';
import UserManagement from '@/components/UserManagement';
import RoleManagement from '@/components/RoleManagement';
import VarietyManager from '@/components/VarietyManager';

// Mock hook or props for permissions.
// In a real app, you'd fetch this from a context or prop.
// For now, assuming admin access or similar until AuthContext is fully hooked up to this level.
const useUserPermissions = () => {
    // This should ideally come from your AuthContext
    // Returning true for all for now to ensure visibility during migration testing
    return {
        settings: { write: true }
    };
};

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('general');
    const userPermissions = useUserPermissions();
    const canManageUsers = userPermissions?.settings?.write || false;

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <header style={{ marginBottom: '32px' }}>
                <h1>Settings</h1>
                <p style={{ color: 'var(--text-secondary)' }}>System Configuration & Access Control</p>
            </header>

            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', marginBottom: '30px' }}>
                <button
                    onClick={() => setActiveTab('general')}
                    style={{ padding: '12px 24px', background: 'transparent', border: 'none', borderBottom: activeTab === 'general' ? '2px solid var(--accent-gold)' : '2px solid transparent', color: activeTab === 'general' ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: '500' }}
                >
                    General
                </button>
                {canManageUsers && (
                    <>
                        <button
                            onClick={() => setActiveTab('users')}
                            style={{ padding: '12px 24px', background: 'transparent', border: 'none', borderBottom: activeTab === 'users' ? '2px solid var(--accent-gold)' : '2px solid transparent', color: activeTab === 'users' ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: '500' }}
                        >
                            Users
                        </button>
                        <button
                            onClick={() => setActiveTab('roles')}
                            style={{ padding: '12px 24px', background: 'transparent', border: 'none', borderBottom: activeTab === 'roles' ? '2px solid var(--accent-gold)' : '2px solid transparent', color: activeTab === 'roles' ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: '500' }}
                        >
                            Roles
                        </button>
                        <button
                            onClick={() => setActiveTab('varieties')}
                            style={{ padding: '12px 24px', background: 'transparent', border: 'none', borderBottom: activeTab === 'varieties' ? '2px solid var(--accent-gold)' : '2px solid transparent', color: activeTab === 'varieties' ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: '500' }}
                        >
                            Rice Varieties
                        </button>
                    </>
                )}
            </div>

            {activeTab === 'general' && (
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <h3>System Information</h3>
                    <p style={{ marginTop: '10px' }}>Version: 1.0.0 (Internal Beta)</p>
                    <p>Rice Mill Management System</p>
                </div>
            )}

            {activeTab === 'users' && canManageUsers && <UserManagement />}

            {activeTab === 'roles' && canManageUsers && <RoleManagement />}

            {activeTab === 'varieties' && canManageUsers && <VarietyManager />}

        </div>
    );
}
