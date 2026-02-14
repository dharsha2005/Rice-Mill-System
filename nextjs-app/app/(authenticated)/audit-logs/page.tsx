'use client';

import { useState, useCallback, useEffect } from 'react';
import { Filter } from 'lucide-react';
import { getAuditLogs } from '@/lib/api';
import type { AuditLog } from '@/types';

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [filters, setFilters] = useState({
        module: '',
        action: '',
        user_name: '',
        startDate: '',
        endDate: ''
    });
    const [loading, setLoading] = useState(false);

    const loadLogs = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAuditLogs(filters);
            setLogs(data);
        } catch {
            console.error('Failed to load logs');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        loadLogs();
    }, [loadLogs]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleFilterChange = (e: any) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const applyFilters = () => {
        loadLogs();
    };

    return (
        <div>
            <header style={{ marginBottom: '32px' }}>
                <h1>Audit Logs</h1>
                <p style={{ color: 'var(--text-secondary)' }}>System Activity & Security Trail</p>
            </header>

            <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Module</label>
                        <select name="module" value={filters.module} onChange={handleFilterChange}>
                            <option value="">All Modules</option>
                            <option value="Procurement">Procurement</option>
                            <option value="Sales">Sales</option>
                            <option value="Milling">Milling</option>
                            <option value="Expenses">Expenses</option>
                            <option value="Users">Users</option>
                            <option value="Roles">Roles</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Action</label>
                        <select name="action" value={filters.action} onChange={handleFilterChange}>
                            <option value="">All Actions</option>
                            <option value="CREATE">Create</option>
                            <option value="UPDATE">Update</option>
                            <option value="DELETE">Delete</option>
                        </select>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>User</label>
                        <input name="user_name" value={filters.user_name} onChange={handleFilterChange} placeholder="Username" />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Start Date</label>
                        <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>End Date</label>
                        <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} />
                    </div>
                </div>
                <button onClick={applyFilters} className="btn-primary" disabled={loading}>
                    <Filter size={20} />
                    {loading ? 'Loading...' : 'Apply Filters'}
                </button>
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
                <table>
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>User</th>
                            <th>Module</th>
                            <th>Action</th>
                            <th>Description</th>
                            <th>IP Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log._id}>
                                <td style={{ fontSize: '0.85rem', fontFamily: 'monospace' }}>
                                    {new Date(log.timestamp as string | Date).toLocaleString()}
                                </td>
                                <td>{log.user_name}</td>
                                <td>
                                    <span style={{
                                        background: 'rgba(212, 175, 55, 0.1)',
                                        color: 'var(--accent-gold)',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem'
                                    }}>
                                        {log.module}
                                    </span>
                                </td>
                                <td>
                                    <span style={{
                                        background: log.action === 'CREATE' ? 'rgba(16, 185, 129, 0.1)' : log.action === 'DELETE' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                        color: log.action === 'CREATE' ? '#10b981' : log.action === 'DELETE' ? '#ef4444' : '#3b82f6',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem'
                                    }}>
                                        {log.action}
                                    </span>
                                </td>
                                <td style={{ fontSize: '0.9rem' }}>{log.description}</td>
                                <td style={{ fontSize: '0.85rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                                    {log.ip_address ?? '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
