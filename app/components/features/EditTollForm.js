'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export function EditTollForm({ rentalId, toll, onClose }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Parse initial date/time for inputs
    const dateObj = new Date(toll['Transaction Date']);
    const initialDate = !isNaN(dateObj) ? dateObj.toISOString().split('T')[0] : '';
    const initialTime = !isNaN(dateObj) ? dateObj.toTimeString().slice(0, 5) : '';

    const [formData, setFormData] = useState({
        date: initialDate,
        time: initialTime,
        location: toll.Location || '',
        amount: toll.Amount || '',
        plate: toll.Plate || ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const dateStr = `${formData.date} ${formData.time}:00`;
            const updatedData = {
                'Transaction Date': dateStr,
                'Location': formData.location,
                'Amount': parseFloat(formData.amount),
                'Plate': formData.plate
            };

            const { updateToll } = await import('../../lib/actions');
            await updateToll(rentalId, toll.id, updatedData);

            router.refresh();
            if (onClose) onClose();
        } catch (error) {
            console.error('Failed to update toll:', error);
            alert('Failed to update toll');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400">Date</label>
                    <Input
                        type="date"
                        required
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400">Time</label>
                    <Input
                        type="time"
                        required
                        value={formData.time}
                        onChange={e => setFormData({ ...formData, time: e.target.value })}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-medium text-gray-400">Location / Plaza</label>
                <Input
                    required
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. GWB Upper"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400">Amount ($)</label>
                    <Input
                        type="number"
                        step="0.01"
                        required
                        value={formData.amount}
                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-medium text-gray-400">Plate (Optional)</label>
                    <Input
                        value={formData.plate}
                        onChange={e => setFormData({ ...formData, plate: e.target.value })}
                    />
                </div>
            </div>

            <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}
