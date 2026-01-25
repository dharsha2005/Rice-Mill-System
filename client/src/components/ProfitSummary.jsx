import React, { useEffect, useState } from 'react';
import '../styles/global.css';

const CountUp = ({ end, duration = 1000 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime = null;
        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = currentTime - startTime;
            const percentage = Math.min(progress / duration, 1);

            // Ease out quart
            const ease = 1 - Math.pow(1 - percentage, 4);

            setCount(Math.floor(end * ease));

            if (progress < duration) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }, [end, duration]);

    return <span>{count.toLocaleString()}</span>;
};

const ProfitSummary = ({ data }) => {
    const isProfit = data.netProfit >= 0;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>

            {/* Revenue */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.9rem' }}>Total Revenue</span>
                <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    ₹ <CountUp end={data.revenue} />
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 'auto' }}>Gross Sales</span>
            </div>

            {/* COGS (Procurement) */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.9rem' }}>Procurement Cost</span>
                <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    ₹ <CountUp end={data.procurementCost} />
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 'auto' }}>Raw Materials</span>
            </div>

            {/* Expenses */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
                <span style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.9rem' }}>Operational Exp.</span>
                <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                    ₹ <CountUp end={data.expenses} />
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 'auto' }}>Fixed & Variable</span>
            </div>

            {/* Net Profit */}
            <div className="glass-panel" style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                background: isProfit ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                borderColor: isProfit ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'
            }}>
                <span style={{ color: isProfit ? '#10b981' : '#ef4444', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '600' }}>NET PROFIT / LOSS</span>
                <span style={{ fontSize: '2rem', fontWeight: 'bold', color: isProfit ? '#10b981' : '#ef4444' }}>
                    {isProfit ? '+' : '-'} ₹ <CountUp end={Math.abs(data.netProfit)} />
                </span>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Margin</span>
                    <span style={{ fontWeight: 'bold', color: isProfit ? '#10b981' : '#ef4444' }}>{data.margin}%</span>
                </div>
            </div>

        </div>
    );
};

export default ProfitSummary;
