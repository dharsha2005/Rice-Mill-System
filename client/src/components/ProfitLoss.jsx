import { API_BASE_URL } from '../services/api';
import ProfitSummary from './ProfitSummary';
import ProfitCharts from './ProfitCharts';
import { Calendar } from 'lucide-react';
import '../styles/global.css';

const ProfitLoss = () => {
    const [period, setPeriod] = useState('monthly'); // 'monthly', 'daily' (could expand to custom date range later)
    const [summaryData, setSummaryData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${API_BASE_URL}/profit-loss/summary?period=${period}`);
                if (res.ok) {
                    const data = await res.json();
                    setSummaryData(data);
                }
            } catch (err) {
                console.error("Failed to fetch P&L summary", err);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, [period]);

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '32px' }}>
                <div>
                    <h1>Profit & Loss</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Financial Performance Engine</p>
                </div>

                {/* Period Toggle */}
                <div className="glass-panel" style={{ padding: '4px', display: 'flex', borderRadius: '8px' }}>
                    {['daily', 'monthly'].map(p => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            style={{
                                background: period === p ? 'var(--bg-secondary)' : 'transparent',
                                color: period === p ? 'var(--text-primary)' : 'var(--text-secondary)',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                                fontWeight: '500'
                            }}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div style={{ color: 'var(--text-secondary)' }}>Calculating financials...</div>
            ) : (
                <>
                    <ProfitSummary data={summaryData} />
                    <ProfitCharts />

                    <div style={{ marginTop: '40px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        <p>ℹ️ Calculations include realtime Sales Revenue, Procurement Costs, and Operational Expenses.</p>
                    </div>
                </>
            )}

        </div>
    );
};

export default ProfitLoss;
