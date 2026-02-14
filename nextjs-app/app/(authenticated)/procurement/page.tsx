'use client';

import { useState, useEffect, useCallback } from 'react';
import { Save } from 'lucide-react';
import { createProcurement, getProcurements, getVarieties } from '@/lib/api';
import type { Procurement, RiceVariety } from '@/types';

export default function ProcurementPage() {
    const [activeTab, setActiveTab] = useState('entry');
    const [varieties, setVarieties] = useState<RiceVariety[]>([]);
    const [procurements, setProcurements] = useState<Procurement[]>([]);

    const [formData, setFormData] = useState({
        supplier_name: '',
        paddy_type: '',
        moisture_percentage: '',
        quantity: '',
        rate_per_quintal: '',
        purchase_date: new Date().toISOString().split('T')[0]
    });

    const [loading, setLoading] = useState(false);

    const loadVarieties = useCallback(async () => {
        try {
            const data = await getVarieties();
            setVarieties(data);
            if (data.length > 0 && !formData.paddy_type) {
                setFormData(prev => ({ ...prev, paddy_type: data[0].name }));
            }
        } catch {
            console.error('Failed to load varieties');
        }
    }, [formData.paddy_type]);

    const loadHistory = useCallback(async () => {
        try {
            const data = await getProcurements();
            setProcurements(data);
        } catch {
            console.error('Failed to load history');
        }
    }, []);

    useEffect(() => {
        loadVarieties();
        if (activeTab === 'history') loadHistory();
    }, [activeTab, loadVarieties, loadHistory]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const qty = parseFloat(formData.quantity) || 0;
    const rate = parseFloat(formData.rate_per_quintal) || 0;
    const total = qty * rate;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createProcurement({
                ...formData,
                quantity: qty,
                rate_per_quintal: rate,
                moisture_percentage: parseFloat(formData.moisture_percentage)
            });
            alert('Procurement added successfully!');
            setFormData({
                supplier_name: '',
                paddy_type: varieties.length > 0 ? varieties[0].name : '',
                moisture_percentage: '',
                quantity: '',
                rate_per_quintal: '',
                purchase_date: new Date().toISOString().split('T')[0]
            });
        } catch {
            alert('Error adding procurement');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Procurement</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Paddy Purchase Management</p>
                </div>
                <div className="glass-panel" style={{ padding: '5px', display: 'flex' }}>
                    <button
                        onClick={() => setActiveTab('entry')}
                        style={{
                            padding: '10px 20px', border: 'none', background: activeTab === 'entry' ? 'var(--accent-gold)' : 'transparent',
                            color: activeTab === 'entry' ? '#000' : 'var(--text-secondary)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600
                        }}
                    >New Entry</button>
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
                <div className="glass-panel" style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
                    <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: '10px' }}>📝</span> New Procurement Entry
                    </h3>

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Supplier / Farmer Name</label>
                            <input
                                name="supplier_name"
                                value={formData.supplier_name}
                                onChange={handleChange}
                                placeholder="e.g. Ramarao Farms"
                                required
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Paddy Type</label>
                                <select name="paddy_type" value={formData.paddy_type} onChange={handleChange}>
                                    {varieties.map(v => (
                                        <option key={v._id} value={v.name}>{v.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Moisture %</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    name="moisture_percentage"
                                    value={formData.moisture_percentage}
                                    onChange={handleChange}
                                    placeholder="14.5"
                                />
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Quantity (Quintals)</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    placeholder="100"
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Rate / Quintal (₹)</label>
                                <input
                                    type="number"
                                    name="rate_per_quintal"
                                    value={formData.rate_per_quintal}
                                    onChange={handleChange}
                                    placeholder="2100"
                                    required
                                />
                            </div>
                        </div>

                        <div style={{
                            background: 'rgba(0,0,0,0.2)',
                            padding: '16px',
                            borderRadius: '8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '10px'
                        }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Total Amount</span>
                            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                                ₹ {total.toLocaleString()}
                            </span>
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                            <Save size={20} />
                            {loading ? 'Processing...' : 'Confirm Purchase'}
                        </button>
                    </form>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="glass-panel" style={{ padding: '24px' }}>
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Supplier</th>
                                <th>Paddy Type</th>
                                <th>Moisture %</th>
                                <th>Quantity (Q)</th>
                                <th>Rate</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {procurements.map(p => (
                                <tr key={p._id}>
                                    <td>{new Date(p.purchase_date).toLocaleDateString()}</td>
                                    <td>{p.supplier_name}</td>
                                    <td>{p.paddy_type}</td>
                                    <td>{p.moisture_percentage}%</td>
                                    <td>{p.quantity}</td>
                                    <td>₹{p.rate_per_quintal}</td>
                                    <td style={{ color: 'var(--accent-gold)' }}>₹{p.total_amount.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
