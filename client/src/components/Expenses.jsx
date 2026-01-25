import React, { useState } from 'react';
import ExpenseSummary from './ExpenseSummary';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import '../styles/global.css';

const Expenses = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleEntryAdded = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '32px' }}>
                <h1>Expense Management</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Track Operational Costs & Cash Flow</p>
            </header>

            <ExpenseSummary refresh={refreshTrigger} />

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: '30px' }}>
                <div style={{ alignSelf: 'start' }}>
                    <ExpenseForm onEntryAdded={handleEntryAdded} />
                </div>
                <div>
                    <ExpenseList refresh={refreshTrigger} />
                </div>
            </div>
        </div>
    );
};

export default Expenses;
