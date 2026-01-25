import React, { useState } from 'react';
import '../styles/global.css';

const ExpenseForm = ({ onEntryAdded }) => {
    const [formData, setFormData] = useState({
        category: '',
        description: '',
        amount: '',
        payment_mode: 'Cash',
        expense_date: new Date().toISOString().split('T')[0]
    });
    const [status, setStatus] = useState('idle'); // idle, loading, success, error

    const categories = ['Electricity', 'Labor', 'Transport', 'Maintenance', 'Packaging', 'Diesel', 'Other'];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const response = await fetch('http://localhost:3000/api/expenses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setStatus('success');
                setFormData({
                    category: '',
                    description: '',
                    amount: '',
                    payment_mode: 'Cash',
                    expense_date: new Date().toISOString().split('T')[0]
                });
                if (onEntryAdded) onEntryAdded();
                setTimeout(() => setStatus('idle'), 3000);
            } else {
                setStatus('error');
            }
        } catch (err) {
            console.error('Error adding expense:', err);
            setStatus('error');
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>New Expense Entry</h3>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Expense Category</label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        style={{ height: '48px' }}
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
                            color: 'var(--text-accent)'
                        }}
                    />
                </div>

                <div style={{ gridColumn: '2 / 3' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Payment Mode</label>
                    <div style={{ display: 'flex', gap: '10px', height: '48px' }}>
                        {['Cash', 'Bank'].map(mode => (
                            <button
                                type="button"
                                key={mode}
                                onClick={() => setFormData(prev => ({ ...prev, payment_mode: mode }))}
                                style={{
                                    flex: 1,
                                    background: formData.payment_mode === mode ? 'var(--accent-gold)' : 'var(--bg-secondary)',
                                    color: formData.payment_mode === mode ? '#000' : 'var(--text-secondary)',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: '4px',
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
                        style={{ height: '48px' }}
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
                        style={{ height: '48px' }}
                    />
                </div>

                <div style={{ gridColumn: '2 / 3', display: 'flex', alignItems: 'flex-end' }}>
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={status === 'loading'}
                        style={{ width: '100%', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        {status === 'loading' ? 'Saving...' : status === 'success' ? 'Saved ✓' : 'Record Expense'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ExpenseForm;
