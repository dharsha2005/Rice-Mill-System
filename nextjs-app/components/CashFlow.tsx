'use client';

import { useState, useEffect } from 'react';
import { getCashFlowSummary } from '@/lib/api';

interface CashFlowData {
    cashInflow: number;
    cashOutflow: number;
    netCashFlow: number;
}

export default function CashFlow({ refreshTrigger }: { refreshTrigger: number }) {
    const [summary, setSummary] = useState<CashFlowData>({ cashInflow: 0, cashOutflow: 0, netCashFlow: 0 });

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const data = await getCashFlowSummary();
                setSummary({
                    cashInflow: data.cashInflow,
                    cashOutflow: data.cashOutflow,
                    netCashFlow: data.cashInflow - data.cashOutflow
                });
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
                    <h4 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Inflow</h4>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                        +₹{summary.cashInflow.toLocaleString()}
                    </span>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '500', color: 'var(--text-primary)' }}>Sales Revenue</h3>
                </div>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', fontSize: '1.5rem' }}>
                    ↓
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h4 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Outflow</h4>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444' }}>
                        -₹{summary.cashOutflow.toLocaleString()}
                    </span>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Expenses & Payments</p>
                </div>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontSize: '1.5rem' }}>
                    ↑
                </div>
            </div>
        </div>
    );
}
