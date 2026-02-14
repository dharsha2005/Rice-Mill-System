const express = require('express');
const router = express.Router();
const procurementController = require('../controllers/procurementController');
const millingController = require('../controllers/millingController');
const authController = require('../controllers/authController');
const inventoryController = require('../controllers/inventoryController');
const salesController = require('../controllers/salesController');
const expenseController = require('../controllers/expenseController');
const profitController = require('../controllers/profitController');
const paymentController = require('../controllers/paymentController');
const reportsController = require('../controllers/reportsController');
const userController = require('../controllers/userController');
const roleController = require('../controllers/roleController');
const alertController = require('../controllers/alertController');
const varietyController = require('../controllers/varietyController');
const auditController = require('../controllers/auditController');

// Auth Routes
router.post('/login', authController.login);

// Sales Routes
router.post('/sales', salesController.createSale);
router.get('/sales', salesController.getAllSales);

// Inventory Routes
router.get('/inventory', inventoryController.getStockOverview);
router.post('/inventory/adjust', inventoryController.adjustStock);

// Milling Routes
router.post('/milling', millingController.createMillingEntry);
router.get('/milling', millingController.getMillingHistory);

// Procurement Routes
router.post('/procurement', procurementController.createProcurement);
router.get('/procurement', procurementController.getAllProcurements);
router.get('/dashboard/metrics', procurementController.getDashboardMetrics);

// Expense Routes
router.post('/expenses', expenseController.addExpense);
router.get('/expenses', expenseController.getExpenses);
router.get('/expenses/summary', expenseController.getExpenseSummary);

// Profit & Loss Routes
router.get('/profit-loss/summary', profitController.getProfitSummary);
router.get('/profit-loss/trend', profitController.getProfitTrend);

// Payment & Accounts Routes
router.post('/payments', paymentController.recordPayment);
router.get('/payments/receivables', paymentController.getReceivables);
router.get('/payments/payables', paymentController.getPayables);
router.get('/payments/summary', paymentController.getCashFlowSummary);

// Reports Routes
router.get('/reports/sales', reportsController.getSalesReport);
router.get('/reports/expenses', reportsController.getExpenseReport);
router.get('/reports/stock', reportsController.getStockReport);
router.get('/reports/profit-loss', reportsController.getPLReport);

// RBAC Routes
router.get('/users', userController.getUsers);
router.post('/users', userController.createUser);
router.patch('/users/:id/status', userController.toggleUserStatus);

router.get('/roles', roleController.getRoles);
router.post('/roles/permissions', roleController.updateRolePermissions);
router.post('/roles/seed', roleController.seedRoles);

// Alert Routes
router.get('/alerts', alertController.getAlerts);
router.post('/alerts/:id/resolve', alertController.resolveAlert);

// Master Data Routes
router.get('/varieties', varietyController.getVarieties);
router.post('/varieties', varietyController.addVariety);
router.delete('/varieties/:id', varietyController.deleteVariety);

// Audit Routes
router.get('/audit/logs', auditController.getLogs);

module.exports = router;
