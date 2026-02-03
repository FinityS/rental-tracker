'use client';

import { useState } from 'react';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { deleteRental, updateRental } from '../../lib/actions';
import { useRouter } from 'next/navigation';
import { TicketForm } from './TicketForm';
import { TicketList } from './TicketList';
import { TollList } from './TollList';
import { ChevronDown, ChevronUp, Edit2, Trash2, Plus, AlertCircle, CheckCircle } from 'lucide-react';

import { Archive } from 'lucide-react';

export function RentalList({ initialRentals, showArchived = false }) {
    const [rentals, setRentals] = useState(initialRentals);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [expandedId, setExpandedId] = useState(null);
    const [addingTicketId, setAddingTicketId] = useState(null);
    const router = useRouter();

    const handleArchive = async (id) => {
        if (confirm('Mark this rental as fully paid and archive it?')) {
            const { archiveRental } = await import('../../lib/actions');
            await archiveRental(id);
            setRentals(rentals.map(r => r.id === id ? { ...r, status: 'archived', totalPaid: Number(r.amount) + (r.totalTolls || 0) + (r.totalTickets || 0) } : r));
            router.refresh();
        }
    };

    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this rental?')) {
            await deleteRental(id);
            setRentals(rentals.filter(r => r.id !== id));
            router.refresh();
        }
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const startEdit = (rental) => {
        setEditingId(rental.id);
        const start = new Date(rental.startDate);
        const end = new Date(rental.endDate);

        setEditForm({
            ...rental,
            startDate: start.toISOString().split('T')[0],
            startTime: start.toTimeString().slice(0, 5),
            endDate: end.toISOString().split('T')[0],
            endTime: end.toTimeString().slice(0, 5)
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({ ...prev, [name]: value }));
    };

    const saveEdit = async () => {
        const start = new Date(`${editForm.startDate}T${editForm.startTime}`);
        const end = new Date(`${editForm.endDate}T${editForm.endTime}`);

        const updates = {
            ...editForm,
            startDate: start.toISOString(),
            endDate: end.toISOString()
        };

        await updateRental(editingId, updates);
        setRentals(rentals.map(r => r.id === editingId ? { ...r, ...updates } : r));
        setEditingId(null);
        router.refresh();
    };

    const filteredRentals = rentals
        .filter(r => showArchived ? r.status === 'archived' : r.status !== 'archived')
        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

    if (filteredRentals.length === 0) {
        return (
            <Card className="glass border-0">
                <div className="p-12 text-center text-gray-400">
                    <p className="text-lg">No {showArchived ? 'archived' : 'active'} rentals found.</p>
                    {!showArchived && <p className="text-sm mt-2">Add your first rental to get started.</p>}
                </div>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredRentals.map((rental) => {
                const totalCost = Number(rental.amount) + (rental.totalTolls || 0) + (rental.totalTickets || 0);
                const paid = Number(rental.totalPaid) || 0;
                const balance = totalCost - paid;
                const isPaid = balance <= 0.01;
                const isArchived = rental.status === 'archived';

                return (
                    <Card key={rental.id} className={`glass border-0 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:bg-white/10 flex flex-col ${expandedId === rental.id ? 'md:col-span-2 xl:col-span-3' : ''} ${isArchived ? 'opacity-75 grayscale' : ''}`}>
                        <div className="p-6 flex-1 flex flex-col">
                            {editingId === rental.id ? (
                                <div className="space-y-4 animate-fade-in">
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">Renter Name</label>
                                            <Input name="renterName" value={editForm.renterName} onChange={handleEditChange} placeholder="Renter Name" className="bg-black/20 border-white/10" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">Car Model</label>
                                            <Input name="carModel" value={editForm.carModel} onChange={handleEditChange} placeholder="Car Model" className="bg-black/20 border-white/10" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">Start Date & Time</label>
                                            <div className="grid grid-cols-1 gap-2">
                                                <Input name="startDate" type="date" value={editForm.startDate} onChange={handleEditChange} className="bg-black/20 border-white/10" />
                                                <Input name="startTime" type="time" value={editForm.startTime} onChange={handleEditChange} className="bg-black/20 border-white/10" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">End Date & Time</label>
                                            <div className="grid grid-cols-1 gap-2">
                                                <Input name="endDate" type="date" value={editForm.endDate} onChange={handleEditChange} className="bg-black/20 border-white/10" />
                                                <Input name="endTime" type="time" value={editForm.endTime} onChange={handleEditChange} className="bg-black/20 border-white/10" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">Amount ($)</label>
                                            <Input name="amount" type="number" value={editForm.amount} onChange={handleEditChange} placeholder="Amount" className="bg-black/20 border-white/10" />
                                        </div>
                                        <div className="col-span-1">
                                            <label className="text-xs text-gray-400 mb-1 block">Total Paid</label>
                                            <Input name="totalPaid" type="number" value={editForm.totalPaid || 0} onChange={handleEditChange} placeholder="Total Paid ($)" className="bg-black/20 border-white/10" />
                                        </div>

                                        {/* Toll Management in Edit Mode */}
                                        <div className="col-span-1 border-t border-white/10 pt-4 mt-2">
                                            <label className="text-xs text-gray-400 mb-2 block font-semibold flex items-center gap-2">
                                                Manage Tolls
                                            </label>
                                            <div className="bg-black/20 rounded-md p-2 max-h-[150px] overflow-y-auto">
                                                {rental.tolls && rental.tolls.length > 0 ? (
                                                    <TollList tolls={rental.tolls} rentalId={rental.id} />
                                                ) : (
                                                    <p className="text-xs text-gray-500 italic">No tolls. Add them from the details view.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex justify-end space-x-2 mt-4">
                                        <button onClick={cancelEdit} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
                                        <button onClick={saveEdit} className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">Save</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col h-full">
                                    <div className="flex justify-between items-start gap-4 mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${isPaid ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                {rental.renterName.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-white leading-tight">
                                                    <a href={`/rentals/${rental.id}`} className="hover:text-blue-400 hover:underline transition-colors">
                                                        {rental.renterName}
                                                    </a>
                                                </h3>
                                                <p className="text-xs text-gray-400">{rental.carModel}</p>
                                                <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                                                    <div>Start: <span className="text-gray-300">{new Date(rental.startDate).toLocaleDateString()} {new Date(rental.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                                                    <div>End: <span className="text-gray-300 ml-1.5">{new Date(rental.endDate).toLocaleDateString()} {new Date(rental.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            {!isArchived && (
                                                <button
                                                    onClick={() => handleArchive(rental.id)}
                                                    className="p-1.5 text-gray-400 hover:text-green-400 transition-colors hover:bg-white/5 rounded-full"
                                                    title="Mark as Paid & Archive"
                                                >
                                                    <Archive size={16} />
                                                </button>
                                            )}
                                            <button onClick={() => startEdit(rental)} className="p-1.5 text-gray-400 hover:text-blue-400 transition-colors hover:bg-white/5 rounded-full">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(rental.id)} className="p-1.5 text-gray-400 hover:text-red-400 transition-colors hover:bg-white/5 rounded-full">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-auto space-y-3">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-xs text-gray-500">Amount</p>
                                                <p className="text-2xl font-bold text-white">${Number(rental.amount).toFixed(2)}</p>

                                                {/* Summary Breakdown in Collapsed View */}
                                                <div className="flex gap-3 mt-1 text-xs">
                                                    {(rental.totalTolls > 0) && (
                                                        <span className="text-red-400">
                                                            Tolls: +${rental.totalTolls.toFixed(2)}
                                                        </span>
                                                    )}
                                                    {(rental.totalTickets > 0) && (
                                                        <span className="text-red-400">
                                                            Tickets: +${rental.totalTickets.toFixed(2)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                {isArchived ? (
                                                    <span className="px-2 py-1 rounded-md bg-gray-500/10 text-gray-400 text-xs font-medium border border-gray-500/20">ARCHIVED</span>
                                                ) : isPaid ? (
                                                    <span className="px-2 py-1 rounded-md bg-green-500/10 text-green-400 text-xs font-medium border border-green-500/20">PAID</span>
                                                ) : (
                                                    <span className="px-2 py-1 rounded-md bg-orange-500/10 text-orange-400 text-xs font-medium border border-orange-500/20">OWED</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                                            <p className="text-xs text-gray-500">
                                                {new Date(rental.startDate).toLocaleDateString()}
                                            </p>
                                            <button
                                                onClick={() => toggleExpand(rental.id)}
                                                className={`flex items-center gap-1 text-xs font-medium transition-colors ${expandedId === rental.id ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
                                            >
                                                {expandedId === rental.id ? 'Less Details' : 'More Details'}
                                                <ChevronDown size={14} className={`transition-transform duration-300 ${expandedId === rental.id ? 'rotate-180' : ''}`} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    {expandedId === rental.id && (
                                        <div className="mt-6 pt-6 border-t border-white/10 animate-slide-up">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                                <div className="bg-black/20 rounded-lg p-4 relative group">
                                                    <p className="text-xs text-gray-500 uppercase">Total Cost</p>
                                                    <p className="text-xl font-bold text-white">${totalCost.toFixed(2)}</p>
                                                    <div className="text-xs mt-1 space-y-1">
                                                        <div className="flex justify-between text-gray-400">
                                                            <span>Rental</span>
                                                            <span>${Number(rental.amount).toFixed(2)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-red-400">
                                                            <span>Tolls</span>
                                                            <span>+${(rental.totalTolls || 0).toFixed(2)}</span>
                                                        </div>
                                                        <div className="flex justify-between text-red-400">
                                                            <span>Tickets</span>
                                                            <span>+${(rental.totalTickets || 0).toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                    {(rental.totalTolls > 0) && (
                                                        <button
                                                            onClick={async () => {
                                                                if (confirm('Clear all tolls for this rental?')) {
                                                                    const { clearRentalTolls } = await import('../../lib/actions');
                                                                    await clearRentalTolls(rental.id);
                                                                    router.refresh();
                                                                }
                                                            }}
                                                            className="absolute top-2 right-2 p-1.5 bg-red-500/10 text-red-400 rounded-full hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
                                                            title="Clear Tolls"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="bg-black/20 rounded-lg p-4">
                                                    <p className="text-xs text-gray-500 uppercase mb-2">Tolls</p>
                                                    <div className="max-h-[200px] overflow-y-auto">
                                                        {rental.tolls && rental.tolls.length > 0 ? (
                                                            <TollList tolls={rental.tolls} rentalId={rental.id} />
                                                        ) : (
                                                            <p className="text-sm text-gray-400 text-center py-4">No tolls found for this rental.</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="bg-black/20 rounded-lg p-4 relative">
                                                    <p className="text-xs text-gray-500 uppercase">Payment Status</p>
                                                    <p className={`text-xl font-bold ${isPaid ? 'text-green-400' : 'text-orange-400'}`}>
                                                        {isPaid ? 'Paid in Full' : `$${balance.toFixed(2)} Due`}
                                                    </p>
                                                    <div className="text-xs mt-1 space-y-1">
                                                        <div className="flex justify-between text-gray-400">
                                                            <span>Paid So Far</span>
                                                            <span>${paid.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                    {!isArchived && (
                                                        <button
                                                            onClick={() => handleArchive(rental.id)}
                                                            className="absolute top-2 right-2 p-1.5 bg-green-500/10 text-green-400 rounded-full hover:bg-green-500/20 transition-colors"
                                                            title="Dismiss / Mark Paid"
                                                        >
                                                            <Archive size={16} />
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-center">
                                                    <button
                                                        onClick={() => setAddingTicketId(addingTicketId === rental.id ? null : rental.id)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors text-sm font-medium"
                                                    >
                                                        <Plus size={16} />
                                                        Add Ticket
                                                    </button>
                                                </div>
                                            </div>

                                            {addingTicketId === rental.id && (
                                                <div className="mb-6 bg-black/20 p-4 rounded-lg">
                                                    <TicketForm rentalId={rental.id} onCancel={() => setAddingTicketId(null)} />
                                                </div>
                                            )}

                                            <div className="space-y-6">
                                                <TicketList rentalId={rental.id} tickets={rental.tickets} />


                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
