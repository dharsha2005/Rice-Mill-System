import React, { useState, useEffect } from 'react';
import { Settings, Activity } from 'lucide-react';
import { createMillingEntry } from '../services/api';

const MillingForm = ({ onEntryAdded }) => {
    const [formData, setFormData] = useState({
        paddy_type: 'Basmati',
        input_paddy_qty: '',
        output_rice_qty: '',
        broken_rice_qty: '',
        husk_qty: ''
    });
    const [loading, setLoading] = useState(false);

    const [varieties, setVarieties] = useState([]);

    useEffect(() => {
        // Fetch varieties
        fetch('http://localhost:3000/api/varieties')
            .then(res => res.json())
            .then(data => {
                setVarieties(data);
                if (data.length > 0 && !formData.paddy_type) {
                    setFormData(prev => ({ ...prev, paddy_type: data[0].name }));
                }
            })
            .catch(err => console.error(err));
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Live calc for efficiency
    const input = parseFloat(formData.input_paddy_qty) || 0;
    const rice = parseFloat(formData.output_rice_qty) || 0;
    const broken = parseFloat(formData.broken_rice_qty) || 0;
    const efficiency = input > 0 ? ((rice + broken) / input) * 100 : 0;

    const handleSubmit = async (e) => {
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
            onEntryAdded();
            setFormData({
                paddy_type: varieties.length > 0 ? varieties[0].name : '',
                input_paddy_qty: '', output_rice_qty: '', broken_rice_qty: '', husk_qty: ''
            });
        } catch (err) {
            alert('Error entering production data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '24px', borderLeft: '4px solid var(--accent-gold)' }}>
            <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                <Settings size={20} style={{ marginRight: '10px', color: 'var(--accent-gold)' }} />
                Production Entry (Milling)
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
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
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Input Paddy (Qty)</label>
                        <input
                            type="number" name="input_paddy_qty"
                            value={formData.input_paddy_qty} onChange={handleChange}
                            placeholder="Tons" required
                        />
                    </div>
                </div>

                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                    <h4 style={{ marginBottom: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Output Metrics</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem' }}>Head Rice</label>
                            <input type="number" name="output_rice_qty" value={formData.output_rice_qty} onChange={handleChange} placeholder="Tons" required />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem' }}>Broken Rice</label>
                            <input type="number" name="broken_rice_qty" value={formData.broken_rice_qty} onChange={handleChange} placeholder="Tons" required />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.8rem' }}>Husk/Waste</label>
                            <input type="number" name="husk_qty" value={formData.husk_qty} onChange={handleChange} placeholder="Tons" required />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Activity size={18} color={efficiency > 65 ? '#10b981' : '#f59e0b'} />
                        <span style={{ color: 'var(--text-secondary)' }}>Efficiency:</span>
                        <span style={{
                            fontSize: '1.2rem',
                            fontWeight: 700,
                            color: efficiency > 65 ? '#10b981' : '#f59e0b'
                        }}>
                            {efficiency.toFixed(1)}%
                        </span>
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Processing...' : 'Log Batch'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MillingForm;
