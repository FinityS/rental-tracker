'use server';

import prisma from './prisma';
import path from 'path';

// --- Rentals ---

export async function getRentals() {
    try {
        const rentals = await prisma.rental.findMany({
            include: {
                tolls: true,
                tickets: true
            },
            orderBy: {
                startDate: 'desc'
            }
        });

        // Transform for frontend compatibility if needed
        return rentals.map(r => ({
            ...r,
            totalTolls: r.tolls.reduce((sum, t) => sum + t.amount, 0),
            totalTickets: r.tickets.reduce((sum, t) => sum + t.amount, 0),
            startDate: r.startDate.toISOString(),
            endDate: r.endDate.toISOString(),
            createdAt: r.createdAt.toISOString()
        }));
    } catch (error) {
        console.error("Failed to get rentals:", error);
        return [];
    }
}

export async function getRental(id) {
    const rental = await prisma.rental.findUnique({
        where: { id },
        include: { tolls: true, tickets: true }
    });

    if (!rental) return null;

    return {
        ...rental,
        totalTolls: rental.tolls.reduce((sum, t) => sum + t.amount, 0),
        totalTickets: rental.tickets.reduce((sum, t) => sum + t.amount, 0),
        startDate: rental.startDate.toISOString(),
        endDate: rental.endDate.toISOString(),
        createdAt: rental.createdAt.toISOString()
    };
}

export async function addRental(rentalData) {
    console.log("[addRental] START. Data:", JSON.stringify(rentalData, null, 2));

    try {
        // 1. Create the rental
        console.log("[addRental] Creating Prisma record...");
        const newRental = await prisma.rental.create({
            data: {
                renterName: rentalData.renterName,
                carModel: rentalData.carModel,
                startDate: new Date(rentalData.startDate),
                endDate: new Date(rentalData.endDate),
                amount: Number(rentalData.amount),
                status: 'active',
                totalPaid: 0
            }
        });
        console.log("[addRental] Created Rental ID:", newRental.id);

        // 2. Process Unmatched Tolls (Retroactive matching)
        const unmatchedTolls = await prisma.toll.findMany({
            where: { status: 'Unmatched' }
        });

        const start = new Date(rentalData.startDate);
        const end = new Date(rentalData.endDate);

        const tollsToLink = unmatchedTolls.filter(toll => {
            const tollDate = new Date(toll.transactionDate);
            return tollDate >= start && tollDate <= end;
        });

        if (tollsToLink.length > 0) {
            console.log(`[addRental] Linking ${tollsToLink.length} tolls...`);
            await prisma.toll.updateMany({
                where: {
                    id: { in: tollsToLink.map(t => t.id) }
                },
                data: {
                    status: 'Matched',
                    rentalId: newRental.id,
                }
            });
        }

        return getRental(newRental.id);
    } catch (error) {
        console.error("[addRental] FATAL ERROR:", error);
        return { error: error.message || "Unknown server error" };
    }
}

export async function updateRental(rentalId, updates) {
    await prisma.rental.update({
        where: { id: rentalId },
        data: updates
    });
    return getRental(rentalId);
}

export async function deleteRental(rentalId) {
    // Cascade delete handles tickets, but for Tolls setNull is configured.
    // However, if we delete a rental, its tolls should probably revert to Unmatched or be deleted?
    // User requirement: "delete individual tolls from rental" -> implies tolls are distinct entities.
    // Usually if a rental is deleted, we might want to keep tolls as Unmatched or delete them.
    // Let's assume we delete them if they are linked, or we can follow the schema behavior.

    // Schema says: Toll -> SetNull on delete.
    // So tolls become unmatched (orphan). We should mark them as Unmatched.

    await prisma.toll.updateMany({
        where: { rentalId: rentalId },
        data: { status: 'Unmatched' }
    });

    await prisma.rental.delete({
        where: { id: rentalId }
    });
    return true;
}

export async function archiveRental(rentalId) {
    const rental = await getRental(rentalId);
    if (!rental) throw new Error('Rental not found');

    const totalDebt = rental.amount + rental.totalTolls + (rental.totalTickets || 0);

    await prisma.rental.update({
        where: { id: rentalId },
        data: {
            status: 'archived',
            totalPaid: totalDebt
        }
    });

    return getRental(rentalId);
}

export async function archiveStatement(renterName) {
    const rentals = await prisma.rental.findMany({
        where: {
            renterName: renterName,
            status: { not: 'archived' }
        },
        include: { tolls: true, tickets: true }
    });

    for (const rental of rentals) {
        const totalTolls = rental.tolls.reduce((sum, t) => sum + t.amount, 0);
        const totalTickets = rental.tickets.reduce((sum, t) => sum + t.amount, 0);
        const totalDebt = rental.amount + totalTolls + totalTickets;

        await prisma.rental.update({
            where: { id: rental.id },
            data: {
                status: 'archived',
                totalPaid: totalDebt
            }
        });
    }
    return true;
}

// --- Tolls ---

