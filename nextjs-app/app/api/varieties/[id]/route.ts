import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import RiceVariety from '@/lib/models/RiceVariety';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectDB();

        // Soft delete
        const variety = await RiceVariety.findByIdAndUpdate(
            id,
            { is_active: false },
            { new: true }
        );

        if (!variety) {
            return NextResponse.json({ error: 'Variety not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Variety deleted successfully', variety });
    } catch (error) {
        console.error('Error deleting variety:', error);
        return NextResponse.json({ error: 'Failed to delete variety' }, { status: 500 });
    }
}
