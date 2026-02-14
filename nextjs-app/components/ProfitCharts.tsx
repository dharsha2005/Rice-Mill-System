'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { getProfitTrend } from '@/lib/api';

interface ChartData {
    month: string;
    profit: number;
    revenue: number;
    cost: number;
    expenses: number;
    totalCost: number;
}

export default function ProfitCharts() {
    const [data, setData] = useState<ChartData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const json = await getProfitTrend();
                // API returns { month, revenue, cost, expenses, profit }
                const transformedData = json.map((item: { month: string; profit: number; revenue?: number; cost?: number; expenses?: number }) => ({
                    month: item.month,
                    profit: item.profit,
                    revenue: item.revenue ?? 0,
                    cost: item.cost ?? 0,
                    expenses: item.expenses ?? 0,
                    totalCost: (item.cost ?? 0) + (item.expenses ?? 0)
                }));
                setData(transformedData);
            } catch (err) {
                console.error('Error fetching trend data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading charts...</div>;
    if (data.length === 0) return <div style={{ color: 'var(--text-secondary)' }}>No trend data available.</div>;

    const gradientOffset = () => {
        const dataMax = Math.max(...data.map((i) => i.profit));
        const dataMin = Math.min(...data.map((i) => i.profit));

        if (dataMax <= 0) {
            return 0;
        }
        if (dataMin >= 0) {
            return 1;
        }

        return dataMax / (dataMax - dataMin);
    };

    const off = gradientOffset();

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', height: '400px' }}>

            {/* Profit Trend Area Chart */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ marginBottom: '20px', fontSize: '1rem', color: 'var(--text-secondary)' }}>Net Profit Trend (6 Months)</h3>
                <div style={{ flex: 1 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset={off} stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset={off} stopColor="#ef4444" stopOpacity={0.3} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                            <Tooltip
                                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}
                                formatter={(val: number | string | undefined) => [`₹${Number(val ?? 0).toLocaleString()}`, '']}
                            />
                            <Area type="monotone" dataKey="profit" stroke="#8884d8" fill="url(#splitColor)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Revenue vs Expense Bar Chart */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ marginBottom: '20px', fontSize: '1rem', color: 'var(--text-secondary)' }}>Revenue vs Outflow</h3>
                <div style={{ flex: 1 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                            <XAxis dataKey="month" hide />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}
                                formatter={(val: number | string | undefined) => [`₹${Number(val ?? 0).toLocaleString()}`, '']}
                            />
                            <Legend wrapperStyle={{ fontSize: '12px' }} />
                            <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="totalCost" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Total Cost" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

        </div>
    );
}
