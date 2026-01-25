import React, { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { createProcurement } from '../services/api';

const ProcurementForm = ({ onEntryAdded }) => {
    const [formData, setFormData] = useState({
        supplier_name: '',
        paddy_type: 'Basmati',
        moisture_percentage: '',
        quantity: '',
        rate_per_quintal: '',
        purchase_date: new Date().toISOString().split('T')[0]
    });

    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    const [varieties, setVarieties] = useState([]);

    useEffect(() => {
        // Fetch varieties
        fetch('http://localhost:3000/api/varieties')
            .then(res => res.json())
            .then(data => {
                setVarieties(data);
                // Default first one if exists
                if (data.length > 0 && !formData.paddy_type) {
                    setFormData(prev => ({ ...prev, paddy_type: data[0].name }));
                }
            })
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        const qty = parseFloat(formData.quantity) || 0;
        const rate = parseFloat(formData.rate_per_quintal) || 0;
        setTotal(qty * rate);
    }, [formData.quantity, formData.rate_per_quintal]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await createProcurement({
                ...formData,
                quantity: parseFloat(formData.quantity),
                rate_per_quintal: parseFloat(formData.rate_per_quintal),
                moisture_percentage: parseFloat(formData.moisture_percentage)
            });
            onEntryAdded();
            // Reset form but keep default variety
            setFormData({
                supplier_name: '',
                paddy_type: varieties.length > 0 ? varieties[0].name : '',
                moisture_percentage: '',
                quantity: '',
                rate_per_quintal: '',
                purchase_date: new Date().toISOString().split('T')[0]
            });
        } catch (err) {
            alert('Error adding procurement');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '24px' }}>
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
                    {loading ? <RefreshCw className="spin" size={20} /> : <Save size={20} />}
                    {loading ? 'Processing...' : 'Confirm Purchase'}
                </button>
            </form>
        </div>
    );
};

export default ProcurementForm;
