import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import '../styles/global.css';

const ExpenseSummary = ({ refresh }) => {
    const [summary, setSummary] = useState({ today: 0, month: 0, breakdown: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSummary();
    }, [refresh]);

    const fetchSummary = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/expenses/summary`);
            if (res.ok) {
                const data = await res.json();
                setSummary(data);
            }
        } catch (error) {
            console.error('Failed to fetch summary', error);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

    if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading summary...</div>;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
            {/* Today's Expense */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Today's Expense</span>
                <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    ₹{summary.today.toLocaleString()}
                </span>
            </div>

            {/* Monthly Expense */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>This Month</span>
                <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
                    ₹{summary.month.toLocaleString()}
                </span>
            </div>

            {/* Category Breakdown Chart */}
            <div className="glass-panel" style={{ padding: '16px', gridRow: 'span 2', display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ marginBottom: '10px', textAlign: 'center' }}>Breakdown (Month)</h4>
                <div style={{ flex: 1, minHeight: '200px' }}>
                    {summary.breakdown.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={summary.breakdown}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="total"
                                    nameKey="_id"
                                >
                                    {summary.breakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}
                                    formatter={(value) => `₹${value.toLocaleString()}`}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                            No data
                        </div>
                    )}
                </div>
            </div>

            {/* Placeholder for future trends or limits */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Status</span>
                <span style={{ fontSize: '1.2rem', fontWeight: '500', color: '#10b981' }}>
                    Within Budget
                </span>
            </div>
        </div>
    );
};

export default ExpenseSummary;
