'use server';

import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'app', 'data', 'rentals.json');

async function ensureDataFile() {
    try {
        await fs.access(DATA_FILE);
    } catch {
        await fs.writeFile(DATA_FILE, JSON.stringify([]));
    }
}

export async function getRentals() {
    await ensureDataFile();
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
}

export async function getRental(id) {
    await ensureDataFile();
    const rentals = await getRentals();
    return rentals.find(r => r.id === id);
}

export async function addRental(rental) {
    await ensureDataFile();
    const rentals = await getRentals();

    // Create initial rental object
    let newRental = {
        ...rental,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        status: 'active',
        totalPaid: 0
    };

    // Check for retroactive toll matches
    newRental = await processUnmatchedTolls(newRental);

    rentals.push(newRental);
    await fs.writeFile(DATA_FILE, JSON.stringify(rentals, null, 2));
    return newRental;
}

export async function addToll(rentalId, tollData) {
    await ensureDataFile();
    const rentals = await getRentals();
    const index = rentals.findIndex(r => r.id === rentalId);
    if (index === -1) throw new Error('Rental not found');

    const rental = rentals[index];
    const newToll = {
        ...tollData,
        id: `manual_toll_${Date.now()}`,
        status: 'Matched',
        rentalId: rentalId
    };

    const newTolls = [...(rental.tolls || []), newToll];
    const totalTolls = newTolls.reduce((sum, t) => sum + (Number(t.Amount) || 0), 0);

    const updatedRental = {
        ...rental,
        tolls: newTolls,
        totalTolls
    };

    rentals[index] = updatedRental;
    await fs.writeFile(DATA_FILE, JSON.stringify(rentals, null, 2));
    return updatedRental;
}

export async function updateRental(rentalId, updates) {
    await ensureDataFile();
    const rentals = await getRentals();
    const index = rentals.findIndex(r => r.id === rentalId);
    if (index === -1) throw new Error('Rental not found');

    rentals[index] = { ...rentals[index], ...updates };
    await fs.writeFile(DATA_FILE, JSON.stringify(rentals, null, 2));
    return rentals[index];
}

export async function deleteRental(rentalId) {
    await ensureDataFile();
    const rentals = await getRentals();
    const filteredRentals = rentals.filter(r => r.id !== rentalId);
    await fs.writeFile(DATA_FILE, JSON.stringify(filteredRentals, null, 2));
    return true;
}

export async function addTollsToRentals(rentalUpdates) {
    await ensureDataFile();
    const rentals = await getRentals();

    let updated = false;
    const updatedRentals = rentals.map(rental => {
        if (rentalUpdates[rental.id]) {
            updated = true;
            const updates = rentalUpdates[rental.id];

            const existingTolls = rental.tolls || [];
            const newTollsRaw = updates.tolls || [];

            // Filter duplicates
            const uniqueNewTolls = newTollsRaw.filter(newToll => !isDuplicateToll(newToll, existingTolls));

            if (uniqueNewTolls.length === 0) return rental; // No new unique tolls for this rental

            // Recalculate added amount from unique tolls only
            const addedAmount = uniqueNewTolls.reduce((sum, t) => sum + t.Amount, 0);

            return {
                ...rental,
                tolls: [...existingTolls, ...uniqueNewTolls],
                totalTolls: (rental.totalTolls || 0) + addedAmount
            };
        }
        return rental;
    });

    if (updated) {
        await fs.writeFile(DATA_FILE, JSON.stringify(updatedRentals, null, 2));
    }
    return true;
}

export async function clearRentalTolls(rentalId) {
    await ensureDataFile();
    const rentals = await getRentals();
    const index = rentals.findIndex(r => r.id === rentalId);

    if (index !== -1) {
        rentals[index] = {
            ...rentals[index],
            tolls: [],
            totalTolls: 0
        };
        await fs.writeFile(DATA_FILE, JSON.stringify(rentals, null, 2));
    }
    return true;
}

export async function deleteAllTolls() {
    await ensureDataFile();
    const rentals = await getRentals();

    // Clear tolls from rentals
    const updatedRentals = rentals.map(rental => ({
        ...rental,
        tolls: [],
        totalTolls: 0
    }));
    await fs.writeFile(DATA_FILE, JSON.stringify(updatedRentals, null, 2));

    // Clear unmatched tolls
    await ensureUnmatchedFile();
    await fs.writeFile(UNMATCHED_TOLLS_FILE, JSON.stringify([]));

    return true;
}

