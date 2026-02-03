'use client';

import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { User, Receipt, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function RentersList({ rentals }) {
    const router = useRouter();

    // Aggregate data by renter (Active rentals only)
    const renters = rentals.reduce((acc, rental) => {
        if (rental.status === 'archived') return acc; // Skip archived

        const name = rental.renterName;
        if (!acc[name]) {
            acc[name] = {
                name,
                count: 0,
                totalRental: 0,
                totalTolls: 0,
                totalTickets: 0,
                totalPaid: 0,
                lastRentalDate: new Date(0) // epoch
            };
        }

        const r = acc[name];
        r.count++;
        r.totalRental += Number(rental.amount) || 0;
        r.totalTolls += (rental.totalTolls || 0);
        r.totalTickets += (rental.totalTickets || 0);
        r.totalPaid += Number(rental.totalPaid) || 0;

        const rentalDate = new Date(rental.startDate);
        if (rentalDate > r.lastRentalDate) {
            r.lastRentalDate = rentalDate;
        }

        return acc;
    }, {});

    const rentersList = Object.values(renters).sort((a, b) => b.lastRentalDate - a.lastRentalDate);

    const handleMarkPaid = async (renterName) => {
        if (confirm(`Mark all active rentals for ${renterName} as paid and archive them?`)) {
            const { archiveStatement } = await import('../../lib/actions');
            await archiveStatement(renterName);
            router.refresh();
        }
    };

    if (rentersList.length === 0) return null;

    return (
        <Card className="glass border-0">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <User className="text-blue-400" />
                    Renters Summary
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-400 uppercase bg-white/5">
                            <tr>
                                <th className="p-3 rounded-l-lg">Renter</th>
                                <th className="p-3 text-center">Rentals</th>
                                <th className="p-3 text-right">Total Owed</th>
                                <th className="p-3 text-right">Paid</th>
                                <th className="p-3 text-right">Balance</th>
                                <th className="p-3 rounded-r-lg">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {rentersList.map((renter, idx) => {
                                const totalOwed = renter.totalRental + renter.totalTolls + renter.totalTickets;
                                const balance = totalOwed - renter.totalPaid;
                                const isPaid = balance <= 0.01;

                                return (
                                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                                        <td className="p-3 font-medium text-white">{renter.name}</td>
                                        <td className="p-3 text-center text-gray-400">{renter.count}</td>
                                        <td className="p-3 text-right text-gray-300">
                                            ${totalOwed.toFixed(2)}
                                        </td>
                                        <td className="p-3 text-right text-green-400/80">
                                            ${renter.totalPaid.toFixed(2)}
                                        </td>
                                        <td className={`p-3 text-right font-bold ${isPaid ? 'text-green-400' : 'text-orange-400'}`}>
                                            ${balance.toFixed(2)}
                                        </td>
                                        <td className="p-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/renters/${encodeURIComponent(renter.name)}`}
                                                    className="inline-flex items-center gap-1 text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded hover:bg-blue-600/40 transition-colors"
                                                >
                                                    <Receipt size={12} /> Stmt
                                                </Link>
                                                {!isPaid && (
                                                    <button
                                                        onClick={() => handleMarkPaid(renter.name)}
                                                        className="inline-flex items-center gap-1 text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded hover:bg-green-500/40 transition-colors"
                                                        title="Mark Statement Paid & Archive"
                                                    >
                                                        <CheckCircle size={12} /> Paid
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}
