import React, { useState, useEffect } from 'react';
import '../styles/global.css';

const ExpenseList = ({ refresh }) => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchExpenses();
    }, [refresh]);

    const fetchExpenses = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/expenses');
            if (res.ok) {
                const data = await res.json();
                setExpenses(data);
            }
        } catch (error) {
            console.error('Failed to fetch expenses', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading expenses...</div>;

    return (
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
                                <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>No expenses recorded yet.</td>
                            </tr>
                        ) : (
                            expenses.map(expense => (
                                <tr key={expense._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                                        {new Date(expense.expense_date).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.85rem'
                                        }}>
                                            {expense.category}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{expense.description || '-'}</td>
                                    <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{expense.payment_mode}</td>
                                    <td style={{
                                        padding: '12px',
                                        textAlign: 'right',
                                        fontWeight: '600',
                                        color: expense.amount > 10000 ? '#ef4444' : 'var(--text-primary)' // Highlight high value
                                    }}>
                                        ₹{expense.amount.toLocaleString()}
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

export default ExpenseList;
