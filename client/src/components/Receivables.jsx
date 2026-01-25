import React, { useState, useEffect } from 'react';
import '../styles/global.css';

const Receivables = ({ refreshTrigger, onPaymentRecorded }) => {
    const [receivables, setReceivables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeId, setActiveId] = useState(null); // ID of item being paid
    const [payAmount, setPayAmount] = useState('');
    const [payMode, setPayMode] = useState('Cash');

    useEffect(() => {
        fetchReceivables();
    }, [refreshTrigger]);

    const fetchReceivables = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/payments/receivables');
            if (res.ok) {
                const data = await res.json();
                setReceivables(data);
            }
        } catch (error) {
            console.error('Failed to fetch receivables', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRecordPayment = async (id) => {
        if (!payAmount || parseFloat(payAmount) <= 0) return;

        try {
            const res = await fetch('http://localhost:3000/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ref_type: 'Sales',
                    ref_id: id,
                    amount: parseFloat(payAmount),
                    payment_mode: payMode
                })
            });

            if (res.ok) {
                setActiveId(null);
                setPayAmount('');
                onPaymentRecorded(); // Trigger refresh in parent
                fetchReceivables(); // Refresh local list
            }
        } catch (err) {
            console.error('Error recording payment', err);
        }
    };

    if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading receivables...</div>;

    return (
        <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>Receivables (Pending Sales)</h3>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                            <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Invoice</th>
                            <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Customer</th>
                            <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Date</th>
                            <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: '500', textAlign: 'right' }}>Total</th>
                            <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: '500', textAlign: 'right' }}>Pending</th>
                            <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: '500', textAlign: 'center' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {receivables.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>All payments up to date!</td>
                            </tr>
                        ) : (
                            receivables.map(item => (
                                <tr key={item._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{item.invoice_number}</td>
                                    <td style={{ padding: '12px' }}>{item.customer_name}</td>
                                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                                        {new Date(item.sale_date).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'right' }}>₹{item.total_amount.toLocaleString()}</td>
                                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#ef4444' }}>
                                        ₹{item.pending_amount.toLocaleString()}
                                    </td>
                                    <td style={{ padding: '12px', textAlign: 'center' }}>
                                        {activeId === item._id ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center' }}>
                                                <input
                                                    type="number"
                                                    placeholder="Amount"
                                                    value={payAmount}
                                                    onChange={(e) => setPayAmount(e.target.value)}
                                                    style={{ width: '80px', padding: '4px', fontSize: '0.9rem' }}
                                                />
                                                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                                                    <button
                                                        onClick={() => handleRecordPayment(item._id)}
                                                        style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '0.8rem' }}
                                                    >
                                                        Confirm
                                                    </button>
                                                    <button
                                                        onClick={() => setActiveId(null)}
                                                        style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '0.8rem' }}
                                                    >
                                                        X
                                                    </button>
                                                </div>
                                                <select
                                                    value={payMode}
                                                    onChange={(e) => setPayMode(e.target.value)}
                                                    style={{ width: '80px', padding: '2px', fontSize: '0.8rem', marginTop: '4px' }}
                                                >
                                                    <option>Cash</option>
                                                    <option>Bank</option>
                                                </select>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => { setActiveId(item._id); setPayAmount(item.pending_amount); }}
                                                style={{
                                                    background: 'transparent',
                                                    color: 'var(--accent-gold)',
                                                    border: '1px solid var(--accent-gold)',
                                                    borderRadius: '4px',
                                                    padding: '6px 12px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.85rem'
                                                }}
                                            >
                                                Pay
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Receivables;
