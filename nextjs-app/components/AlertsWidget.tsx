'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Bell } from 'lucide-react';
import { getAlerts, getInventory, resolveAlert as resolveAlertAPI } from '@/lib/api';

// Live low-stock item (computed from inventory, not stale DB alerts)
interface LowStockItem {
    id: string;
    message: string;
    priority: 'High';
}

export default function AlertsWidget() {
    const [alerts, setAlerts] = useState<import('@/types').Alert[]>([]);
    const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [alertsData, inventoryData] = await Promise.all([
                    getAlerts(),
                    getInventory()
                ]);

                // Exclude stale "Low Stock" alerts - we use live inventory instead
                const nonLowStockAlerts = (alertsData || []).filter(
                    (a: { type?: string }) => a.type?.toLowerCase() !== 'stock'
                );
                setAlerts(nonLowStockAlerts);

                // Compute current low-stock items from live inventory
                const lowStock = (inventoryData || []).filter(
                    (item: { quantity: number; minimum_threshold: number }) =>
                        item.quantity < item.minimum_threshold
                ).map((item: { _id: string; rice_variety: string; grade: string; quantity: number; minimum_threshold: number }) => ({
                    id: item._id,
                    message: `Low Stock: ${item.rice_variety} (${item.grade}) is at ${item.quantity} bags (Threshold: ${item.minimum_threshold})`,
                    priority: 'High' as const
                }));
                setLowStockItems(lowStock);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleResolveAlert = async (id: string) => {
        try {
            await resolveAlertAPI(id);
            setAlerts(alerts.filter(a => a._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    const displayItems = [
        ...lowStockItems.map(l => ({ _id: l.id, message: l.message, priority: l.priority, type: 'Stock', created_at: new Date() })),
        ...alerts
    ];

    if (loading) return null;
    if (displayItems.length === 0) return null;

    const getPriorityColor = (p: string) => {
        switch (p) {
            case 'High': return '#ef4444';
            case 'Medium': return '#f59e0b';
            case 'Low': return '#3b82f6';
            default: return '#9ca3af';
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', borderLeft: '4px solid #ef4444' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <Bell size={20} color="#ef4444" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>System Attention Required</h3>
                <span style={{ fontSize: '0.8rem', background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>{displayItems.length}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {displayItems.map((alert) => {
                    const isStoredAlert = alerts.some(a => a._id === alert._id);
                    return (
                        <div key={alert._id} style={{
                            background: 'rgba(255,255,255,0.05)',
                            padding: '12px', borderRadius: '6px',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            borderLeft: `3px solid ${getPriorityColor(alert.priority)}`
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <AlertCircle size={18} color={getPriorityColor(alert.priority)} />
                                <div>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{alert.message}</p>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        {alert.type} • {new Date(alert.created_at as string | Date).toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                            {isStoredAlert && (
                                <button
                                    onClick={() => handleResolveAlert(alert._id)}
                                    title="Mark as Resolved"
                                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', opacity: 0.6 }}
                                >
                                    <CheckCircle size={18} />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
