const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const RENTALS_FILE = path.join(__dirname, '../app/data/rentals.json');
const UNMATCHED_TOLLS_FILE = path.join(__dirname, '../app/data/unmatched_tolls.json');

async function migrate() {
    console.log('Starting migration...');

    // 1. Migrate Rentals
    if (fs.existsSync(RENTALS_FILE)) {
        const rentalsData = JSON.parse(fs.readFileSync(RENTALS_FILE, 'utf-8'));
        console.log(`Found ${rentalsData.length} rentals.`);

        for (const r of rentalsData) {
            try {
                // Create Rental
                const createdRental = await prisma.rental.create({
                    data: {
                        id: r.id, // Preserve ID
                        renterName: r.renterName,
                        carModel: r.carModel || '',
                        startDate: new Date(r.startDate),
                        endDate: new Date(r.endDate),
                        amount: Number(r.amount),
                        status: r.status || 'active',
                        totalPaid: Number(r.totalPaid) || 0,
                        createdAt: r.createdAt ? new Date(r.createdAt) : new Date()
                    }
                });

                // Create Tolls for this rental
                if (r.tolls && r.tolls.length > 0) {
                    for (const t of r.tolls) {
                        await prisma.toll.create({
                            data: {
                                amount: Number(t.Amount),
                                transactionDate: new Date(t['Transaction Date']),
                                location: t.Location,
                                plate: t.Plate,
                                laneTxnId: t['Lane Txn ID'],
                                status: 'Matched',
                                rentalId: createdRental.id
                            }
                        });
                    }
                }

                // Create Tickets for this rental
                if (r.tickets && r.tickets.length > 0) {
                    for (const tic of r.tickets) {
                        await prisma.ticket.create({
                            data: {
                                amount: Number(tic.amount),
                                date: new Date(tic.date),
                                description: tic.description,
                                rentalId: createdRental.id
                            }
                        });
                    }
                }

                console.log(`Migrated rental: ${r.renterName}`);
            } catch (e) {
                console.error(`Failed to migrate rental ${r.id}:`, e);
            }
        }
    }

    // 2. Migrate Unmatched Tolls
    if (fs.existsSync(UNMATCHED_TOLLS_FILE)) {
        const unmatchedData = JSON.parse(fs.readFileSync(UNMATCHED_TOLLS_FILE, 'utf-8'));
        console.log(`Found ${unmatchedData.length} unmatched tolls.`);

        for (const t of unmatchedData) {
            try {
                // Check if already exists (dedup logic)
                const exists = await prisma.toll.findFirst({ where: { laneTxnId: t['Lane Txn ID'] } });
                if (!exists) {
                    await prisma.toll.create({
                        data: {
                            amount: Number(t.Amount),
                            transactionDate: new Date(t['Transaction Date']),
                            location: t.Location,
                            plate: t.Plate,
                            laneTxnId: t['Lane Txn ID'],
                            status: 'Unmatched'
                        }
                    });
                }
            } catch (e) {
                console.error(`Failed to migrate unmatched toll:`, e);
            }
        }
    }

    console.log('Migration complete.');
}

migrate()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
