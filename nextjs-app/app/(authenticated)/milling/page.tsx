'use client';

import { useState, useEffect, useCallback } from 'react';
import { Factory } from 'lucide-react';
import { createMillingEntry, getMillingHistory } from '@/lib/api';
import type { Milling } from '@/types';

export default function MillingPage() {
    const [activeTab, setActiveTab] = useState('entry');
    const [history, setHistory] = useState<Milling[]>([]);

    const [formData, setFormData] = useState({
        paddy_type: 'Basmati',
        input_paddy_qty: '',
        output_rice_qty: '',
        broken_rice_qty: '',
        husk_qty: '',
        milling_date: new Date().toISOString().split('T')[0]
    });

    const [loading, setLoading] = useState(false);

    const loadHistory = useCallback(async () => {
        try {
            const data = await getMillingHistory();
            setHistory(data);
        } catch {
            console.error('Failed to load milling history');
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'history') loadHistory();
    }, [activeTab, loadHistory]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createMillingEntry({
                ...formData,
                input_paddy_qty: parseFloat(formData.input_paddy_qty),
                output_rice_qty: parseFloat(formData.output_rice_qty),
                broken_rice_qty: parseFloat(formData.broken_rice_qty),
                husk_qty: parseFloat(formData.husk_qty)
            });
            alert('Milling entry added successfully!');
            setFormData({
                paddy_type: 'Basmati',
                input_paddy_qty: '',
                output_rice_qty: '',
                broken_rice_qty: '',
                husk_qty: '',
                milling_date: new Date().toISOString().split('T')[0]
            });
        } catch {
            alert('Error adding milling entry');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Milling Operations</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Paddy Processing & Conversion</p>
                </div>
                <div className="glass-panel" style={{ padding: '5px', display: 'flex' }}>
                    <button
                        onClick={() => setActiveTab('entry')}
                        style={{
                            padding: '10px 20px', border: 'none', background: activeTab === 'entry' ? 'var(--accent-gold)' : 'transparent',
                            color: activeTab === 'entry' ? '#000' : 'var(--text-secondary)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600
                        }}
                    >New Batch</button>
                    <button
                        onClick={() => setActiveTab('history')}
                        style={{
                            padding: '10px 20px', border: 'none', background: activeTab === 'history' ? 'var(--accent-gold)' : 'transparent',
                            color: activeTab === 'history' ? '#000' : 'var(--text-secondary)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600
                        }}
                    >History</button>
                </div>
            </header>

            {activeTab === 'entry' && (
                <div className="glass-panel" style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
                    <h3 style={{ marginBottom: '20px' }}>
                        <Factory size={24} style={{ display: 'inline', marginRight: '10px' }} />
                        New Milling Batch
                    </h3>

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px' }}>Paddy Type</label>
                            <input name="paddy_type" value={formData.paddy_type} onChange={handleChange} required />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px' }}>Input Paddy (Tons)</label>
                                <input type="number" step="0.01" name="input_paddy_qty" value={formData.input_paddy_qty} onChange={handleChange} required placeholder="10.5" />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px' }}>Output Rice (Tons)</label>
                                <input type="number" step="0.01" name="output_rice_qty" value={formData.output_rice_qty} onChange={handleChange} required placeholder="7.2" />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px' }}>Broken Rice (Tons)</label>
                                <input type="number" step="0.01" name="broken_rice_qty" value={formData.broken_rice_qty} onChange={handleChange} required placeholder="1.5" />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px' }}>Husk (Tons)</label>
                                <input type="number" step="0.01" name="husk_qty" value={formData.husk_qty} onChange={handleChange} required placeholder="1.8" />
                            </div>
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
                            {loading ? 'Processing...' : 'Submit Milling Batch'}
                        </button>
                    </form>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="glass-panel" style={{ padding: '24px' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Batch ID</th>
                                <th>Date</th>
                                <th>Paddy Type</th>
                                <th>Input (T)</th>
                                <th>Output (T)</th>
                                <th>Broken (T)</th>
                                <th>Efficiency %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map(m => (
                                <tr key={m._id}>
                                    <td style={{ fontFamily: 'monospace' }}>{m.batch_id}</td>
                                    <td>{new Date(m.milling_date).toLocaleDateString()}</td>
                                    <td>{m.paddy_type}</td>
                                    <td>{m.input_paddy_qty}</td>
                                    <td>{m.output_rice_qty}</td>
                                    <td>{m.broken_rice_qty}</td>
                                    <td style={{ color: 'var(--accent-gold)' }}>{m.efficiency_percentage.toFixed(1)}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
