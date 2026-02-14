'use client';

import { useState, useEffect } from 'react';
import { getInventory } from '@/lib/api';
import { Package, AlertTriangle, CheckCircle } from 'lucide-react';
import type { Inventory } from '@/types';

export default function InventoryPage() {
    const [stock, setStock] = useState<Inventory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await getInventory();
            setStock(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (item: Inventory) => {
        if (item.quantity <= item.minimum_threshold) return '#ef4444'; // Red
        if (item.quantity <= item.minimum_threshold * 1.5) return '#f59e0b'; // Amber
        return '#10b981'; // Green
    };

    if (loading) return <div style={{ color: '#fff', padding: '20px' }}>Checking Godowns...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '32px' }}>
                <h1>Finished Rice Stock</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Real-time Inventory across all Godowns</p>
            </header>

            {stock.length === 0 ? (
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <Package size={48} style={{ marginBottom: '20px', opacity: 0.5 }} />
                    <p>No Finished Stock Recorded. Start Milling to generate stock.</p>
                </div>
            ) : (
                <div className="glass-panel" style={{ padding: '24px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-subtle)' }}>
                                <th style={{ padding: '16px' }}>Rice Variety</th>
                                <th style={{ padding: '16px' }}>Grade</th>
                                <th style={{ padding: '16px' }}>Bag Size</th>
                                <th style={{ padding: '16px' }}>Available Qty</th>
                                <th style={{ padding: '16px' }}>Location</th>
                                <th style={{ padding: '16px' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stock.map(item => {
                                const statusColor = getStatusColor(item);
                                return (
                                    <tr key={item._id} style={{
                                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                                        background: item.quantity <= item.minimum_threshold ? 'rgba(239, 68, 68, 0.05)' : 'transparent'
                                    }}>
                                        <td style={{ padding: '16px', fontWeight: 600, color: 'var(--accent-gold)' }}>{item.rice_variety}</td>
                                        <td style={{ padding: '16px' }}>{item.grade}</td>
                                        <td style={{ padding: '16px' }}>{item.bag_size} kg</td>
                                        <td style={{ padding: '16px', fontSize: '1.1rem', fontWeight: 700 }}>
                                            {item.quantity} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-secondary)' }}>Bags</span>
                                        </td>
                                        <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{item.godown_location}</td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: statusColor }}>
                                                {item.quantity <= item.minimum_threshold ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
                                                <span style={{ fontWeight: 500 }}>
                                                    {item.quantity <= item.minimum_threshold ? 'Low Stock' : 'Good'}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