export async function getAllTolls() {
    const tolls = await prisma.toll.findMany({
        orderBy: { transactionDate: 'desc' },
        include: { rental: true }
    });

    return tolls.map(t => ({
        ...t,
        Amount: t.amount, // Maintain compatibility
        'Transaction Date': t.transactionDate.toISOString(),
        'Location': t.location,
        'Plate': t.plate,
        'Lane Txn ID': t.laneTxnId,
        renterName: t.rental?.renterName || null
    }));
}

export async function addToll(rentalId, tollData) {
    await prisma.toll.create({
        data: {
            amount: Number(tollData.Amount),
            transactionDate: new Date(tollData['Transaction Date']),
            location: tollData.Location,
            plate: tollData.Plate,
            laneTxnId: tollData['Lane Txn ID'] || `manual_${Date.now()}`,
            status: 'Matched',
            rentalId: rentalId
        }
    });
    return true;
}

export async function updateToll(rentalId, tollId, updatedData) {
    // Only used for manual edits if needed
    console.warn("updateToll not fully implemented for Prisma yet");
    return true;
}

export async function deleteToll(tollId, rentalId) {
    // Check if it's a real ID or Lane Txn ID
    // Try to find by ID first
    let toll = await prisma.toll.findUnique({ where: { id: tollId } });

    if (!toll) {
        // Try finding by laneTxnId if not found (legacy support)
        toll = await prisma.toll.findFirst({ where: { laneTxnId: tollId } });
    }

    if (toll) {
        await prisma.toll.delete({ where: { id: toll.id } });
    }
    return true;
}

export async function addTollsToRentals(rentalUpdates) {
    // rentalUpdates is { rentalId: { tolls: [] } }

    for (const [rentalId, data] of Object.entries(rentalUpdates)) {
        const tolls = data.tolls || [];

        for (const toll of tolls) {
            // Check for duplicate locally
            const exists = await prisma.toll.findFirst({
                where: { laneTxnId: toll['Lane Txn ID'] }
            });

            if (!exists) {
                await prisma.toll.create({
                    data: {
                        amount: Number(toll.Amount),
                        transactionDate: new Date(toll['Transaction Date']),
                        location: toll.Location,
                        plate: toll.Plate,
                        laneTxnId: toll['Lane Txn ID'],
                        status: 'Matched',
                        rentalId: rentalId
                    }
                });
            }
        }
    }
    return true;
}

export async function addUnmatchedTolls(tolls) {
    for (const toll of tolls) {
        const exists = await prisma.toll.findFirst({
            where: { laneTxnId: toll['Lane Txn ID'] }
        });

        if (!exists) {
            await prisma.toll.create({
                data: {
                    amount: Number(toll.Amount),
                    transactionDate: new Date(toll['Transaction Date']),
                    location: toll.Location,
                    plate: toll.Plate,
                    laneTxnId: toll['Lane Txn ID'],
                    status: 'Unmatched'
                }
            });
        }
    }
    return true;
}

export async function getUnmatchedTolls() {
    const tolls = await prisma.toll.findMany({
        where: { status: 'Unmatched' },
        orderBy: { transactionDate: 'desc' }
    });

    return tolls.map(t => ({
        ...t,
        Amount: t.amount,
        'Transaction Date': t.transactionDate.toISOString(),
        'Location': t.location,
        'Plate': t.plate,
        'Lane Txn ID': t.laneTxnId
    }));
}

export async function deleteAllTolls() {
    await prisma.toll.deleteMany({});
    return true;
}

export async function clearRentalTolls(rentalId) {
    await prisma.toll.updateMany({
        where: { rentalId: rentalId },
        data: {
            status: 'Unmatched',
            rentalId: null
        }
    });
    return true;
}

// --- Tickets ---

export async function addTicket(rentalId, ticket) {
    await prisma.ticket.create({
        data: {
            amount: Number(ticket.amount),
            date: new Date(ticket.date),
            description: ticket.description,
            rentalId: rentalId
        }
    });
    return getRental(rentalId);
}

export async function deleteTicket(rentalId, ticketId) {
    // ticketId might be index from UI or real ID. 
    // If it's a string, assume generic ID. If we want index support, we need to map it.
    // The previous implementation used array index. This breaks with DB.
    // We need to update UI to pass ID. 
    // FOR NOW: Assume ticketId is actually the Ticket ID. UI needs check.

    // NOTE: UI is likely passing an index. This will break.
    // We should probably change the UI to pass ID, but for quick fix if we assume UI uses index:
    // We fetch all tickets, pick the one at index, and delete. 
    // Ideally we update UI. Let's do the "fetch and delete by index" hack for backward compat if strict ID not passed.

    // Check if ticketId looks like a CUID or UUID
    if (typeof ticketId === 'string' && ticketId.length > 10) {
        await prisma.ticket.delete({ where: { id: ticketId } });
    } else {
        // Fallback: Delete by index (risky but matches legacy)
        const tickets = await prisma.ticket.findMany({
            where: { rentalId: rentalId },
            orderBy: { date: 'asc' } // Assuming some order
        });

        if (tickets[ticketId]) {
            await prisma.ticket.delete({ where: { id: tickets[ticketId].id } });
        }
    }

    return getRental(rentalId);
}
