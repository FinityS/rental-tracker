import Papa from 'papaparse';

export const parseCSV = (content) => {
    const results = Papa.parse(content, {
        header: true,
        skipEmptyLines: true,
    });

    const data = results.data.map(entry => {
        // Map to internal model for toll data
        const amountStr = entry['Amount'];
        let amount = 0;
        if (amountStr) {
            // Remove any whitespace
            const cleanStr = amountStr.trim();
            if (cleanStr.startsWith('(') && cleanStr.endsWith(')')) {
                // ($9.00) -> 9.00 (Cost/Debit)
                amount = parseFloat(cleanStr.replace(/[()$]/g, ''));
            } else {
                // $3.00 -> -3.00 (Credit)
                // If it's just a number, it's negative (credit)
                amount = -parseFloat(cleanStr.replace(/[$]/g, ''));
            }
        }

        const location = entry['Exit Plaza'] || entry['Entry Plaza'] || '';

        return {
            id: entry['Lane Txn ID'] || `toll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            'Transaction Date': `${entry['Date']} ${entry['Exit Time']}`,
            'Location': location,
            'Amount': isNaN(amount) ? 0 : amount,
            'Plate': entry['Tag/Plate #'],
            'Lane Txn ID': entry['Lane Txn ID'],
            'Agency': entry['Agency'],
            'Class': entry['Class']
        };
    }).filter(toll => toll.Location !== 'PAYMENT');

    return data;
};
