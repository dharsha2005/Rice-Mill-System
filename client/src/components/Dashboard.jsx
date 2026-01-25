import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { DollarSign, Package, TrendingUp, AlertCircle, Wheat } from 'lucide-react';
import { fetchDashboardMetrics } from '../services/api';
import AlertsWidget from './AlertsWidget';
import '../styles/global.css';

const KPICard = ({ title, value, subtext, icon: Icon, color }) => (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '4px' }}>{title}</p>
                <h3 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</h3>
            </div>
            <div style={{
                padding: '12px',
                borderRadius: '50%',
                background: `rgba(${color}, 0.15)`,
                color: `rgb(${color})`
            }}>
                <Icon size={24} />
            </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <TrendingUp size={14} style={{ color: 'var(--accent-green)', marginRight: '4px' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{subtext}</span>
        </div>
        {/* Decorative blur */}
        <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '150px',
            height: '150px',
            background: `rgba(${color}, 0.1)`,
            borderRadius: '50%',
            filter: 'blur(40px)'
        }} />
    </div>
);

const Dashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const data = await fetchDashboardMetrics();
            setMetrics(data.metrics);
            setChartData(data.chartData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ color: '#fff', padding: '2rem' }}>Loading Dashboard...</div>;

    return (
        <div className="dashboard-container">
            <header style={{ marginBottom: '32px' }}>
                <h1>Executive Dashboard</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Rice Mill Overview & Performance</p>
            </header>

            {/* Alerts Section */}
            <AlertsWidget />

            {/* KPI Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                <KPICard
                    title="Total Paddy Stock"
                    value={`${metrics?.totalPaddyStock || 0} T`}
                    subtext="Raw material available"
                    icon={Package}
                    color="251, 191, 36" // Gold
                />
                <KPICard
                    title="Finished Rice"
                    value={`${(metrics?.finishedRiceStock || 0).toFixed(1)} T`}
                    subtext="Ready for sale"
                    icon={Wheat}
                    color="16, 185, 129" // Green
                />
                <KPICard
                    title="Daily Cost"
                    value={`₹${(metrics?.todayCost || 0).toLocaleString()}`}
                    subtext="Procurement cost today"
                    icon={DollarSign}
                    color="239, 68, 68" // Red
                />
                <KPICard
                    title="Net Profit"
                    value={`₹${(metrics?.netProfit || 0).toLocaleString()}`}
                    subtext="Sales - Expenses"
                    icon={TrendingUp}
                    color="59, 130, 246" // Blue
                />
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>

                {/* Main Chart */}
                <div className="glass-panel" style={{ padding: '24px', minHeight: '400px' }}>
                    <h3 style={{ marginBottom: '24px' }}>Cash Flow Analysis</h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorPurchase" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" stroke="#94a3b8" />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#181b21', borderColor: '#333', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Legend />
                            <Area type="monotone" dataKey="Sales" stroke="#10b981" fillOpacity={1} fill="url(#colorSales)" />
                            <Area type="monotone" dataKey="Purchase" stroke="#ef4444" fillOpacity={1} fill="url(#colorPurchase)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Secondary Chart / Notices */}
                <div className="glass-panel" style={{ padding: '24px' }}>
                    <h3 style={{ marginBottom: '24px' }}>Efficiency</h3>
                    <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {/* Real Efficiency Ring */}
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                                {metrics?.avgEfficiency ? metrics.avgEfficiency.toFixed(1) : '0'}%
                            </div>
                            <div style={{ color: 'var(--text-secondary)' }}>Avg. Milling Efficiency</div>
                        </div>
                    </div>
                    <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '20px', paddingTop: '20px' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                            <AlertCircle size={18} color="orange" />
                            <span style={{ fontSize: '0.9rem' }}>Moisture levels high in Lot A</span>
                        </div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <AlertCircle size={18} color="#10b981" />
                            <span style={{ fontSize: '0.9rem' }}>Storage capacity optimal</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};


export default Dashboard;
