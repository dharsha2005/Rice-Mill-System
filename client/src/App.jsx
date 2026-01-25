import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProcurementForm from './components/ProcurementForm';
import ProcurementList from './components/ProcurementList';
import MillingForm from './components/MillingForm';
import MillingList from './components/MillingList';
import Inventory from './components/Inventory';
import Sales from './components/Sales';
import Expenses from './components/Expenses';
import ProfitLoss from './components/ProfitLoss';
import Accounts from './components/Accounts';
import Reports from './components/Reports';
import Settings from './components/Settings';
import Login from './pages/Login';
import './styles/global.css';
import { Factory } from 'lucide-react'; // Icon for Milling if needed in headers

import Welcome from './pages/Welcome';

function App() {
  // Initialize state from localStorage if available
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [permissions, setPermissions] = useState(JSON.parse(localStorage.getItem('permissions')) || null);

  // If token exists, we assume welcome is seen (skip intro on refresh)
  const [welcomeSeen, setWelcomeSeen] = useState(!!localStorage.getItem('token'));

  // Persist active tab
  const [activeTab, setActiveTab] = useState(localStorage.getItem('activeTab') || 'dashboard');
  const [refreshList, setRefreshList] = useState(0);

  const handleLogin = (token, user, permissions) => {
    setToken(token);
    setUser(user);
    setPermissions(permissions || {});
    // Persist
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('permissions', JSON.stringify(permissions || {}));
    // On fresh login, showing welcome might be nice, but user asked to remain on page.
    // If it's a fresh login, they usually start at dashboard.
    setWelcomeSeen(false); // Let them see welcome on NEW login
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setPermissions(null);
    setWelcomeSeen(false);
    setActiveTab('dashboard'); // Reset tab
    // Clear persist
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('permissions');
    localStorage.removeItem('activeTab');
  };

  const handleEnterDashboard = () => {
    setWelcomeSeen(true);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('activeTab', tab);
  };

  const handleEntryAdded = () => {
    setRefreshList(prev => prev + 1);
  };

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  if (!welcomeSeen) {
    return <Welcome onEnter={handleEnterDashboard} />;
  }

  return (
    <div className="app-layout">
      {/* Sidebar needs access to logout */}
      <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} onLogout={handleLogout} permissions={permissions} />

      <main className="main-content">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.3)', padding: '8px 16px', borderRadius: '20px' }}>
            <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {user?.role}: <strong>{user?.username}</strong>
            </span>
          </div>
        </div>

        {activeTab === 'dashboard' && <Dashboard />}

        {activeTab === 'procurement' && (
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '32px' }}>
              <h1>Procurement</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Manage Paddy Purchases & Stock Entry</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
              <ProcurementForm onEntryAdded={handleEntryAdded} />
              <ProcurementList refresh={refreshList} />
            </div>
          </div>
        )}

        {/* Milling Section */}
        {activeTab === 'milling' && (
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ marginBottom: '32px' }}>
              <h1>Milling & Production</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Processing Batches, Efficiency & Output</p>
            </header>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
              <MillingForm onEntryAdded={handleEntryAdded} />
              <MillingList refresh={refreshList} />
            </div>
          </div>
        )}

        {activeTab === 'inventory' && <Inventory />}

        {activeTab === 'sales' && <Sales />}

        {activeTab === 'expenses' && <Expenses />}

        {activeTab === 'reports' && <Reports />}

        {activeTab === 'profit_loss' && <ProfitLoss />}

        {activeTab === 'accounts' && <Accounts />}

        {activeTab === 'settings' && <Settings userPermissions={permissions} />}
      </main>
    </div>
  );
}

export default App;
