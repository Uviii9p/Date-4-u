import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongoose';

export async function GET() {
    try {
        await dbConnect();
        return NextResponse.json({
            status: 'UP',
            storage: 'MONGODB',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        return NextResponse.json({
            status: 'ERROR',
            message: error.message,
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
