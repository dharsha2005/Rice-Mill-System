const Sales = require('../models/Sales');
const Inventory = require('../models/Inventory');

const auditService = require('../services/auditService');

exports.createSale = async (req, res) => {
    try {
        const {
            customer_name, rice_variety, grade, bag_size,
            quantity_bags, rate_per_bag, transport_charge, gst_amount, payment_status
        } = req.body;

        const qtyBags = Number(quantity_bags);
        const rateBag = Number(rate_per_bag);
        const bagSizeNum = Number(bag_size || 50);

        if (!customer_name || !rice_variety || !Number.isFinite(qtyBags) || qtyBags <= 0 || !Number.isFinite(rateBag) || rateBag < 0) {
            return res.status(400).json({ error: 'Valid customer_name, rice_variety, quantity_bags, and rate_per_bag are required' });
        }

        // 1. Calculate Total (Server-side validation)
        // const calculatedTotal = (quantity_bags * rate_per_bag) + (transport_charge || 0) + (gst_amount || 0);

        // 2. CHECK & UPDATE STOCK
        const inventoryItem = await Inventory.findOne({
            rice_variety,
            grade: grade || 'Standard',
            bag_size: bagSizeNum // Default fallback if not strictly enforced
        });

        if (!inventoryItem) {
            return res.status(400).json({ error: `Stock not found for ${rice_variety} (${grade}, ${bagSizeNum}kg)` });
        }

        if (inventoryItem.quantity < qtyBags) {
            return res.status(400).json({
                error: `Insufficient Stock. Available: ${inventoryItem.quantity} Bags. Requested: ${qtyBags} Bags.`
            });
        }

        // Deduct Stock
        inventoryItem.quantity -= qtyBags;
        inventoryItem.updated_at = new Date();
        await inventoryItem.save();

        // 3. Create Sale Record
        const invoice_number = 'INV-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 100).toString().padStart(2, '0');
        const total_amount = (qtyBags * rateBag) + Number(transport_charge || 0) + Number(gst_amount || 0);

        const newSale = await Sales.create({
            invoice_number,
            customer_name,
            rice_variety,
            grade: grade || 'Standard',
            bag_size: bagSizeNum,
            quantity_bags: qtyBags,
            rate_per_bag: rateBag,
            transport_charge: Number(transport_charge || 0),
            gst_amount: Number(gst_amount || 0),
            total_amount,
            payment_status,
            sale_date: new Date(),
            // If Paid immediately, set paid_amount to total, else 0
            paid_amount: payment_status === 'Paid' ? total_amount : 0
        });

        // 4. Auto-Record Payment if 'Paid'
        if (payment_status === 'Paid') {
            const Payment = require('../models/Payment'); // Lazy load or move top
            await Payment.create({
                ref_type: 'Sales',
                ref_id: newSale._id,
                amount: total_amount,
                payment_mode: 'Cash', // Default to Cash for counter sales if unspecified
                notes: `Auto-generated for Invoice #${invoice_number}`,
                payment_date: new Date()
            });
        }

        // Audit Log
        await auditService.logActivity({
            req,
            module: 'Sales',
            action: 'CREATE',
            description: `Sold ${quantity_bags} bags of ${rice_variety} to ${customer_name}`,
            details: { invoice: invoice_number, total: total_amount }
        });

        res.status(201).json(newSale);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.getAllSales = async (req, res) => {
    try {
        const sales = await Sales.find().sort({ sale_date: -1 });
        res.json(sales);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