const UNMATCHED_TOLLS_FILE = path.join(process.cwd(), 'app', 'data', 'unmatched_tolls.json');

async function ensureUnmatchedFile() {
    try {
        await fs.access(UNMATCHED_TOLLS_FILE);
    } catch {
        await fs.writeFile(UNMATCHED_TOLLS_FILE, JSON.stringify([]));
    }
}

export async function getUnmatchedTolls() {
    await ensureUnmatchedFile();
    const data = await fs.readFile(UNMATCHED_TOLLS_FILE, 'utf-8');
    return JSON.parse(data);
}

export async function addUnmatchedTolls(tolls) {
    await ensureUnmatchedFile();
    const current = await getUnmatchedTolls();

    // Filter duplicates against existing unmatched tolls
    const uniqueNewTolls = tolls.filter(newToll => !isDuplicateToll(newToll, current));

    if (uniqueNewTolls.length === 0) return true;

    const newTolls = [...current, ...uniqueNewTolls];
    await fs.writeFile(UNMATCHED_TOLLS_FILE, JSON.stringify(newTolls, null, 2));
    return true;
}

async function processUnmatchedTolls(rental) {
    const unmatched = await getUnmatchedTolls();
    if (unmatched.length === 0) return rental;

    const start = new Date(rental.startDate);
    const end = new Date(rental.endDate);

    const matchedTolls = [];
    const remainingTolls = [];

    for (const toll of unmatched) {
        const tollDate = new Date(toll['Transaction Date']);
        if (tollDate >= start && tollDate <= end) {
            matchedTolls.push(toll);
        } else {
            remainingTolls.push(toll);
        }
    }

    if (matchedTolls.length > 0) {
        // Update unmatched file
        await fs.writeFile(UNMATCHED_TOLLS_FILE, JSON.stringify(remainingTolls, null, 2));

        // Return updated rental with new tolls
        const totalTolls = matchedTolls.reduce((sum, t) => sum + t.Amount, 0);
        return {
            ...rental,
            tolls: [...(rental.tolls || []), ...matchedTolls],
            totalTolls: (rental.totalTolls || 0) + totalTolls
        };
    }

    return rental;
}

function isDuplicateToll(newToll, existingTolls) {
    if (!newToll['Lane Txn ID']) return false; // Can't de-dupe without ID
    return existingTolls.some(t => t['Lane Txn ID'] === newToll['Lane Txn ID']);
}

export async function updateToll(rentalId, tollId, updatedData) {
    await ensureDataFile();
    const rentals = await getRentals();
    const index = rentals.findIndex(r => r.id === rentalId);
    if (index === -1) throw new Error('Rental not found');

    const rental = rentals[index];
    const tollIndex = rental.tolls.findIndex(t => t.id === tollId);
    if (tollIndex === -1) throw new Error('Toll not found');

    // Update the specific toll
    const updatedTolls = [...rental.tolls];
    updatedTolls[tollIndex] = {
        ...updatedTolls[tollIndex],
        ...updatedData
    };

    // Recalculate total
    const totalTolls = updatedTolls.reduce((sum, t) => sum + (Number(t.Amount) || 0), 0);

    const updatedRental = {
        ...rental,
        tolls: updatedTolls,
        totalTolls
    };

    rentals[index] = updatedRental;
    await fs.writeFile(DATA_FILE, JSON.stringify(rentals, null, 2));
    return updatedRental;
}

export async function addTicket(rentalId, ticket) {
    await ensureDataFile();
    const rentals = await getRentals();
    const index = rentals.findIndex(r => r.id === rentalId);
    if (index === -1) throw new Error('Rental not found');

    const rental = rentals[index];
    const tickets = rental.tickets || [];
    const newTickets = [...tickets, ticket];

    // Calculate total tickets amount
    const totalTickets = newTickets.reduce((sum, t) => sum + Number(t.amount), 0);

    rentals[index] = {
        ...rental,
        tickets: newTickets,
        totalTickets
    };

    await fs.writeFile(DATA_FILE, JSON.stringify(rentals, null, 2));
    return rentals[index];
}

