const fs = require('fs');
const path = require('path');

// Mock the parseCSV function here to test logic before modifying the actual file
// Or import it if we were using a module system that supports it easily in this script context.
// For simplicity, I'll copy the intended logic here to verify it, then move it to utils.js.

const parseCSV = (content) => {
    const lines = content.split('\n');
    // Handle potential empty lines at end
    const nonEmptyLines = lines.filter(line => line.trim() !== '');
    const headers = nonEmptyLines[0].split(',').map(h => h.trim());

    const data = nonEmptyLines.slice(1).map(line => {
        // Simple split by comma, assuming no commas in values for now based on sample
        const values = line.split(',');
        const entry = {};
        headers.forEach((header, index) => {
            entry[header] = values[index]?.trim();
        });

        // Map to internal model
        const amountStr = entry['Amount'];
        let amount = 0;
        if (amountStr) {
            if (amountStr.startsWith('(') && amountStr.endsWith(')')) {
                // ($9.00) -> 9.00 (Cost)
                amount = parseFloat(amountStr.replace(/[()$]/g, ''));
            } else {
                // $3.00 -> -3.00 (Credit)
                amount = -parseFloat(amountStr.replace(/[$]/g, ''));
            }
        }

        return {
            'Transaction Date': `${entry['Date']} ${entry['Exit Time']}`,
            'Location': entry['Exit Plaza'] || entry['Entry Plaza'],
            'Amount': amount,
            'Plate': entry['Tag/Plate #'],
            'Original': entry
        };
    });

    return data;
};

const content = fs.readFileSync(path.join(__dirname, 'sample_tolls.csv'), 'utf8');
const parsed = parseCSV(content);

console.log(JSON.stringify(parsed, null, 2));

// Assertions
const first = parsed[0];
if (first.Amount !== 9.00) console.error('FAIL: Expected 9.00, got', first.Amount);
else console.log('PASS: Cost parsing');

const credit = parsed[2];
if (credit.Amount !== -3.00) console.error('FAIL: Expected -3.00, got', credit.Amount);
else console.log('PASS: Credit parsing');
