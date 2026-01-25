import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const VarietyManager = () => {
    const [varieties, setVarieties] = useState([]);
    const [newVariety, setNewVariety] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchVarieties();
    }, []);

    const fetchVarieties = async () => {
        try {
            const res = await fetch('/api/varieties');
            if (res.ok) setVarieties(await res.json());
        } catch (err) {
            console.error('Failed to fetch varieties');
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');
        if (!newVariety.trim()) return;

        try {
            const res = await fetch('/api/varieties', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newVariety.trim() })
            });

            if (res.ok) {
                setNewVariety('');
                fetchVarieties();
            } else {
                const data = await res.json();
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to add variety');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this variety?')) return;
        try {
            const res = await fetch(`/api/varieties/${id}`, { method: 'DELETE' });
            if (res.ok) fetchVarieties();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ marginBottom: '20px' }}>Rice Varieties Master Data</h3>

            <form onSubmit={handleAdd} style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
                <input
                    value={newVariety}
                    onChange={(e) => setNewVariety(e.target.value)}
                    placeholder="Enter new variety name (e.g. Broken Rice)"
                    style={{ flex: 1 }}
                />
                <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Plus size={18} /> Add
                </button>
            </form>

            {error && <p style={{ color: '#ef4444', marginBottom: '15px' }}>{error}</p>}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                {varieties.map(v => (
                    <div key={v._id} style={{
                        background: 'rgba(255,255,255,0.05)',
                        padding: '12px 16px', borderRadius: '6px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        border: '1px solid var(--border-subtle)'
                    }}>
                        <span style={{ fontWeight: '500' }}>{v.name}</span>
                        <button
                            onClick={() => handleDelete(v._id)}
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.7 }}
                            title="Remove"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VarietyManager;
