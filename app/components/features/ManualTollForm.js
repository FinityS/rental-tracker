'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { addToll } from '../../lib/actions';
import { useRouter } from 'next/navigation';

export function ManualTollForm({ rentalId }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        time: '12:00',
        location: '',
        amount: '',
        plate: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const tollData = {
                'Transaction Date': `${formData.date} ${formData.time}:00`,
                'Location': formData.location,
                'Amount': parseFloat(formData.amount),
                'Plate': formData.plate,
                'Agency': 'MANUAL',
            };

            await addToll(rentalId, tollData);

            // Reset form but keep date/plate as they might be repeated
            setFormData(prev => ({
                ...prev,
                time: '12:00',
                location: '',
                amount: ''
            }));

            router.refresh();
        } catch (error) {
            console.error('Failed to add toll', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Add Manual Toll</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Date</label>
                            <Input
                                name="date"
                                type="date"
                                value={formData.date}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Time</label>
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
                            <label className="text-sm font-medium mb-1 block">Location</label>
                            <Input
                                name="location"
                                placeholder="e.g. GWB Upper"
                                value={formData.location}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Amount ($)</label>
                            <Input
                                name="amount"
                                type="number"
                                step="any"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-1 block">Plate (Optional)</label>
                        <Input
                            name="plate"
                            placeholder="License Plate"
                            value={formData.plate}
                            onChange={handleChange}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Adding...' : 'Add Toll'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
