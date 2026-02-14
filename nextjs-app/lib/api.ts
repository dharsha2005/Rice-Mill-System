import {
    LoginResponse,
    Procurement,
    Milling,
    Sales,
    Inventory,
    Expense,
    Payment,
    RiceVariety,
    User,
    Permissions,
    Alert,
    AuditLog,
    DashboardMetrics
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Helper to get auth token
function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('token');
    return (token && token !== 'undefined' && token !== 'null') ? token : null;
}

// Generic fetch wrapper
async function fetchAPI<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getAuthToken();

    const headers = new Headers(options.headers);

    // Set default headers if not present
    if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
    }

    const data = await response.json();
    
    // Handle different response structures
    // Some APIs return { data: [...] } or { receivables: [...] }
    if (data && typeof data === 'object') {
        // Check for common wrapper properties
        if ('data' in data && Array.isArray(data.data)) {
            return data.data as T;
        }
        if ('receivables' in data && Array.isArray(data.receivables)) {
            return data.receivables as T;
        }
        if ('payables' in data && Array.isArray(data.payables)) {
            return data.payables as T;
        }
    }
    
    return data as T;
}

// Authentication
export async function loginUser(credentials: { username: string; password: string }): Promise<LoginResponse> {
    return fetchAPI<LoginResponse>('/api/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });
}

// Procurement
export async function getProcurements(): Promise<Procurement[]> {
    return fetchAPI<Procurement[]>('/api/procurement');
}

export async function createProcurement(data: Partial<Procurement>): Promise<Procurement> {
    return fetchAPI<Procurement>('/api/procurement', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

// Dashboard
export async function getDashboardMetrics(): Promise<{
    metrics: { totalPaddyStock: number; finishedRiceStock: number; todayCost: number; netProfit: number; avgEfficiency: number };
    chartData: { month: string; purchases: number; sales: number }[];
}> {
    return fetchAPI('/api/dashboard/metrics');
}

// Milling
export async function getMillingHistory(): Promise<Milling[]> {
    return fetchAPI<Milling[]>('/api/milling');
}

export async function createMillingEntry(data: Partial<Milling>): Promise<Milling> {
    return fetchAPI<Milling>('/api/milling', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

// Sales
export async function getSales(): Promise<Sales[]> {
    return fetchAPI<Sales[]>('/api/sales');
}

export async function createSale(data: Partial<Sales>): Promise<Sales> {
    return fetchAPI<Sales>('/api/sales', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

// Inventory
export async function getInventory(): Promise<Inventory[]> {
    return fetchAPI<Inventory[]>('/api/inventory');
}

export async function adjustInventory(data: { id: string, adjustment: number, reason: string }): Promise<Inventory> {
    return fetchAPI<Inventory>('/api/inventory/adjust', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

// Expenses
export async function getExpenses(): Promise<Expense[]> {
    return fetchAPI<Expense[]>('/api/expenses');
}

export async function createExpense(data: Partial<Expense>): Promise<Expense> {
    return fetchAPI<Expense>('/api/expenses', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function getExpenseSummary(): Promise<{ total: number, byCategory: Record<string, number> }> {
    return fetchAPI<{ total: number, byCategory: Record<string, number> }>('/api/expenses/summary');
}

// Profit & Loss
export async function getProfitSummary(): Promise<{ totalRevenue: number; totalCost: number; totalExpenses: number; netProfit: number; grossProfit?: number; profitMargin?: string }> {
    return fetchAPI('/api/profit-loss/summary');
}

export async function getProfitTrend(): Promise<{ month: string; profit: number; revenue?: number; cost?: number; expenses?: number }[]> {
    return fetchAPI('/api/profit-loss/trend');
}

// Payments
export async function recordPayment(data: Partial<Payment>): Promise<Payment> {
    return fetchAPI<Payment>('/api/payments', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function getReceivables(): Promise<Payment[]> {
    return fetchAPI<Payment[]>('/api/payments/receivables');
}

export async function getPayables(): Promise<Payment[]> {
    return fetchAPI<Payment[]>('/api/payments/payables');
}

export async function getCashFlowSummary(): Promise<{ cashInflow: number; cashOutflow: number; netCashFlow: number }> {
    return fetchAPI<{ cashInflow: number; cashOutflow: number; netCashFlow: number }>('/api/payments/summary');
}

// Reports
export async function getSalesReport(startDate?: string, endDate?: string): Promise<Sales[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return fetchAPI<Sales[]>(`/api/reports/sales?${params.toString()}`);
}

export async function getExpenseReport(startDate?: string, endDate?: string): Promise<Expense[]> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return fetchAPI<Expense[]>(`/api/reports/expenses?${params.toString()}`);
}

export async function getStockReport(): Promise<Inventory[]> {
    return fetchAPI<Inventory[]>('/api/reports/stock');
}

export async function getPLReport(startDate?: string, endDate?: string): Promise<{ summary: { totalRevenue: number, totalExpenses: number, netProfit: number }, revenue: unknown[], expenses: unknown[] }> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return fetchAPI<{ summary: { totalRevenue: number, totalExpenses: number, netProfit: number }, revenue: unknown[], expenses: unknown[] }>(`/api/reports/profit-loss?${params.toString()}`);
}

// Users
export async function getUsers(): Promise<User[]> {
    return fetchAPI<User[]>('/api/users');
}

export async function createUser(data: Partial<User>): Promise<User> {
    return fetchAPI<User>('/api/users', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function toggleUserStatus(userId: string): Promise<User> {
    return fetchAPI<User>(`/api/users/${userId}/status`, {
        method: 'PATCH',
    });
}

// Roles
export async function getRoles(): Promise<{ role: string, permissions: Permissions }[]> {
    return fetchAPI<{ role: string, permissions: Permissions }[]>('/api/roles');
}

export async function updateRolePermissions(data: { role: string, permissions: Permissions }): Promise<{ success: boolean }> {
    return fetchAPI<{ success: boolean }>('/api/roles/permissions', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function seedRoles(): Promise<{ message: string }> {
    return fetchAPI<{ message: string }>('/api/roles/seed', {
        method: 'POST',
    });
}

// Alerts
export async function getAlerts(): Promise<Alert[]> {
    return fetchAPI<Alert[]>('/api/alerts');
}

export async function resolveAlert(alertId: string): Promise<Alert> {
    return fetchAPI<Alert>(`/api/alerts/${alertId}/resolve`, {
        method: 'POST',
    });
}

// Varieties
export async function getVarieties(): Promise<RiceVariety[]> {
    return fetchAPI<RiceVariety[]>('/api/varieties');
}

export async function createVariety(data: { name: string }): Promise<RiceVariety> {
    return fetchAPI<RiceVariety>('/api/varieties', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

export async function deleteVariety(varietyId: string): Promise<void> {
    return fetchAPI<void>(`/api/varieties/${varietyId}`, {
        method: 'DELETE',
    });
}

// Audit Logs
export async function getAuditLogs(filters?: {
    module?: string;
    action?: string;
    user_name?: string;
    startDate?: string;
    endDate?: string;
}): Promise<AuditLog[]> {
    const params = new URLSearchParams();
    if (filters?.module) params.append('module', filters.module);
    if (filters?.action) params.append('action', filters.action);
    if (filters?.user_name) params.append('user_name', filters.user_name);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    return fetchAPI<AuditLog[]>(`/api/audit/logs?${params.toString()}`);
}
