'use client';

import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { addTicket } from '../../lib/actions';
import { useRouter } from 'next/navigation';

export function TicketForm({ rentalId, onCancel }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        time: '12:00',
        type: 'Parking',
        location: '',
        amount: '',
        description: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const ticketData = {
                date: formData.date,
                time: formData.time,
                type: formData.type,
                location: formData.location,
                amount: parseFloat(formData.amount),
                description: formData.description,
                reason: formData.type // Backend uses 'reason' in some places, 'type' in others? standardized to TicketList view
            };

            await addTicket(rentalId, ticketData);

            // Reset form
            setFormData({
                date: new Date().toISOString().split('T')[0],
                time: '12:00',
                type: 'Parking',
                location: '',
                amount: '',
                description: ''
            });

            router.refresh();
            if (onCancel) onCancel();
        } catch (error) {
            console.error('Failed to add ticket', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-900/50 p-4 rounded-lg border border-gray-800">
            <h4 className="text-sm font-medium text-white">Add Ticket</h4>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium mb-1 block text-white">Date</label>
                    <Input
                        name="date"
                        type="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label className="text-sm font-medium mb-1 block text-white">Time</label>
                    <Input
                        name="time"
                        type="time"
                        value={formData.time}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-sm font-medium mb-1 block text-white">Type</label>
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-gray-950 border-gray-800 text-white"
                    >
                        <option value="Parking">Parking</option>
                        <option value="Speeding">Speeding</option>
                        <option value="Red Light">Red Light</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div>
                    <label className="text-sm font-medium mb-1 block text-white">Amount ($)</label>
                    <Input
                        name="amount"
                        type="number"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>
            <div>
                <label className="text-sm font-medium mb-1 block text-white">Location</label>
                <Input
                    name="location"
                    placeholder="Location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label className="text-sm font-medium mb-1 block text-white">Description</label>
                <Input
                    name="description"
                    placeholder="Description / Notes"
                    value={formData.description}
                    onChange={handleChange}
                />
            </div>
            <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={onCancel} className="text-gray-400 hover:text-white">
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Adding...' : 'Add Ticket'}
                </Button>
            </div>
        </form>
    );
}
