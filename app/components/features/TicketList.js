'use client';

import React from 'react';
import { deleteTicket } from '../../lib/actions';
import { useRouter } from 'next/navigation';

export function TicketList({ rentalId, tickets }) {
    const router = useRouter();

    const handleDelete = async (index) => {
        if (confirm('Delete this ticket?')) {
            await deleteTicket(rentalId, index);
            router.refresh();
        }
    };

    if (!tickets || tickets.length === 0) return null;

    return (
        <div className="mt-4 pt-4 border-t border-gray-800">
            <h4 className="text-sm font-medium text-gray-400 mb-2">Tickets</h4>
            <div className="bg-gray-900/50 rounded-md p-2 max-h-40 overflow-y-auto">
                <table className="w-full text-xs text-left">
                    <thead>
                        <tr className="text-gray-500">
                            <th className="pb-1">Date</th>
                            <th className="pb-1">Type</th>
                            <th className="pb-1">Location</th>
                            <th className="pb-1 text-right">Amount</th>
                            <th className="pb-1 w-6"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map((ticket, idx) => (
                            <tr key={idx} className="border-t border-gray-800/50 group">
                                <td className="py-1 text-gray-300">
                                    {new Date(ticket.timestamp).toLocaleDateString()}
                                </td>
                                <td className="py-1 text-gray-300">{ticket.type}</td>
                                <td className="py-1 text-gray-300">{ticket.location}</td>
                                <td className="py-1 text-right font-medium text-red-400">
                                    ${Number(ticket.amount).toFixed(2)}
                                </td>
                                <td className="py-1 text-right">
                                    <button
                                        onClick={() => handleDelete(idx)}
                                        className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Delete Ticket"
                                    >
                                        ×
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
