import React, { useState, useEffect } from 'react';
import '../styles/global.css';
import { UserPlus, Power, AlertCircle } from 'lucide-react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [isAddMode, setIsAddMode] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '', role: 'Staff' });
    const [roles, setRoles] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/users');
            if (res.ok) {
                setUsers(await res.json());
            }
        } catch (err) {
            console.error('Failed to fetch users', err);
        }
    };

    const fetchRoles = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/roles');
            if (res.ok) {
                const data = await res.json();
                setRoles(data.map(r => r.role));
            }
        } catch (err) {
            console.error('Failed to fetch roles', err);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch('http://localhost:3000/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                setFormData({ username: '', password: '', role: 'Staff' });
                setIsAddMode(false);
                fetchUsers();
            } else {
                setError(data.error || 'Failed to create user');
            }
        } catch (err) {
            setError('Request failed');
        }
    };

    const toggleStatus = async (user) => {
        const newStatus = user.status === 'Active' ? 'Disabled' : 'Active';
        try {
            const res = await fetch(`http://localhost:3000/api/users/${user._id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                fetchUsers();
            }
        } catch (err) {
            console.error('Failed to toggle status', err);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.2rem' }}>System Users</h3>
                <button onClick={() => setIsAddMode(!isAddMode)} className="btn-primary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <UserPlus size={18} />
                    Add User
                </button>
            </div>

            {isAddMode && (
                <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
                    <h4 style={{ marginBottom: '15px' }}>New User</h4>
                    <form onSubmit={handleCreateUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '15px', alignItems: 'end' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: 'var(--text-secondary)' }}>Username</label>
                            <input type="text" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} required />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: 'var(--text-secondary)' }}>Password</label>
                            <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '4px', color: 'var(--text-secondary)' }}>Role</label>
                            <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                {roles.length > 0 ? roles.map(r => <option key={r} value={r}>{r}</option>) : <option value="Staff">Staff</option>}
                                {/* Fallback if roles empty */}
                                <option value="Proprietor">Proprietor</option>
                                <option value="Accountant">Accountant</option>
                            </select>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="submit" className="btn-primary" style={{ padding: '8px 16px', background: 'var(--accent-green)' }}>Save</button>
                            <button type="button" onClick={() => setIsAddMode(false)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                        </div>
                    </form>
                    {error && <p style={{ color: '#ef4444', marginTop: '10px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}><AlertCircle size={14} /> {error}</p>}
                </div>
            )}

            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ background: 'rgba(0,0,0,0.2)' }}>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Username</th>
                            <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Role</th>
                            <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Status</th>
                            <th style={{ textAlign: 'right', padding: '12px 20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                <td style={{ padding: '12px 20px', fontWeight: '500' }}>{user.username}</td>
                                <td style={{ padding: '12px 20px' }}>
                                    <span style={{ padding: '4px 8px', borderRadius: '4px', background: 'var(--bg-secondary)', fontSize: '0.85rem' }}>{user.role}</span>
                                </td>
                                <td style={{ padding: '12px 20px' }}>
                                    <span style={{
                                        color: user.status === 'Active' ? '#10b981' : '#ef4444',
                                        display: 'flex', alignItems: 'center', gap: '6px'
                                    }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: user.status === 'Active' ? '#10b981' : '#ef4444' }}></div>
                                        {user.status}
                                    </span>
                                </td>
                                <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                                    <button
                                        onClick={() => toggleStatus(user)}
                                        title={user.status === 'Active' ? 'Disable Account' : 'Enable Account'}
                                        style={{
                                            background: 'transparent', border: 'none', cursor: 'pointer',
                                            color: user.status === 'Active' ? '#ef4444' : '#10b981',
                                            opacity: 0.8
                                        }}
                                    >
                                        <Power size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;
