
const fs = require('fs').promises;
const path = require('path');

const RENTALS_FILE = path.join(process.cwd(), 'app', 'data', 'rentals.json');
const UNMATCHED_FILE = path.join(process.cwd(), 'app', 'data', 'unmatched_tolls.json');

async function clearTolls() {
    try {
        // 1. Clear matched tolls from rentals
        console.log('Reading rentals...');
        try {
            const rentalsData = await fs.readFile(RENTALS_FILE, 'utf-8');
            const rentals = JSON.parse(rentalsData);

            const updatedRentals = rentals.map(rental => ({
                ...rental,
                tolls: [],
                totalTolls: 0
            }));

            await fs.writeFile(RENTALS_FILE, JSON.stringify(updatedRentals, null, 2));
            console.log(`Cleared tolls from ${rentals.length} rentals.`);
        } catch (e) {
            console.log('No rentals file found or error reading it, skipping...');
        }

        // 2. Clear unmatched tolls file
        console.log('Clearing unmatched tolls...');
        await fs.writeFile(UNMATCHED_FILE, JSON.stringify([]));
        console.log('Unmatched tolls cleared.');

        console.log('SUCCESS: All tolls deleted.');
    } catch (e) {
        console.error('ERROR:', e);
    }
}

clearTolls();
