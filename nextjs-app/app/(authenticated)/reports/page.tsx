'use client';

import { useState, useCallback } from 'react';
import ReportView from '@/components/ReportView';
import { FileText } from 'lucide-react';

interface ReportRow {
    [key: string]: unknown;
}

interface ReportData {
    data: ReportRow[];
    summary?: Record<string, unknown>;
}

export default function ReportsPage() {
    const [activeReport, setActiveReport] = useState('sales');
    const [dateRange, setDateRange] = useState(() => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const formatDate = (d: Date) => {
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
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(false);

    const generateReport = useCallback(async () => {
        setLoading(true);
        try {
            let url = `/api/reports/${activeReport}`;
            if (activeReport !== 'stock') {
                url += `?startDate=${dateRange.start}&endDate=${dateRange.end}`;
            }

            const res = await fetch(url);
            if (res.ok) {
                const json = await res.json();

                // Normalize API response: each report returns different keys
                let data: ReportRow[] = [];
                let summary: Record<string, unknown> | undefined;

                if (activeReport === 'sales') {
                    data = Array.isArray(json.sales) ? json.sales : [];
                    summary = json.summary;
                } else if (activeReport === 'expenses') {
                    data = Array.isArray(json.expenses) ? json.expenses : [];
                    summary = json.summary;
                } else if (activeReport === 'stock') {
                    data = Array.isArray(json.inventory) ? json.inventory : [];
                    summary = json.summary;
                } else if (activeReport === 'profit-loss') {
                    // P&L API returns summary only - build display rows from metrics
                    const rev = json.revenue ?? 0;
                    const cost = json.cost ?? 0;
                    const exp = json.expenses ?? 0;
                    const net = json.netProfit ?? 0;
                    data = [
                        { category: 'Revenue', description: 'Total Sales', type: 'revenue', amount: rev },
                        { category: 'Cost', description: 'Procurement', type: 'cost', amount: -cost },
                        { category: 'Expenses', description: 'Operational', type: 'expense', amount: -exp },
                        { category: 'Net Profit', description: 'Bottom Line', type: 'profit', amount: net }
                    ];
                    summary = {
                        revenue: rev,
                        cost,
                        expenses: exp,
                        grossProfit: rev - cost,
                        netProfit: net,
                        profitMargin: json.profitMargin
                    };
                }

                setReportData({ data, summary });
            }
        } catch {
            console.error('Failed to generate report');
        } finally {
            setLoading(false);
        }
    }, [activeReport, dateRange]);

    const getColumns = () => {
        switch (activeReport) {
            case 'sales':
                return [
                    { label: 'Date', accessor: (r: unknown) => new Date((r as { sale_date: string }).sale_date).toLocaleDateString() },
                    { label: 'Invoice', accessor: (r: unknown) => (r as { invoice_number: string }).invoice_number },
                    { label: 'Customer', accessor: (r: unknown) => (r as { customer_name: string }).customer_name },
                    { label: 'Item', accessor: (r: unknown) => (r as { rice_variety: string }).rice_variety },
                    { label: 'Bags', accessor: (r: unknown) => (r as { quantity_bags: number }).quantity_bags, align: 'right' as const },
                    { label: 'Total', accessor: (r: unknown) => `₹${(r as { total_amount: number }).total_amount.toLocaleString()}`, align: 'right' as const }
                ];
            case 'expenses':
                return [
                    { label: 'Date', accessor: (r: unknown) => new Date((r as { expense_date: string }).expense_date).toLocaleDateString() },
                    { label: 'Category', accessor: (r: unknown) => (r as { category: string }).category },
                    { label: 'Description', accessor: (r: unknown) => (r as { description?: string }).description || '-' },
                    { label: 'Amount', accessor: (r: unknown) => `₹${(r as { amount: number }).amount.toLocaleString()}`, align: 'right' as const }
                ];
            case 'stock':
                return [
                    { label: 'Item', accessor: (r: unknown) => (r as { rice_variety: string }).rice_variety },
                    { label: 'Grade', accessor: (r: unknown) => (r as { grade: string }).grade },
                    { label: 'Bag Size', accessor: (r: unknown) => `${(r as { bag_size: number }).bag_size} kg`, align: 'right' as const },
                    { label: 'Stock Level', accessor: (r: unknown) => `${(r as { quantity: number }).quantity} bags`, align: 'right' as const },
                    { label: 'Location', accessor: (r: unknown) => (r as { godown_location?: string; location?: string }).godown_location || (r as { godown_location?: string; location?: string }).location || 'Warehouse A' },
                    { label: 'Status', accessor: (r: unknown) => (r as { quantity: number; minimum_threshold: number }).quantity < (r as { quantity: number; minimum_threshold: number }).minimum_threshold ? 'Low Stock' : 'Good' }
                ];
            case 'profit-loss':
                return [
                    { label: 'Category', accessor: (r: unknown) => (r as { category: string }).category },
                    { label: 'Description', accessor: (r: unknown) => (r as { description: string }).description },
                    { label: 'Type', accessor: (r: unknown) => (r as { type: string }).type.toUpperCase() },
                    { label: 'Amount', accessor: (r: unknown) => {
                        const amt = (r as { amount: number }).amount;
                        return amt < 0 ? `(₹${Math.abs(amt).toLocaleString()})` : `₹${amt.toLocaleString()}`;
                    }, align: 'right' as const }
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
                            title={activeReport === 'profit-loss' ? 'Profit & Loss Report' : activeReport === 'stock' ? 'Inventory Status Report' : `${activeReport.charAt(0).toUpperCase() + activeReport.slice(1)} Report`}
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
}
