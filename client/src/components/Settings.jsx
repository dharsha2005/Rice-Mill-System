import React, { useState } from 'react';
import UserManagement from './UserManagement';
import RoleManagement from './RoleManagement';
import VarietyManager from './VarietyManager';
import '../styles/global.css';

const Settings = ({ userPermissions }) => {
    const [activeTab, setActiveTab] = useState('general');

    const canManageUsers = userPermissions?.settings?.write || false; // Or specific permission

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
};

export default Settings;