export async function deleteTicket(rentalId, ticketIndex) {
    await ensureDataFile();
    const rentals = await getRentals();
    const index = rentals.findIndex(r => r.id === rentalId);
    if (index === -1) throw new Error('Rental not found');

    const rental = rentals[index];
    const tickets = rental.tickets || [];
    const newTickets = tickets.filter((_, idx) => idx !== ticketIndex);

    const totalTickets = newTickets.reduce((sum, t) => sum + Number(t.amount), 0);

    rentals[index] = {
        ...rental,
        tickets: newTickets,
        totalTickets
    };

    await fs.writeFile(DATA_FILE, JSON.stringify(rentals, null, 2));
    return rentals[index];
}

export async function getAllTolls() {
    const rentals = await getRentals();
    const unmatched = await getUnmatchedTolls();

    let allTolls = [];

    // Process matched tolls
    rentals.forEach(rental => {
        if (rental.tolls) {
            rental.tolls.forEach(toll => {
                allTolls.push({
                    ...toll,
                    status: 'Matched',
                    rentalId: rental.id,
                    renterName: rental.renterName
                });
            });
        }
    });

    // Process unmatched tolls
    unmatched.forEach(toll => {
        allTolls.push({
            ...toll,
            status: 'Unmatched'
        });
    });

    // Sort by date descending
    return allTolls.sort((a, b) => new Date(b['Transaction Date']) - new Date(a['Transaction Date']));
}

export async function deleteToll(tollId, rentalId) {
    console.log(`[deleteToll] Called with tollId: ${tollId}, rentalId: ${rentalId}`);
    if (rentalId) {
        // Delete from rental
        await ensureDataFile();
        const rentals = await getRentals();
        const index = rentals.findIndex(r => r.id === rentalId);
        console.log(`[deleteToll] Rental found: ${index !== -1}`);

        if (index !== -1) {
            const rental = rentals[index];
            const tollToDelete = rental.tolls.find(t => t.id === tollId || t['Lane Txn ID'] === tollId);
            console.log(`[deleteToll] Toll to delete found:`, tollToDelete);

            if (tollToDelete) {
                const newTolls = rental.tolls.filter(t => t.id !== tollId && t['Lane Txn ID'] !== tollId);
                const totalTolls = newTolls.reduce((sum, t) => sum + t.Amount, 0);

                rentals[index] = {
                    ...rental,
                    tolls: newTolls,
                    totalTolls
                };
                await fs.writeFile(DATA_FILE, JSON.stringify(rentals, null, 2));
                console.log(`[deleteToll] Toll deleted and file updated.`);
            } else {
                console.log(`[deleteToll] Toll NOT found in rental.`);
            }
        }
    } else {
        // ...
        await ensureUnmatchedFile();
        // ...
    }
    return true;
}

export async function archiveRental(rentalId) {
    await ensureDataFile();
    const rentals = await getRentals();
    const index = rentals.findIndex(r => r.id === rentalId);
    if (index === -1) throw new Error('Rental not found');

    const rental = rentals[index];
    const totalDebt = Number(rental.amount) + (rental.totalTolls || 0) + (rental.totalTickets || 0);

    const updatedRental = {
        ...rental,
        status: 'archived',
        totalPaid: totalDebt // Auto-mark as paid
    };

    rentals[index] = updatedRental;
    await fs.writeFile(DATA_FILE, JSON.stringify(rentals, null, 2));
    return updatedRental;
}

export async function archiveStatement(renterName) {
    await ensureDataFile();
    const rentals = await getRentals();

    let updated = false;
    const updatedRentals = rentals.map(rental => {
        // Only archive active rentals for this renter
        if (rental.renterName === renterName && rental.status !== 'archived') {
            updated = true;
            const totalDebt = Number(rental.amount) + (rental.totalTolls || 0) + (rental.totalTickets || 0);
            return {
                ...rental,
                status: 'archived',
                totalPaid: totalDebt
            };
        }
        return rental;
    });

    if (updated) {
        await fs.writeFile(DATA_FILE, JSON.stringify(updatedRentals, null, 2));
    }
    return true;
}
