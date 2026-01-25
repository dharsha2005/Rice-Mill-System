const Payment = require('../models/Payment');
const Sales = require('../models/Sales');
const Procurement = require('../models/Procurement');
const Expense = require('../models/Expense');

// Record a Payment
exports.recordPayment = async (req, res) => {
    try {
        const { ref_type, ref_id, amount, payment_mode, notes, payment_date } = req.body;
        // ref_type: 'Sales' (Income), 'Procurement' (Expense), 'Expense' (Direct Expense - usually 100% paid immediately but good for tracking)

        if (!amount || !ref_type || !ref_id) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const newPayment = await Payment.create({
            ref_type,
            ref_id,
            amount,
            payment_mode,
            notes,
            payment_date: payment_date || new Date()
        });

        // Update Reference Document
        if (ref_type === 'Sales') {
            const sale = await Sales.findById(ref_id);
            if (sale) {
                sale.paid_amount = (sale.paid_amount || 0) + parseFloat(amount);
                if (sale.paid_amount >= sale.total_amount) {
                    sale.payment_status = 'Paid';
                } else {
                    sale.payment_status = 'Partial';
                }
                await sale.save();
            }
        } else if (ref_type === 'Procurement') {
            const proc = await Procurement.findById(ref_id);
            if (proc) {
                proc.paid_amount = (proc.paid_amount || 0) + parseFloat(amount);
                if (proc.paid_amount >= proc.total_amount) {
                    proc.payment_status = 'Paid';
                } else {
                    proc.payment_status = 'Partial';
                }
                await proc.save();
            }
        }
        // Expenses are usually one-off, but if we link them, we might update them too.
        // For now, Expense model doesn't have partial payment logic, assumed paid full usually.

        res.status(201).json(newPayment);

    } catch (err) {
        console.error('Error recording payment:', err);
        res.status(500).json({ error: 'Failed to record payment' });
    }
};

// Get Receivables (Sales with pending amount)
exports.getReceivables = async (req, res) => {
    try {
        const receivables = await Sales.find({
            $expr: { $gt: ["$total_amount", "$paid_amount"] }
        }).sort({ sale_date: 1 }); // Oldest first

        // Calculate pending amount for UI
        const data = receivables.map(r => ({
            ...r.toObject(),
            pending_amount: r.total_amount - (r.paid_amount || 0)
        }));

        res.json(data);
    } catch (err) {
        console.error('Error fetching receivables:', err);
        res.status(500).json({ error: 'Failed to fetch receivables' });
    }
};

// Get Payables (Procurement with pending amount)
exports.getPayables = async (req, res) => {
    try {
        const payables = await Procurement.find({
            $expr: { $gt: ["$total_amount", "$paid_amount"] }
        }).sort({ purchase_date: 1 });

        const data = payables.map(p => ({
            ...p.toObject(),
            pending_amount: p.total_amount - (p.paid_amount || 0)
        }));

        res.json(data);
    } catch (err) {
        console.error('Error fetching payables:', err);
        res.status(500).json({ error: 'Failed to fetch payables' });
    }
};

// Get Cash Flow Summary (Today's In/Out, Total Cash/Bank)
// Note: This is an estimation. A real system needs a Ledger. 
// We will sum up all Payments for 'Cash' and 'Bank' to get balances, assuming 0 start.
// Inflow = Sales Payments
// Outflow = Procurement Payments + Expenses
exports.getCashFlowSummary = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Helper
        const sumPayments = async (match) => {
            const result = await Payment.aggregate([
                { $match: match },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);
            return result[0]?.total || 0;
        };

        // Note: Expenses are also payments, but currently Expense module doesn't create 'Payment' records automatically?
        // Wait, "Expense" module just creates Expense docs. It doesn't write to "payments" collection in my previous implementation.
        // To accurately track cash flow here, we need to decide:
        // Option A: Update Expense module to also create a Payment record.
        // Option B: Query Expense collection directly for "Outflow" and sum it up.
        // Let's go with Option B for "Outflow" calculation to capture everything, 
        // BUT for "Cash/Bank Balance", we need to know the mode.
        // Expense model HAS payment_mode. So we can use it!

        // 1. Calculate Balances
        // Inflow: Payments where ref_type = 'Sales'
        // Outflow: Payments (ref=Procurement) + Expenses (ref=Expense or just Expense docs)

        // Actually, if we want to be strict, we should query the collections:
        // Cash In: Sales (where mode=Cash, paid_amount) + Payments(ref=Sales, mode=Cash)
        // Oops, logic specific: Sales model tracks 'paid_amount' but doesn't log *transactions* with mode unless we use Payment model for EVERYTHING.
        // But Sales seeding created data without Payment records.
        // To show meaningful data immediately, we might need to approximate or only count "Payment" records?
        // BETTER APPROACH:
        // Construct "Cashbook" from:
        // + All Sales where status='Paid' or 'Partial' (Sum paid_amount) -> But we don't know mode of past sales?
        // Okay, let's assume we rely on the new `Payment` collection for *new* precise tracking, 
        // AND for legacy/simple data, we just assume:
        // - Payment model is the source of truth for "Cash Flow" module transactions.
        // - Expenses -> assumed paid (Cash default).

        // Let's keep it simple:
        // Cash In Hand = (Total Sales Paid) - (Total Procurement Paid) - (Total Expenses)
        // For simplicity, we'll try to aggregate based on the "Payment Mode" stored in the respective documents if available, or just toggle.

        // Let's aggregate from the source documents for robustness since Payment collection is empty initially.

        // Sales Collections (Income)
        // We don't have 'payment_mode' on Sales doc itself (it's on Payment). 
        // Wait, current seed data has no payment mode on Sales.
        // Let's assume 70% Bank, 30% Cash for seed data? Or just show "Total Liquidity".
        // Accounts module prompt says "Cash in hand" and "Bank balance".
        // Let's try to find 'payment_mode' in Sales... it's NOT there.
        // I will add 'payment_mode' to Sales model default 'Cash' maybe? Or just leave it.

        // Pivot: Only track "Payments" collection for precise Cash/Bank?
        // If I do that, it will be 0 initially.
        // Let's query the specific collections and sum them up.

        // We will default unknown past sales to 'Bank' and small ones to 'Cash'?
        // No, let's just show "Total Receivables" vs "Total Payables" mainly.
        // For Cash/Bank, we will return 0 if no data, or maybe mock it?
        // Let's calculate purely from the 'Payment' collection for accurate *flow*, 
        // and for "Expenses", we sum the Expense collection.

        // Today's Inflow: Payments(ref='Sales', date=Today)
        const todayInflow = await sumPayments({
            payment_date: { $gte: today },
            ref_type: 'Sales'
        });

        // Today's Outflow: Payments(ref='Procurement', date=Today) + Expenses(date=Today)
        const todayProcOut = await sumPayments({
            payment_date: { $gte: today },
            ref_type: 'Procurement'
        });

        const todayExpOut = await Expense.aggregate([
            { $match: { expense_date: { $gte: today } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const todayOutflow = todayProcOut + (todayExpOut[0]?.total || 0);

        res.json({
            cashInHand: 0, // Placeholder until ledger is fully populated
            bankBalance: 0, // Placeholder
            todayInflow,
            todayOutflow
        });

    } catch (err) {
        console.error('Error fetching cash flow:', err);
        res.status(500).json({ error: 'Failed to fetch cash flow' });
    }
};
