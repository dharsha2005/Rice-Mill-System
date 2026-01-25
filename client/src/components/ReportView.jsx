import React from 'react';
import '../styles/global.css';

const ReportView = ({ title, dateRange, columns, data, summary, onExport }) => {

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
        <div style={{ background: 'white', color: 'black', padding: '40px', borderRadius: '8px', minHeight: '800px' }}>
            {/* Controls - Hide on Print */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '20px' }}>
                <button
                    onClick={handleDownloadCSV}
                    style={{ padding: '8px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-primary)' }}
                >
                    Export CSV
                </button>
                <button
                    onClick={handlePrint}
                    style={{ padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Print / PDF
                </button>
            </div>

            {/* Document Header */}
            <div style={{ textAlign: 'center', marginBottom: '40px', paddingBottom: '20px', borderBottom: '2px solid #000' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', color: '#000' }}>{title}</h1>
                <p style={{ fontSize: '14px', color: '#666' }}>Generated on: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
                {dateRange && (
                    <p style={{ fontSize: '14px', fontWeight: '500', marginTop: '8px' }}>
                        Period: {dateRange.start ? new Date(dateRange.start).toLocaleDateString() : 'Start'} to {dateRange.end ? new Date(dateRange.end).toLocaleDateString() : 'Now'}
                    </p>
                )}
            </div>

            {/* Data Table */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', marginBottom: '30px' }}>
                <thead>
                    <tr>
                        {columns.map((col, idx) => (
                            <th key={idx} style={{ borderBottom: '2px solid #000', textAlign: col.align || 'left', padding: '10px 4px', fontWeight: 'bold', color: '#000' }}>
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr><td colSpan={columns.length} style={{ textAlign: 'center', padding: '20px' }}>No records found for this period.</td></tr>
                    ) : (
                        data.map((row, rIdx) => (
                            <tr key={rIdx} style={{ borderBottom: '1px solid #ddd' }}>
                                {columns.map((col, cIdx) => (
                                    <td key={cIdx} style={{ padding: '10px 4px', textAlign: col.align || 'left', color: '#000' }}>
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
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                    <div style={{ width: '300px', borderTop: '2px solid #000', paddingTop: '10px' }}>
                        {Object.entries(summary).map(([key, val]) => {
                            const isCurrency = typeof val === 'number' && !key.toLowerCase().includes('count') && !key.toLowerCase().includes('items');
                            return (
                                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                                    <span style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                    <span>{isCurrency ? `₹${val.toLocaleString()}` : val}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div style={{ marginTop: 'auto', paddingTop: '40px', textAlign: 'center', fontSize: '10px', color: '#999' }}>
                <p>This is a computer generated document. No signature required.</p>
                <p>Internal use only.</p>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white; color: black; }
                    .app-layout, .sidebar { display: none; }
                    /* Make sure report view takes full width and visible */
                    #root { display: block; }
                    .report-container { position: absolute; top: 0; left: 0; width: 100%; margin: 0; padding: 20px; }
                }
            `}</style>
        </div>
    );
};

export default ReportView;
