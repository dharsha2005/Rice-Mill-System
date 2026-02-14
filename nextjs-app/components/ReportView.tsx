'use client';

import React from 'react';

// Adjusted SafeColumn to avoid 'any' lint error
interface SafeColumn {
    label: string;
    accessor: (row: unknown) => string | number;
    align?: 'left' | 'right' | 'center';
}

interface ReportViewProps {
    title: string;
    dateRange?: { start: string; end: string } | null;
    columns: SafeColumn[];
    data: unknown[];
    summary?: Record<string, unknown>;
}

export default function ReportView({ title, dateRange, columns, data, summary }: ReportViewProps) {
    const handlePrint = () => {
        window.print();
    };

    const handleDownloadCSV = () => {
        if (!data || data.length === 0) return;

        const headers = columns.map(c => c.label).join(',');
        const rows = data.map(row => columns.map(c => {
            let val = c.accessor(row);
            // Escape commas for CSV
            if (typeof val === 'string' && val.includes(',')) val = `"${val}"`;
            return val;
        }).join(','));

        const csvContent = [headers, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/\s+/g, '_')}_Report.csv`;
        a.click();
    };

    return (
        <div className="glass-panel report-view-screen" style={{ padding: '32px', minHeight: '600px', border: '1px solid var(--border-subtle)' }}>
            {/* Controls - Hide on Print */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '24px' }}>
                <button
                    onClick={handleDownloadCSV}
                    className="btn-primary"
                    style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                >
                    Export CSV
                </button>
                <button
                    onClick={handlePrint}
                    style={{ padding: '8px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-highlight)', borderRadius: '6px', cursor: 'pointer', color: 'var(--accent-gold)', fontWeight: 500 }}
                >
                    Print / PDF
                </button>
            </div>

            {/* Document Header */}
            <div style={{ textAlign: 'center', marginBottom: '32px', paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px', color: 'var(--text-primary)', letterSpacing: '0.05em' }}>{title}</h2>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Generated on: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
                {dateRange && (
                    <p style={{ fontSize: '0.9rem', fontWeight: 500, marginTop: '8px', color: 'var(--text-secondary)' }}>
                        Period: {dateRange.start ? new Date(dateRange.start).toLocaleDateString() : 'Start'} to {dateRange.end ? new Date(dateRange.end).toLocaleDateString() : 'Now'}
                    </p>
                )}
            </div>

            {/* Data Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                <thead>
                    <tr>
                        {columns.map((col, idx) => (
                            <th key={idx} style={{ borderBottom: '1px solid var(--border-highlight)', textAlign: col.align || 'left', padding: '12px 8px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>No records found for this period.</td></tr>
                    ) : (
                        data.map((row, rIdx) => (
                            <tr key={rIdx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                                {columns.map((col, cIdx) => (
                                    <td key={cIdx} style={{ padding: '12px 8px', textAlign: col.align || 'left', color: 'var(--text-primary)' }}>
                                        {col.accessor(row)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Summary / Footer */}
            {summary && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                    <div style={{ width: '300px', borderTop: '1px solid var(--border-highlight)', paddingTop: '16px' }}>
                        {Object.entries(summary).map(([key, val]) => {
                            const isCurrency = typeof val === 'number' && !key.toLowerCase().includes('count') && !key.toLowerCase().includes('items');
                            return (
                                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                                    <span style={{ textTransform: 'capitalize', fontWeight: 600, color: 'var(--text-secondary)' }}>{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                    <span style={{ color: 'var(--accent-gold)' }}>{isCurrency ? `₹${(val as number).toLocaleString()}` : String(val)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div style={{ marginTop: '40px', paddingTop: '24px', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', opacity: 0.7 }}>
                <p>This is a computer generated document. No signature required.</p>
                <p>Internal use only.</p>
            </div>

            <style>{`
        @media print {
          .no-print { display: none !important; }
          .report-view-screen {
            background: white !important;
            color: black !important;
            border: 1px solid #ddd !important;
            box-shadow: none !important;
          }
          .report-view-screen th,
          .report-view-screen td,
          .report-view-screen h2,
          .report-view-screen p,
          .report-view-screen span { color: #000 !important; }
          .report-view-screen th { border-color: #000 !important; }
          .report-view-screen td { border-color: #ddd !important; }
          body { background: white; color: black; }
          .app-layout, .sidebar, .main-content > header { display: none !important; }
          .report-container { position: absolute; top: 0; left: 0; width: 100%; margin: 0; padding: 20px; }
        }
      `}</style>
        </div>
    );
}
