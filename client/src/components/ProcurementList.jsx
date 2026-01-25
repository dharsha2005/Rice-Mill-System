import React, { useEffect, useState } from 'react';
import { fetchProcurements } from '../services/api';

const ProcurementList = ({ refresh }) => {
    const [procurements, setProcurements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [refresh]);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await fetchProcurements();
            setProcurements(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading && procurements.length === 0) return <div style={{ padding: '20px', color: '#fff' }}>Loading list...</div>;

    return (
        <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
            <h3 style={{ marginBottom: '20px' }}>Recent Transactions</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                        <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Date</th>
                        <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Supplier</th>
                        <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Type</th>
                        <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>M%</th>
                        <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Qty (Q)</th>
                        <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Rate</th>
                        <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Total</th>
                        <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {procurements.map((item) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                            <td style={{ padding: '12px' }}>{new Date(item.purchase_date).toLocaleDateString()}</td>
                            <td style={{ padding: '12px', fontWeight: 500 }}>{item.supplier_name}</td>
                            <td style={{ padding: '12px' }}>
                                <span style={{
                                    padding: '4px 8px',
                                    background: 'rgba(255,255,255,0.05)',
                                    borderRadius: '4px',
                                    fontSize: '0.85rem'
                                }}>
                                    {item.paddy_type}
                                </span>
                            </td>
                            <td style={{ padding: '12px' }}>{item.moisture_percentage}%</td>
                            <td style={{ padding: '12px' }}>{item.quantity}</td>
                            <td style={{ padding: '12px' }}>₹{item.rate_per_quintal}</td>
                            <td style={{ padding: '12px', color: 'var(--accent-gold)' }}>₹{item.total_amount.toLocaleString()}</td>
                            <td style={{ padding: '12px' }}>
                                <span style={{
                                    color: item.payment_status === 'Paid' ? '#10b981' : '#f59e0b',
                                    background: item.payment_status === 'Paid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                    padding: '4px 8px',
                                    borderRadius: '12px',
                                    fontSize: '0.8rem'
                                }}>
                                    {item.payment_status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProcurementList;
