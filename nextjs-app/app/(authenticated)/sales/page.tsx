'use client';

import { useState, useEffect, useCallback } from 'react';
import { ShoppingCart } from 'lucide-react';
import { createSale, getSales, getInventory } from '@/lib/api';
import type { Sales, Inventory } from '@/types';

export default function SalesPage() {
    const [activeTab, setActiveTab] = useState('entry');
    const [inventory, setInventory] = useState<Inventory[]>([]);
    const [salesHistory, setSalesHistory] = useState<Sales[]>([]);

    const [formData, setFormData] = useState({
        customer_name: '',
        rice_variety: '',
        grade: 'Standard',
        bag_size: 50,
        quantity_bags: '',
        rate_per_bag: '',
        transport_charge: '',
        gst_amount: '',
        payment_status: 'Paid'
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const loadInventory = useCallback(async () => {
        try {
            const data = await getInventory();
            setInventory(data);
            if (!formData.rice_variety && data.length > 0) {
                setFormData(prev => ({ ...prev, rice_variety: data[0].rice_variety }));
            }
        } catch {
            console.error('Failed to load inventory');
        }
    }, [formData.rice_variety]);

    const loadHistory = useCallback(async () => {
        try {
            const data = await getSales();
            setSalesHistory(data);
        } catch {
            console.error('Failed to load sales history');
        }
    }, []);

    useEffect(() => {
        loadInventory();
        if (activeTab === 'history') loadHistory();
    }, [activeTab, loadInventory, loadHistory]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const qty = parseFloat(formData.quantity_bags) || 0;
    const rate = parseFloat(formData.rate_per_bag) || 0;
    const transport = parseFloat(formData.transport_charge) || 0;
    const gst = parseFloat(formData.gst_amount) || 0;
    const grandTotal = (qty * rate) + transport + gst;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await createSale({
                ...formData,
                quantity_bags: qty,
                rate_per_bag: rate,
                transport_charge: transport,
                gst_amount: gst,
                payment_status: formData.payment_status as 'Paid' | 'Pending' | 'Partial'
            });
            alert('Sale Invoice Generated Successfully!');
            setFormData({
                customer_name: '', rice_variety: formData.rice_variety, grade: 'Standard', bag_size: 50,
                quantity_bags: '', rate_per_bag: '', transport_charge: '', gst_amount: '', payment_status: 'Paid'
            });
            loadInventory();
        } catch (err: unknown) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const riceOptions = [...new Set(inventory.map(i => i.rice_variety))];

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>Sales Management</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Billing & Invoicing</p>
                </div>
                <div className="glass-panel" style={{ padding: '5px', display: 'flex' }}>
                    <button
                        onClick={() => setActiveTab('entry')}
                        style={{
                            padding: '10px 20px', border: 'none', background: activeTab === 'entry' ? 'var(--accent-gold)' : 'transparent',
                            color: activeTab === 'entry' ? '#000' : 'var(--text-secondary)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600
                        }}
                    >New Invoice</button>
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
                    {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>⚠️ {error}</div>}

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px' }}>Customer Name</label>
                                <input name="customer_name" value={formData.customer_name} onChange={handleChange} required placeholder="Buyer / Company Name" />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px' }}>Payment Status</label>
                                <select name="payment_status" value={formData.payment_status} onChange={handleChange}>
                                    <option value="Paid">Paid</option>
                                    <option value="Pending">Pending</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                            <h4 style={{ marginBottom: '16px', color: 'var(--text-accent)' }}>Product Details</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Rice Variety</label>
                                    <select name="rice_variety" value={formData.rice_variety} onChange={handleChange}>
                                        <option value="">Select Rice</option>
                                        {riceOptions.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Grade</label>
                                    <select name="grade" value={formData.grade} onChange={handleChange}>
                                        <option value="Standard">Standard</option>
                                        <option value="Premium">Premium</option>
                                        <option value="Broken">Broken</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Bag Size (kg)</label>
                                    <input type="number" name="bag_size" value={formData.bag_size} onChange={handleChange} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Quantity (Bags)</label>
                                    <input type="number" name="quantity_bags" value={formData.quantity_bags} onChange={handleChange} required placeholder="0" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Rate / Bag (₹)</label>
                                    <input type="number" name="rate_per_bag" value={formData.rate_per_bag} onChange={handleChange} required placeholder="0" />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Transport Charges</label>
                                <input type="number" name="transport_charge" value={formData.transport_charge} onChange={handleChange} placeholder="0" />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>GST / Tax</label>
                                <input type="number" name="gst_amount" value={formData.gst_amount} onChange={handleChange} placeholder="0" />
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Invoice Total</span>
                            <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-gold)' }}>₹ {grandTotal.toLocaleString()}</span>
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <ShoppingCart size={20} />
                            {loading ? 'Processing...' : 'Confirm Sale & Deduct Stock'}
                        </button>
                    </form>
                </div>
            )}

            {activeTab === 'history' && (
                <div className="glass-panel" style={{ padding: '24px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ color: 'var(--text-secondary)', textAlign: 'left', borderBottom: '1px solid var(--border-subtle)' }}>
                                <th style={{ padding: '12px' }}>Invoice</th>
                                <th style={{ padding: '12px' }}>Date</th>
                                <th style={{ padding: '12px' }}>Customer</th>
                                <th style={{ padding: '12px' }}>Product</th>
                                <th style={{ padding: '12px' }}>Qty (Bags)</th>
                                <th style={{ padding: '12px' }}>Total</th>
                                <th style={{ padding: '12px' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salesHistory.map(sale => (
                                <tr key={sale._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                    <td style={{ padding: '12px', fontFamily: 'monospace', color: 'var(--text-accent)' }}>{sale.invoice_number}</td>
                                    <td style={{ padding: '12px' }}>{new Date(sale.sale_date).toLocaleDateString()}</td>
                                    <td style={{ padding: '12px', fontWeight: 500 }}>{sale.customer_name}</td>
                                    <td style={{ padding: '12px' }}>{sale.rice_variety} ({sale.grade}, {sale.bag_size}kg)</td>
                                    <td style={{ padding: '12px' }}>{sale.quantity_bags}</td>
                                    <td style={{ padding: '12px', color: 'var(--accent-gold)' }}>₹{sale.total_amount.toLocaleString()}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span style={{
                                            color: sale.payment_status === 'Paid' ? '#10b981' : '#f59e0b',
                                            background: sale.payment_status === 'Paid' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                            padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem'
                                        }}>
                                            {sale.payment_status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
