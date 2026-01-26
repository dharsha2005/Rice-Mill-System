import React, { useState, useEffect } from 'react';
import '../styles/global.css';

const CashFlow = ({ refreshTrigger }) => {
    const [summary, setSummary] = useState({ todayInflow: 0, todayOutflow: 0 });

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await fetch('/api/payments/summary');
                if (res.ok) {
                    const data = await res.json();
                    setSummary(data);
                }
            } catch (err) {
                console.error("Error fetching cash flow", err);
            }
        };
        fetchSummary();
    }, [refreshTrigger]);

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '32px' }}>
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h4 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Today's Inflow</h4>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                        +₹{summary.todayInflow.toLocaleString()}
                    </span>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>From Sales Collections</p>
                </div>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', fontSize: '1.5rem' }}>
                    ↓
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h4 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Today's Outflow</h4>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>
                        -₹{summary.todayOutflow.toLocaleString()}
                    </span>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Expenses & Payments</p>
                </div>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontSize: '1.5rem' }}>
                    ↑
                </div>
            </div>
        </div>
    );
};

export default CashFlow;
