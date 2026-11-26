import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Sales from '@/lib/models/Sales';
import Inventory from '@/lib/models/Inventory';
import Payment from '@/lib/models/Payment';
import { logActivity } from '@/lib/services/auditService';

export async function GET() {
    try {
        await connectDB();
        const sales = await Sales.find().sort({ sale_date: -1 });
        return NextResponse.json(sales);
    } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const body = await request.json();
        const {
            customer_name, rice_variety, grade, bag_size,
            quantity_bags, rate_per_bag, transport_charge, gst_amount, payment_status
        } = body;

        const qtyBags = Number(quantity_bags);
        const rateBag = Number(rate_per_bag);
        const bagSizeNum = Number(bag_size || 50);

        if (!customer_name || !rice_variety || !Number.isFinite(qtyBags) || qtyBags <= 0 || !Number.isFinite(rateBag) || rateBag < 0) {
            return NextResponse.json(
                { error: 'Valid customer_name, rice_variety, quantity_bags, and rate_per_bag are required' },
                { status: 400 }
            );
        }

        // Check & Update Stock
        const inventoryItem = await Inventory.findOne({
            rice_variety,
            grade: grade || 'Standard',
            bag_size: bagSizeNum
        });

        if (!inventoryItem) {
            return NextResponse.json(
                { error: `Stock not found for ${rice_variety} (${grade}, ${bagSizeNum}kg)` },
                { status: 400 }
            );
        }

        if (inventoryItem.quantity < qtyBags) {
            return NextResponse.json({
                error: `Insufficient Stock. Available: ${inventoryItem.quantity} Bags. Requested: ${qtyBags} Bags.`
            }, { status: 400 });
        }

        // Deduct Stock
        inventoryItem.quantity -= qtyBags;
        inventoryItem.updated_at = new Date();
        await inventoryItem.save();

        // Create Sale Record
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
            paid_amount: payment_status === 'Paid' ? total_amount : 0
        });

        // Auto-Record Payment if 'Paid'
        if (payment_status === 'Paid') {
            await Payment.create({
                ref_type: 'Sales',
                ref_id: newSale._id,
                amount: total_amount,
                payment_mode: 'Cash',
                notes: `Auto-generated for Invoice #${invoice_number}`,
                payment_date: new Date()
            });
        }

        // Audit Log
        await logActivity({
            req: request,
            module: 'Sales',
            action: 'CREATE',
            description: `Sold ${quantity_bags} bags of ${rice_variety} to ${customer_name}`,
            details: { invoice: invoice_number, total: total_amount }
        });

        return NextResponse.json(newSale, { status: 201 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
