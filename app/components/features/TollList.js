'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { EditTollForm } from './EditTollForm';
import { useRouter } from 'next/navigation';

export function TollList({ tolls, rentalId }) {
    const [editingToll, setEditingToll] = useState(null);
    const router = useRouter();

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const handleDelete = async (tollId) => {
        if (confirm('Are you sure you want to delete this toll?')) {
            try {
                const { deleteToll } = await import('../../lib/actions');
                await deleteToll(tollId, rentalId);
                router.refresh();
            } catch (error) {
                console.error('Failed to delete toll:', error);
                alert('Failed to delete toll');
            }
        }
    };

    if (!tolls || tolls.length === 0) {
        return <p className="text-muted-foreground italic text-sm">No tolls recorded.</p>;
    }

    return (
        <>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {tolls.map((toll, idx) => (
                    <div key={idx} className="bg-gray-800/50 p-3 rounded flex justify-between items-center text-sm group hover:bg-gray-800 transition-colors">
                        <div>
                            <div className="font-medium">{toll['Location'] || 'Unknown Location'}</div>
                            <div className="text-xs text-muted-foreground">{toll['Transaction Date']}</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="font-mono">{formatCurrency(toll.Amount)}</span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => setEditingToll(toll)}
                                    className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-blue-400 transition-colors"
                                    title="Edit Toll"
                                >
                                    <Pencil size={14} />
                                </button>
                                <button
                                    onClick={() => handleDelete(toll.id)}
                                    className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"
                                    title="Delete Toll"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Modal Overlay */}
            {editingToll && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-bold mb-4">Edit Toll</h3>
                        <EditTollForm
                            rentalId={rentalId}
                            toll={editingToll}
                            onClose={() => setEditingToll(null)}
                        />
                    </div>
                </div>
            )}
        </>
    );
}
