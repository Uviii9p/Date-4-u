import dbConnect from '@/lib/mongoose';
import Report from '@/models/Report';
import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// POST /api/reports - create a report
export async function POST(req) {
    try {
        await dbConnect();
        const decoded = verifyToken(req);
        if (!decoded) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { reportedUserId, reason } = await req.json();

        if (!reportedUserId || !reason) {
            return NextResponse.json({ message: 'reportedUserId and reason are required' }, { status: 400 });
        }

        const report = await Report.create({
            reporter: decoded.id.toString(),
            reportedUser: reportedUserId,
            reason
        });

        return NextResponse.json(report.toObject(), { status: 201 });
    } catch (error) {
        console.error('Report API Error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
