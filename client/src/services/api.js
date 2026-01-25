const API_BASE_URL = '/api';

export const loginUser = async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });
    if (!response.ok) throw new Error('Login failed');
    return response.json();
};

export const fetchDashboardMetrics = async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard/metrics`);
    if (!response.ok) throw new Error('Failed to fetch metrics');
    return response.json();
};

export const fetchProcurements = async () => {
    const response = await fetch(`${API_BASE_URL}/procurement`);
    if (!response.ok) throw new Error('Failed to fetch procurements');
    return response.json();
};

export const createProcurement = async (data) => {
    const response = await fetch(`${API_BASE_URL}/procurement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create procurement');
    return response.json();
};

export const createMillingEntry = async (data) => {
    const response = await fetch(`${API_BASE_URL}/milling`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Failed to create milling entry');
    return response.json();
};

export const fetchMillingHistory = async () => {
    const response = await fetch(`${API_BASE_URL}/milling`);
    if (!response.ok) throw new Error('Failed to fetch milling history');
    return response.json();
};

export const fetchInventory = async () => {
    const response = await fetch(`${API_BASE_URL}/inventory`);
    if (!response.ok) throw new Error('Failed to fetch inventory');
    return response.json();
};

export const createSale = async (data) => {
    const response = await fetch(`${API_BASE_URL}/sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    // Handle specific errors like 400 (Low Stock)
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create sale');
    }
    return response.json();
};

export const fetchSales = async () => {
    const response = await fetch(`${API_BASE_URL}/sales`);
    if (!response.ok) throw new Error('Failed to fetch sales');
    return response.json();
};
