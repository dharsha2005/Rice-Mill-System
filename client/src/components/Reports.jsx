import React, { useState } from 'react';
import ReportView from './ReportView';
import { FileText, Calendar, Filter } from 'lucide-react';
import '../styles/global.css';

const Reports = () => {
    const [activeReport, setActiveReport] = useState('sales');
    const [dateRange, setDateRange] = useState(() => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1); // First day of current month
        // Format as YYYY-MM-DD manually to avoid timezone shift from toISOString() in UTC
        const formatDate = (d) => {
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        return {
            start: formatDate(start),
            end: formatDate(now)
        };
    });
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);

    const generateReport = async () => {
        setLoading(true);
        try {
            let url = `/api/reports/${activeReport}`;
            if (activeReport !== 'stock') {
                url += `?startDate=${dateRange.start}&endDate=${dateRange.end}`;
            }

            const res = await fetch(url);
            if (res.ok) {
                const json = await res.json();
                setReportData(json);
            }
        } catch (err) {
            console.error('Failed to generate report', err);
        } finally {
            setLoading(false);
        }
    };

    // Column Definitions based on report type
    const getColumns = () => {
        switch (activeReport) {
            case 'sales':
                return [
                    { label: 'Date', accessor: r => new Date(r.sale_date).toLocaleDateString() },
                    { label: 'Invoice', accessor: r => r.invoice_number },
                    { label: 'Customer', accessor: r => r.customer_name },
                    { label: 'Item', accessor: r => r.rice_variety },
                    { label: 'Bags', accessor: r => r.quantity_bags, align: 'right' },
                    { label: 'Total', accessor: r => `₹${r.total_amount.toLocaleString()}`, align: 'right' }
                ];
            case 'expenses':
                return [
                    { label: 'Date', accessor: r => new Date(r.expense_date).toLocaleDateString() },
                    { label: 'Category', accessor: r => r.category },
                    { label: 'Description', accessor: r => r.description || '-' },
                    { label: 'Amount', accessor: r => `₹${r.amount.toLocaleString()}`, align: 'right' }
                ];
            case 'stock':
                return [
                    { label: 'Item', accessor: r => r.rice_variety },
                    { label: 'Grade', accessor: r => r.grade },
                    { label: 'Bag Size', accessor: r => `${r.bag_size} kg`, align: 'right' },
                    { label: 'Stock Level', accessor: r => `${r.quantity} bags`, align: 'right' },
                    { label: 'Location', accessor: r => r.godown_location },
                    { label: 'Status', accessor: r => r.quantity < r.minimum_threshold ? 'Low Stock' : 'Good' }
                ];
            case 'profit-loss': // Special case handled in logic if structured different, but likely similar table
                // The P&L API returns `data` array with category, description, amount
                return [
                    { label: 'Category', accessor: r => r.category },
                    { label: 'Description', accessor: r => r.description },
                    { label: 'Type', accessor: r => r.type.toUpperCase() },
                    { label: 'Amount', accessor: r => `₹${r.amount.toLocaleString()}`, align: 'right' }
                ];
            default:
                return [];
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '32px' }}>
                <h1>Reports & Audit</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Official Business Records</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '30px' }}>

                {/* Sidebar Controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="glass-panel" style={{ padding: '20px' }}>
                        <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>Report Type</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {[
                                { id: 'sales', label: 'Sales Registry' },
                                { id: 'expenses', label: 'Expense Log' },
                                { id: 'stock', label: 'Inventory Status' },
                                { id: 'profit-loss', label: 'Profit & Loss Statement' }
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => { setActiveReport(item.id); setReportData(null); }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '10px',
                                        padding: '10px 12px',
                                        background: activeReport === item.id ? 'var(--bg-secondary)' : 'transparent',
                                        border: 'none',
                                        borderRadius: '6px',
                                        color: activeReport === item.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        fontWeight: activeReport === item.id ? '600' : '400'
                                    }}
                                >
                                    <FileText size={16} />
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '20px' }}>
                        <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>Parameters</h3>

                        {activeReport !== 'stock' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>From Date</label>
                                    <input
                                        type="date"
                                        value={dateRange.start}
                                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>To Date</label>
                                    <input
                                        type="date"
                                        value={dateRange.end}
                                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            className="btn-primary"
                            style={{ width: '100%', marginTop: '20px' }}
                            onClick={generateReport}
                            disabled={loading}
                        >
                            {loading ? 'Generating...' : 'Generate Report'}
                        </button>
                    </div>
                </div>

                {/* Report View Area */}
                <div className="report-container">
                    {reportData ? (
                        <ReportView
                            title={`${activeReport} Report`}
                            dateRange={activeReport !== 'stock' ? dateRange : null}
                            columns={getColumns()}
                            data={reportData.data || []}
                            summary={reportData.summary}
                        />
                    ) : (
                        <div className="glass-panel" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text-secondary)', minHeight: '600px' }}>
                            <FileText size={64} style={{ opacity: 0.2, marginBottom: '20px' }} />
                            <p>Select a report type and click Generate.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Reports;
