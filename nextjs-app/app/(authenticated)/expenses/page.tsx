'use client';

import { useState, useEffect, useCallback } from 'react';
import { CreditCard } from 'lucide-react';
import { createExpense, getExpenses } from '@/lib/api';
import type { Expense } from '@/types';
import ExpenseSummary from '@/components/ExpenseSummary';

const categories = ['Electricity', 'Labor', 'Transport', 'Maintenance', 'Packaging', 'Diesel', 'Other'];

export default function ExpensesPage() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [formData, setFormData] = useState({
        category: '',
        description: '',
        amount: '',
        payment_mode: 'Cash' as 'Cash' | 'Bank',
        expense_date: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(false);

    const loadHistory = useCallback(async () => {
        try {
            const data = await getExpenses();
            setExpenses(data);
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        loadHistory();
    }, [loadHistory, refreshTrigger]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createExpense({
                category: (formData.category || categories[0]) as Expense['category'],
                description: formData.description,
                amount: parseFloat(formData.amount),
                payment_mode: formData.payment_mode,
                expense_date: new Date(formData.expense_date)
            });
            setFormData({
                category: '',
                description: '',
                amount: '',
                payment_mode: 'Cash',
                expense_date: new Date().toISOString().split('T')[0]
            });
            setRefreshTrigger(prev => prev + 1);
        } catch {
            alert('Error adding expense');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '32px' }}>
                <h1>Expense Management</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Track Operational Costs & Cash Flow</p>
            </header>

            <ExpenseSummary refreshTrigger={refreshTrigger} />

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '30px' }}>
                {/* New Expense Form - Client style */}
                <div style={{ alignSelf: 'start' }}>
                    <div className="glass-panel" style={{ padding: '24px' }}>
                        <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>
                            <CreditCard size={20} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                            New Expense Entry
                        </h3>

                        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Expense Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    style={{ height: '48px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', padding: '0.75rem', borderRadius: '6px', width: '100%', fontSize: '1rem' }}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>

                            <div style={{ gridColumn: '1 / 2' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Amount (₹)</label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                    required
                                    style={{
                                        height: '48px',
                                        fontSize: '1.2rem',
                                        fontWeight: '600',
                                        color: 'var(--accent-gold)',
                                        background: 'var(--bg-secondary)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '6px',
                                        padding: '0.75rem',
                                        width: '100%'
                                    }}
                                />
                            </div>

                            <div style={{ gridColumn: '2 / 3' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Payment Mode</label>
                                <div style={{ display: 'flex', gap: '10px', height: '48px' }}>
                                    {(['Cash', 'Bank'] as const).map(mode => (
                                        <button
                                            type="button"
                                            key={mode}
                                            onClick={() => setFormData(prev => ({ ...prev, payment_mode: mode }))}
                                            style={{
                                                flex: 1,
                                                background: formData.payment_mode === mode ? 'var(--accent-gold)' : 'var(--bg-secondary)',
                                                color: formData.payment_mode === mode ? '#000' : 'var(--text-secondary)',
                                                border: '1px solid var(--border-subtle)',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontWeight: '500'
                                            }}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Description / Notes</label>
                                <input
                                    type="text"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Optional details..."
                                    style={{
                                        height: '48px',
                                        background: 'var(--bg-secondary)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '6px',
                                        padding: '0.75rem',
                                        width: '100%',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                            </div>

                            <div style={{ gridColumn: '1 / 2' }}>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Date</label>
                                <input
                                    type="date"
                                    name="expense_date"
                                    value={formData.expense_date}
                                    onChange={handleChange}
                                    required
                                    style={{
                                        height: '48px',
                                        background: 'var(--bg-secondary)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '6px',
                                        padding: '0.75rem',
                                        width: '100%',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                            </div>

                            <div style={{ gridColumn: '2 / 3', display: 'flex', alignItems: 'flex-end' }}>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={loading}
                                    style={{ width: '100%', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    {loading ? 'Saving...' : 'Record Expense'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Recent Expenses List */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>Recent Expenses</h3>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                                    <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Date</th>
                                    <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Category</th>
                                    <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Description</th>
                                    <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>Mode</th>
                                    <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: '500', textAlign: 'right' }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>No expenses recorded yet.</td>
                                    </tr>
                                ) : (
                                    expenses.map(exp => (
                                        <tr key={exp._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                            <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                                                {new Date(exp.expense_date as string | Date).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{
                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    {exp.category}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{exp.description || '-'}</td>
                                            <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{exp.payment_mode}</td>
                                            <td style={{
                                                padding: '12px',
                                                textAlign: 'right',
                                                fontWeight: '600',
                                                color: exp.amount > 10000 ? '#ef4444' : 'var(--text-primary)'
                                            }}>
                                                ₹{exp.amount.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
