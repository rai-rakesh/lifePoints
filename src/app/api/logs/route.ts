import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Activity from '@/models/Activity';

export async function GET() {
    await connectDB();
    try {
        const result = await Activity.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: '$points' },
                },
            },
        ]);
        const total = result.length > 0 ? result[0].total : 0;
        return NextResponse.json({ total }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch points' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    await connectDB();
    try {
        const body = await req.json();
        const { task, points } = body;

        if (!task || points === undefined) {
            return NextResponse.json({ error: 'Missing task or points' }, { status: 400 });
        }

        await Activity.create({ task, points });

        // Re-calculate total
        const result = await Activity.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: '$points' },
                },
            },
        ]);
        const total = result.length > 0 ? result[0].total : 0;

        return NextResponse.json({ total }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to save activity' }, { status: 500 });
    }
}
