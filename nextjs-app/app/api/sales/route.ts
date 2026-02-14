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

        // Check & Update Stock
        const inventoryItem = await Inventory.findOne({
            rice_variety,
            grade: grade || 'Standard',
            bag_size: bag_size || 50
        });

        if (!inventoryItem) {
            return NextResponse.json(
                { error: `Stock not found for ${rice_variety} (${grade}, ${bag_size}kg)` },
                { status: 400 }
            );
        }

        if (inventoryItem.quantity < quantity_bags) {
            return NextResponse.json({
                error: `Insufficient Stock. Available: ${inventoryItem.quantity} Bags. Requested: ${quantity_bags} Bags.`
            }, { status: 400 });
        }

        // Deduct Stock
        inventoryItem.quantity -= quantity_bags;
        inventoryItem.updated_at = new Date();
        await inventoryItem.save();

        // Create Sale Record
        const invoice_number = 'INV-' + Date.now().toString().slice(-6);
        const total_amount = (quantity_bags * rate_per_bag) + Number(transport_charge || 0) + Number(gst_amount || 0);

        const newSale = await Sales.create({
            invoice_number,
            customer_name,
            rice_variety,
            grade: grade || 'Standard',
            bag_size: bag_size || 50,
            quantity_bags,
            rate_per_bag,
            transport_charge,
            gst_amount,
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
