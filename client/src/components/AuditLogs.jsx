import React, { useState, useEffect } from 'react';
import { Shield, Filter, Search, RotateCcw, Download } from 'lucide-react';
// import { fetchAuditLogs, fetchUsers } from '../services/api'; // Users not exported, generic fetch used below

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);

    // Filters
    const [filters, setFilters] = useState({
        module: '',
        action: '',
        user: '',
        start_date: '',
        end_date: ''
    });

    useEffect(() => {
        loadData();
        loadUsers();
    }, []);

    // Debounce filter effect or just a manual "Apply" button? 
    // Let's use an effect with a slight delay or just direct apply for now as internal tool.
    useEffect(() => {
        const timer = setTimeout(() => {
            loadData();
        }, 500);
        return () => clearTimeout(timer);
    }, [filters]);

    const loadData = async () => {
        setLoading(true);
        try {
            // Convert filters to query string
            const params = new URLSearchParams();
            if (filters.module) params.append('module', filters.module);
            if (filters.action) params.append('action', filters.action);
            if (filters.user) params.append('user', filters.user);
            if (filters.start_date) params.append('start_date', filters.start_date);
            if (filters.end_date) params.append('end_date', filters.end_date);

            const response = await fetch('/api/audit/logs?' + params.toString(), {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            setLogs(data);
        } catch (err) {
            console.error('Failed to load logs', err);
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            // We might need a specific endpoint for user list or just use existing
            const response = await fetch('/api/users', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const data = await response.json();
            setUsers(data);
        } catch (e) { console.error(e); }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const clearFilters = () => {
        setFilters({ module: '', action: '', user: '', start_date: '', end_date: '' });
    };

    const getActionColor = (action) => {
        switch (action) {
            case 'CREATE': return 'text-green-400';
            case 'UPDATE': return 'text-amber-400';
            case 'DELETE': return 'text-red-500 font-bold';
            case 'LOGIN': return 'text-blue-400';
            default: return 'text-gray-400';
        }
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
            <header style={{ marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '12px' }}>
                        <Shield size={32} className="text-blue-400" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: 700 }}>System Audit Logs</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Track and monitor all system activities and security events</p>
                    </div>
                </div>
            </header>

            {/* Filters Bar */}
            <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'end' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Module</label>
                    <select
                        name="module"
                        value={filters.module}
                        onChange={handleFilterChange}
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)', color: 'white', minWidth: '150px' }}
                    >
                        <option value="">All Modules</option>
                        <option value="Procurement">Procurement</option>
                        <option value="Milling">Milling</option>
                        <option value="Sales">Sales</option>
                        <option value="Inventory">Inventory</option>
                        <option value="Expenses">Expenses</option>
                        <option value="User Management">User Management</option>
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Action</label>
                    <select
                        name="action"
                        value={filters.action}
                        onChange={handleFilterChange}
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)', color: 'white', minWidth: '150px' }}
                    >
                        <option value="">All Actions</option>
                        <option value="CREATE">Create</option>
                        <option value="UPDATE">Update</option>
                        <option value="DELETE">Delete</option>
                        <option value="LOGIN">Login</option>
                    </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>User</label>
                    <input
                        name="user"
                        value={filters.user}
                        onChange={handleFilterChange}
                        placeholder="Search username..."
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Date Range</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="date" name="start_date" value={filters.start_date} onChange={handleFilterChange} style={{ padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--border-subtle)' }} />
                        <span style={{ alignSelf: 'center' }}>to</span>
                        <input type="date" name="end_date" value={filters.end_date} onChange={handleFilterChange} style={{ padding: '10px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', color: 'white', border: '1px solid var(--border-subtle)' }} />
                    </div>
                </div>

                <button
                    onClick={clearFilters}
                    style={{
                        padding: '10px 20px',
                        background: 'transparent',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-secondary)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginLeft: 'auto'
                    }}
                >
                    <RotateCcw size={16} /> Reset
                </button>
            </div>

            {/* Logs Table */}
            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading audit trail...</div>
                ) : logs.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No logs found for the selected criteria.</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Timestamp</th>
                                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>User</th>
                                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Module</th>
                                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Action</th>
                                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Description</th>
                                <th style={{ padding: '16px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'background 0.2s' }} className="hover:bg-white/5">
                                    <td style={{ padding: '16px', fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'black', fontWeight: 'bold' }}>
                                                {log.user_name?.charAt(0).toUpperCase()}
                                            </div>
                                            {log.user_name}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{ padding: '4px 10px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>
                                            {log.module}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', fontWeight: 600 }} className={getActionColor(log.action)}>
                                        {log.action}
                                    </td>
                                    <td style={{ padding: '16px' }}>{log.description}</td>
                                    <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '300px' }}>
                                        {log.details ? (
                                            <details>
                                                <summary style={{ cursor: 'pointer', outline: 'none' }}>View JSON</summary>
                                                <pre style={{ marginTop: '5px', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', overflowX: 'auto' }}>
                                                    {JSON.stringify(log.details, null, 2)}
                                                </pre>
                                            </details>
                                        ) : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Showing last {logs.length} records.
            </div>
        </div>
    );
};

export default AuditLogs;
