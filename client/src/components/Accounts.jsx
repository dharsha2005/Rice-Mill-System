import React, { useState } from 'react';
import Receivables from './Receivables';
import Payables from './Payables';
import CashFlow from './CashFlow';
import '../styles/global.css';

const Accounts = () => {
    // Shared trigger to refresh all data when a payment is made anywhere
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handlePaymentRecorded = () => {
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '32px' }}>
                <h1>Accounts & Payments</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Manage Cash Flow & Settlements</p>
            </header>

            <CashFlow refreshTrigger={refreshTrigger} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px' }}>
                <Receivables refreshTrigger={refreshTrigger} onPaymentRecorded={handlePaymentRecorded} />
                <Payables refreshTrigger={refreshTrigger} onPaymentRecorded={handlePaymentRecorded} />
            </div>
        </div>
    );
};

export default Accounts;
