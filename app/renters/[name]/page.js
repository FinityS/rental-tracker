
import { getRentals } from '../../lib/actions';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Link from 'next/link';
import { Download, ArrowLeft } from 'lucide-react';
import { PrintButton } from '../../components/ui/PrintButton';

// Force dynamic behavior for this page
export const dynamic = 'force-dynamic';

export default async function RenterStatementPage(props) {
    const params = await props.params;
    const decodedName = decodeURIComponent(params.name);
    const allRentals = await getRentals();
    const renterRentals = allRentals
        .filter(r => r.renterName === decodedName && r.status !== 'archived')
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate)); // Chronological for bill

    if (renterRentals.length === 0) {
        return <div className="p-8 text-center text-red-500">Renter not found.</div>;
    }

    const grandTotal = renterRentals.reduce((sum, r) =>
        sum + Number(r.amount) + (r.totalTolls || 0) + (r.totalTickets || 0), 0
    );
    const totalPaid = renterRentals.reduce((sum, r) => sum + (Number(r.totalPaid) || 0), 0);
    const balance = grandTotal - totalPaid;

    return (
        <div className="max-w-4xl mx-auto p-8 bg-white min-h-screen text-gray-900 print:p-0 font-sans">
            {/* Screen-only navigation */}
            <div className="mb-8 print:hidden flex justify-between items-center">
                <Link href="/rentals" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                    <ArrowLeft size={20} /> Back to Dashboard
                </Link>
                <PrintButton />
            </div>

            {/* Bill Header */}
            <header className="border-b-2 border-gray-800 pb-8 mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-bold uppercase tracking-tight mb-2">Statement</h1>
                    <p className="text-gray-500 text-sm">Generated on {new Date().toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold">{decodedName}</h2>
                    <p className="text-gray-600">Customer Statement</p>
                </div>
            </header>

            {/* Rentals List */}
            <div className="space-y-12">
                {renterRentals.map((rental, idx) => {
                    const rentalTotal = Number(rental.amount) + (rental.totalTolls || 0) + (rental.totalTickets || 0);

                    return (
                        <div key={idx} className="break-inside-avoid">
                            <div className="border-b border-gray-200 pb-2 mb-4 flex justify-between items-end">
                                <div>
                                    <h3 className="font-bold text-lg">Rental Period #{idx + 1}</h3>
                                    <p className="text-sm text-gray-600">
                                        {new Date(rental.startDate).toLocaleString()} — {new Date(rental.endDate).toLocaleString()}
                                    </p>
                                    <p className="text-sm font-medium mt-1">{rental.carModel}</p>
                                </div>
                                <div className="text-right">
                                    <span className="block text-xs text-gray-500 uppercase">Period Total</span>
                                    <span className="font-bold text-xl">${rentalTotal.toFixed(2)}</span>
                                    {(rental.totalTolls > 0) && (
                                        <div className="mt-1 text-sm text-red-600">
                                            <span className="mr-2">Tolls:</span>
                                            <span className="font-semibold">${rental.totalTolls.toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <table className="w-full text-sm mb-4">
                                <thead>
                                    <tr className="border-b border-gray-200 text-left text-gray-500 text-xs uppercase">
                                        <th className="py-2">Description</th>
                                        <th className="py-2">Date / Details</th>
                                        <th className="py-2 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    <tr>
                                        <td className="py-2">Base Rental Fee</td>
                                        <td className="py-2 text-gray-500">-</td>
                                        <td className="py-2 text-right font-medium">${Number(rental.amount).toFixed(2)}</td>
                                    </tr>

                                    {/* Tolls */}
                                    {rental.tolls && rental.tolls.map((toll, tIdx) => (
                                        <tr key={`toll-${tIdx}`}>
                                            <td className="py-2 text-gray-600 pl-4">Toll: {toll.Location}</td>
                                            <td className="py-2 text-gray-500">{new Date(toll['Transaction Date']).toLocaleString()}</td>
                                            <td className="py-2 text-right text-gray-600">${toll.Amount.toFixed(2)}</td>
                                        </tr>
                                    ))}

                                    {/* Tickets */}
                                    {rental.tickets && rental.tickets.map((ticket, kIdx) => (
                                        <tr key={`ticket-${kIdx}`}>
                                            <td className="py-2 text-red-600 pl-4">Ticket: {ticket.type}</td>
                                            <td className="py-2 text-gray-500">{ticket.date} @ {ticket.location}</td>
                                            <td className="py-2 text-right text-red-600">${Number(ticket.amount).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    );
                })}
            </div>

            {/* Summary Footer */}
            <div className="mt-12 pt-8 border-t-2 border-gray-800 flex justify-end">
                <div className="w-64 space-y-3">
                    <div className="flex justify-between text-gray-600">
                        <span>Total Charges</span>
                        <span>${grandTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-green-600">
                        <span>Total Paid</span>
                        <span>- ${totalPaid.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-gray-300 text-2xl font-bold">
                        <span>Balance Due</span>
                        <span>${balance.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="mt-16 text-center text-xs text-gray-400 print:mt-auto print:absolute print:bottom-8 print:w-full">
                <p>Thank you for your business!</p>
            </div>
        </div>
    );
}
