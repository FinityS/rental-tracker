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

        // TEST WRITE
        let writeStatus = "Skipped";
        let writeError = null;
        try {
            const testRental = await prisma.rental.create({
                data: {
                    renterName: "Debug Test",
                    startDate: new Date(),
                    endDate: new Date(),
                    amount: 1,
                    status: "archived"
                }
            });
            writeStatus = "Success: Created ID " + testRental.id;
            // Clean up
            await prisma.rental.delete({ where: { id: testRental.id } });
            writeStatus += " (and deleted)";
        } catch (e) {
            writeStatus = "Failed";
            writeError = e.message;
        }

        return NextResponse.json({
            status: 'success',
            env_var_set: url !== 'NOT_SET',
            database_url: maskedUrl,
            connection: 'OK',
            write_permission: writeStatus,
            write_error: writeError,
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
