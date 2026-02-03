'use client';

import { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { getAllTolls, deleteToll, addUnmatchedTolls, addTollsToRentals, getRentals } from '../lib/actions';
import { parseCSV } from '../lib/utils';
import { Trash2, Upload, AlertCircle, CheckCircle } from 'lucide-react';

export default function TollsPage() {
    const [tolls, setTolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadTolls();
    }, []);

    const loadTolls = async () => {
        try {
            const data = await getAllTolls();

            // Deduplicate tolls
            const uniqueTolls = [];
            const seenIds = new Set();

            for (const toll of data) {
                // Use a unique identifier: prefer id, fallback to Lane Txn ID
                const uniqueId = toll.id || toll['Lane Txn ID'];

                if (uniqueId) {
                    if (seenIds.has(uniqueId)) continue;
                    seenIds.add(uniqueId);
                }
                uniqueTolls.push(toll);
            }

            setTolls(uniqueTolls);
        } catch (error) {
            console.error('Failed to load tolls', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (tollId, rentalId) => {
        if (confirm('Are you sure you want to delete this toll?')) {
            try {
                await deleteToll(tollId, rentalId);
                await loadTolls(); // Reload list
            } catch (error) {
                console.error('Failed to delete toll', error);
            }
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setMessage('Parsing CSV...');

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const content = event.target.result;
                const parsedTolls = parseCSV(content);
                setMessage(`Processing ${parsedTolls.length} records...`);

                // We need to fetch rentals to match against
                const rentals = await getRentals();

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

                setMessage(`Matched ${matchedCount} tolls. Saved ${unmatchedCount} unmatched tolls.`);
                await loadTolls(); // Reload list
            } catch (error) {
                console.error(error);
                setMessage('Error processing file');
            } finally {
                setUploading(false);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="space-y-6 pb-20 md:pb-0">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    Tolls Management
                </h1>
            </div>

            <Card className="glass border-0 p-6">
                <div className="flex flex-col gap-4">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
                        <Upload size={16} />
                        Upload Tolls CSV
                    </label>
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="block w-full text-sm text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-600 file:text-white
              hover:file:bg-blue-700
              cursor-pointer"
                        disabled={uploading}
                    />
                    {message && <p className="text-sm text-blue-400 animate-pulse">{message}</p>}
                </div>
            </Card>

            {/* Desktop Table View */}
            <Card className="hidden md:block glass border-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-gray-400">
                            <tr>
                                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider">Location</th>
                                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider">Plate</th>
                                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">Loading tolls...</td>
                                </tr>
                            ) : tolls.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">No tolls found. Upload a CSV to get started.</td>
                                </tr>
                            ) : (
                                tolls.map((toll, index) => (
                                    <tr key={toll.id || index} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {new Date(toll['Transaction Date']).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {toll['Location']}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {toll['Plate']}
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${toll['Amount'] < 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {toll['Amount'] < 0 ? '-' : ''}${Math.abs(toll['Amount']).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {toll.status === 'Matched' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                                    <CheckCircle size={12} />
                                                    {toll.renterName}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">
                                                    <AlertCircle size={12} />
                                                    Unmatched
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleDelete(toll.id, toll.rentalId)}
                                                className="text-gray-500 hover:text-red-400 transition-colors p-1 hover:bg-white/10 rounded-full"
                                                title="Delete Toll"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {loading ? (
                    <p className="text-center text-gray-500 py-8">Loading tolls...</p>
                ) : tolls.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No tolls found. Upload a CSV to get started.</p>
                ) : (
                    tolls.map((toll, index) => (
                        <Card key={toll.id || index} className="glass border-0 p-4">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="text-sm text-gray-400">{new Date(toll['Transaction Date']).toLocaleDateString()}</p>
                                    <p className="text-xs text-gray-500">{new Date(toll['Transaction Date']).toLocaleTimeString()}</p>
                                </div>
                                <div className={`text-lg font-bold ${toll['Amount'] < 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {toll['Amount'] < 0 ? '-' : ''}${Math.abs(toll['Amount']).toFixed(2)}
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Location</span>
                                    <span className="text-gray-300 font-medium">{toll['Location']}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Plate</span>
                                    <span className="text-gray-300 font-medium">{toll['Plate']}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-3 border-t border-white/5">
                                {toll.status === 'Matched' ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                                        <CheckCircle size={12} />
                                        {toll.renterName}
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">
                                        <AlertCircle size={12} />
                                        Unmatched
                                    </span>
                                )}
                                <button
                                    onClick={() => handleDelete(toll.id, toll.rentalId)}
                                    className="text-gray-500 hover:text-red-400 transition-colors p-2 hover:bg-white/10 rounded-full"
                                    title="Delete Toll"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
