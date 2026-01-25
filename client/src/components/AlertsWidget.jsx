import { API_BASE_URL } from '../services/api';
import '../styles/global.css';
import { AlertCircle, CheckCircle, Bell } from 'lucide-react';

const AlertsWidget = () => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/alerts`);
            if (res.ok) {
                setAlerts(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const resolveAlert = async (id) => {
        try {
            await fetch(`http://localhost:3000/api/alerts/${id}/resolve`, { method: 'POST' });
            // Optimistic update
            setAlerts(alerts.filter(a => a._id !== id));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return null; // Don't show empty state while loading to avoid flickering
    if (alerts.length === 0) return null; // Hide widget if no alerts

    // Priority color mapping
    const getPriorityColor = (p) => {
        switch (p) {
            case 'High': return '#ef4444';
            case 'Medium': return '#f59e0b';
            case 'Low': return '#3b82f6';
            default: return '#9ca3af';
        }
    };

    return (
        <div className="glass-panel" style={{ padding: '20px', marginBottom: '24px', borderLeft: '4px solid #ef4444' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <Bell size={20} color="#ef4444" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>System Attention Required</h3>
                <span style={{ fontSize: '0.8rem', background: '#ef4444', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>{alerts.length}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {alerts.map(alert => (
                    <div key={alert._id} style={{
                        background: 'rgba(255,255,255,0.05)',
                        padding: '12px', borderRadius: '6px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        borderLeft: `3px solid ${getPriorityColor(alert.priority)}`
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <AlertCircle size={18} color={getPriorityColor(alert.priority)} />
                            <div>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{alert.message}</p>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    {alert.type} • {new Date(alert.created_at).toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => resolveAlert(alert._id)}
                            title="Mark as Resolved"
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', opacity: 0.6, hover: { opacity: 1 } }}
                        >
                            <CheckCircle size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AlertsWidget;
