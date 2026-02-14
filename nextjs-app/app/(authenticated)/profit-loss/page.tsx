'use client';

import { useState, useEffect } from 'react';
import { getProfitSummary, getProfitTrend } from '@/lib/api';
import ProfitSummary from '@/components/ProfitSummary';
import ProfitCharts from '@/components/ProfitCharts';

export default function ProfitLossPage() {
    const [period, setPeriod] = useState('monthly');
    const [summaryData, setSummaryData] = useState<{ netProfit: number; revenue: number; procurementCost: number; expenses: number; margin: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            setLoading(true);
            try {
                const data = await getProfitSummary();
                // API returns totalRevenue, totalCost, totalExpenses, netProfit
                const revenue = data.totalRevenue ?? 0;
                const procurementCost = (data as { totalCost?: number }).totalCost ?? 0;
                const expenses = data.totalExpenses ?? 0;
                const netProfit = data.netProfit ?? 0;
                const transformedData = {
                    netProfit,
                    revenue,
                    procurementCost,
                    expenses,
                    margin: revenue > 0 ? ((netProfit / revenue) * 100).toFixed(1) : '0'
                };
                setSummaryData(transformedData);
            } catch (err) {
                console.error("Failed to fetch P&L summary", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, [period]);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '32px' }}>
                <div>
                    <h1>Profit & Loss</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Financial Performance Engine</p>
                </div>

                {/* Period Toggle */}
                <div className="glass-panel" style={{ padding: '4px', display: 'flex', borderRadius: '8px' }}>
                    {['daily', 'monthly'].map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            style={{
                                background: period === p ? 'var(--bg-secondary)' : 'transparent',
                                color: period === p ? 'var(--text-primary)' : 'var(--text-secondary)',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                                fontWeight: '500'
                            }}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div style={{ color: 'var(--text-secondary)' }}>Calculating financials...</div>
            ) : (
                <>
                    {summaryData && <ProfitSummary data={summaryData} />}
                    <ProfitCharts />

                    <div style={{ marginTop: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        <p>ℹ️ Calculations include realtime Sales Revenue, Procurement Costs, and Operational Expenses.</p>
                    </div>
                </>
            )}

        </div>
    );
}
