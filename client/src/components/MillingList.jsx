import React, { useEffect, useState } from 'react';
import { fetchMillingHistory } from '../services/api';

const MillingList = ({ refresh }) => {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetchMillingHistory().then(setHistory).catch(console.error);
    }, [refresh]);

    return (
        <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '20px' }}>Production Batches</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ color: 'var(--text-secondary)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                        <th style={{ padding: '10px' }}>Batch ID</th>
                        <th style={{ padding: '10px' }}>Date</th>
                        <th style={{ padding: '10px' }}>Input</th>
                        <th style={{ padding: '10px' }}>Output (Rice)</th>
                        <th style={{ padding: '10px' }}>Efficiency</th>
                    </tr>
                </thead>
                <tbody>
                    {history.map(item => (
                        <tr key={item.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <td style={{ padding: '10px', fontFamily: 'monospace', color: 'var(--accent-gold)' }}>{item.batch_id}</td>
                            <td style={{ padding: '10px' }}>{new Date(item.milling_date).toLocaleDateString()}</td>
                            <td style={{ padding: '10px' }}>{item.input_paddy_qty} T</td>
                            <td style={{ padding: '10px' }}>{item.output_rice_qty} T</td>
                            <td style={{ padding: '10px' }}>
                                <span style={{
                                    color: item.efficiency_percentage > 65 ? '#10b981' : '#ef4444',
                                    fontWeight: 600
                                }}>
                                    {item.efficiency_percentage.toFixed(1)}%
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MillingList;
