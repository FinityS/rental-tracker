
const parseCSV = (content) => {
    const lines = content.split('\n');
    // Handle potential empty lines at end
    const nonEmptyLines = lines.filter(line => line.trim() !== '');
    const headers = nonEmptyLines[0].split(',').map(h => h.trim());

    console.log('Headers:', headers);

    const data = nonEmptyLines.slice(1).map(line => {
        // Simple split by comma
        const values = line.split(',');
        const entry = {};
        headers.forEach((header, index) => {
            entry[header] = values[index]?.trim();
        });

        // Map to internal model for toll data
        const amountStr = entry['Amount'];
        console.log(`Processing amountStr: "${amountStr}"`);
        let amount = 0;
        if (amountStr) {
            if (amountStr.startsWith('(') && amountStr.endsWith(')')) {
                // ($9.00) -> 9.00 (Cost - renter owes this)
                console.log('Detected negative format (...)');
                amount = parseFloat(amountStr.replace(/[()$]/g, ''));
            } else {
                // $3.00 -> -3.00 (Credit - subtract from total)
                console.log('Detected standard format');
                amount = -parseFloat(amountStr.replace(/[$]/g, ''));
            }
        }
        console.log(`Parsed amount: ${amount}`);

        return {
            id: entry['Lane Txn ID'] || `toll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            'Transaction Date': `${entry['Date']} ${entry['Exit Time']}`,
            'Location': entry['Exit Plaza'] || entry['Entry Plaza'] || '',
            'Amount': amount,
            'Plate': entry['Tag/Plate #'],
            'Lane Txn ID': entry['Lane Txn ID'],
            'Agency': entry['Agency'],
            'Class': entry['Class']
        };
    });

    return data;
};

const sampleCSV = `Lane Txn ID,Tag/Plate #,Agency,Entry Plaza,Exit Plaza,Class,Date,Exit Time,Amount
33068397029,PA LLX1794,CBDTP,,CRZ,1,11/19/2025,2:44:33 PM,($9.00)
33049494683,PA LLX1794,,,CRZ,1,11/13/2025,1:23:29 PM,$3.00`;

const result = parseCSV(sampleCSV);
console.log('Result:', JSON.stringify(result, null, 2));
