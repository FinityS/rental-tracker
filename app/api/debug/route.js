import { NextResponse } from 'next/server';
import prisma from '../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Mask the password in the connection string
        const url = process.env.STORAGE_DATABASE_URL || 'NOT_SET';
        const maskedUrl = url.replace(/:([^:@]+)@/, ':****@');

        // Attempt query
        const count = await prisma.rental.count();
        const rentals = await prisma.rental.findMany({ take: 1 });

        return NextResponse.json({
            status: 'success',
            env_var_set: url !== 'NOT_SET',
            database_url: maskedUrl,
            connection: 'OK',
            rental_count: count,
            sample: rentals[0] || 'No rentals found',
            vercel_env: process.env.VERCEL_ENV || 'unknown'
        });
    } catch (error) {
        return NextResponse.json({
            status: 'error',
            message: error.message,
            code: error.code,
            meta: error.meta,
            env_var_set: !!process.env.STORAGE_DATABASE_URL
        }, { status: 500 });
    }
}
