'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { useRouter } from 'next/navigation';

export function TollUploader({ rentals }) {
    const router = useRouter();
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setMessage('Parsing CSV...');

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const content = event.target.result;
                const { parseCSV } = await import('../../lib/utils');
                const { addTollsToRentals, addUnmatchedTolls } = await import('../../lib/actions');

                const parsedTolls = parseCSV(content);
                setMessage(`Processing ${parsedTolls.length} records...`);

                let matchedCount = 0;
                let unmatchedCount = 0;
                const rentalUpdates = {};
                const unmatchedTolls = [];

                for (const toll of parsedTolls) {
                    const tollDate = new Date(toll['Transaction Date']);

                    if (isNaN(tollDate.getTime())) continue;

                    // Find matching rental
                    const rental = rentals.find(r => {
                        const start = new Date(r.startDate);
                        const end = new Date(r.endDate);
                        return tollDate >= start && tollDate <= end;
                    });

                    if (rental) {
                        if (!rentalUpdates[rental.id]) {
                            rentalUpdates[rental.id] = { tolls: [], totalTolls: 0 };
                        }

                        rentalUpdates[rental.id].tolls.push(toll);
                        rentalUpdates[rental.id].totalTolls += toll.Amount;
                        matchedCount++;
                    } else {
                        unmatchedTolls.push(toll);
                        unmatchedCount++;
                    }
                }

                if (matchedCount > 0) {
                    await addTollsToRentals(rentalUpdates);
                }

                if (unmatchedCount > 0) {
                    await addUnmatchedTolls(unmatchedTolls);
                }

                setMessage(`Matched ${matchedCount} tolls. Saved ${unmatchedCount} unmatched tolls for future rentals.`);
                router.refresh();
            } catch (error) {
                console.error(error);
                setMessage('Error processing file');
            } finally {
                setUploading(false);
            }
        };
        reader.readAsText(file);
    };

    const handleDeleteAll = async () => {
        if (confirm('Are you sure you want to delete ALL tolls from ALL rentals? This cannot be undone.')) {
            setUploading(true);
            try {
                const { deleteAllTolls } = await import('../../lib/actions');
                await deleteAllTolls();
                setMessage('All tolls deleted successfully.');
                router.refresh();
            } catch (error) {
                console.error(error);
                setMessage('Failed to delete tolls.');
            } finally {
                setUploading(false);
            }
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Upload Tolls CSV</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4">
                    <label className="text-sm font-medium mb-1 block">Select CSV File</label>
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="block w-full text-sm text-muted-foreground
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-primary file:text-primary-foreground
              hover:file:bg-primary/90
              cursor-pointer"
                        disabled={uploading}
                    />
                    {message && <p className="text-sm text-muted-foreground">{message}</p>}

                    <div className="pt-2 border-t border-white/10 mt-2">
                        <button
                            onClick={handleDeleteAll}
                            className="text-xs text-red-400 hover:text-red-300 hover:underline"
                            disabled={uploading}
                        >
                            Delete All Tolls Data
                        </button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
