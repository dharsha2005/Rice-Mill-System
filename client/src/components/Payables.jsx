import React, { useState, useEffect } from 'react';
import '../styles/global.css';

const Payables = ({ refreshTrigger, onPaymentRecorded }) => {
    const [payables, setPayables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeId, setActiveId] = useState(null);
    const [payAmount, setPayAmount] = useState('');
    const [payMode, setPayMode] = useState('Cash');

    useEffect(() => {
        fetchPayables();
    }, [refreshTrigger]);

    const fetchPayables = async () => {
        try {
            const res = await fetch('/api/payments/payables');
            if (res.ok) {
                const data = await res.json();
                setPayables(data);
            }
        } catch (error) {
            console.error('Failed to fetch payables', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRecordPayment = async (id) => {
        if (!payAmount || parseFloat(payAmount) <= 0) return;

        try {
            const res = await fetch('/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ref_type: 'Procurement',
                    ref_id: id,
                    amount: parseFloat(payAmount),
                    payment_mode: payMode
                })
            });

            if (res.ok) {
                setActiveId(null);
                setPayAmount('');
                onPaymentRecorded();
                fetchPayables();
            }
        } catch (err) {
            console.error('Error recording payment', err);
        }
    };

    if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading payables...</div>;

    return (
        <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>Payables (Supplier Invoices)</h3>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                            <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Supplier</th>
                            <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Date</th>
                            <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Item</th>
                            <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: '500', textAlign: 'right' }}>Total</th>
                            <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: '500', textAlign: 'right' }}>Pending</th>
                            <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: '500', textAlign: 'center' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payables.length === 0 ? (
                            <tr>
                                <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>No outstanding bills.</td>
                            </tr>
                        ) : (
                            payables.map(item => (
                                <tr key={item._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                    <td style={{ padding: '12px' }}>{item.supplier_name}</td>
                                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                                        {new Date(item.purchase_date).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{item.paddy_type}</td>
                                    <td style={{ padding: '12px', textAlign: 'right' }}>₹{item.total_amount.toLocaleString()}</td>
                                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#f59e0b' }}>
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
                                                        onChange={(e) => setPayAmount(e.target.value)}
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
                                                    color: 'var(--text-primary)',
                                                    border: '1px solid var(--border-highlight)',
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

export default Payables;
