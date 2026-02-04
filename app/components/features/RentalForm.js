'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { addRental } from '../../lib/actions';
import { useRouter } from 'next/navigation';

export function RentalForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        renterName: '',
        carModel: '',
        startDate: '',
        startTime: '12:00',
        endDate: '',
        endTime: '12:00',
        amount: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Combine date and time into ISO string
            const start = new Date(`${formData.startDate}T${formData.startTime}`);
            const end = new Date(`${formData.endDate}T${formData.endTime}`);

            const rentalData = {
                renterName: formData.renterName,
                carModel: formData.carModel,
                startDate: start.toISOString(),
                endDate: end.toISOString(),
                amount: formData.amount,
                tolls: [],
                totalTolls: 0
            };

            const result = await addRental(rentalData);

            if (result && result.error) {
                alert(`Error saving rental: ${result.error}`);
                console.error("Server reported error:", result.error);
                return; // Stop here, don't clear form
            }

            setFormData({
                renterName: '',
                carModel: '',
                startDate: '',
                startTime: '12:00',
                endDate: '',
                endTime: '12:00',
                amount: ''
            });
            router.refresh();
        } catch (error) {
            console.error('Failed to add rental', error);
            alert("Unexpected error: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Record New Rental</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4 flex flex-col gap-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Renter Name</label>
                        <Input
                            name="renterName"
                            placeholder="Renter Name"
                            value={formData.renterName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Car Model</label>
                        <Input
                            name="carModel"
                            placeholder="Car Model (Optional)"
                            value={formData.carModel}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium block">Start</label>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs text-muted-foreground block mb-1">Date</label>
                                    <Input
                                        name="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground block mb-1">Time</label>
                                    <Input
                                        name="startTime"
                                        type="time"
                                        value={formData.startTime}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium block">End</label>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs text-muted-foreground block mb-1">Date</label>
                                    <Input
                                        name="endDate"
                                        type="date"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground block mb-1">Time</label>
                                    <Input
                                        name="endTime"
                                        type="time"
                                        value={formData.endTime}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Rental Amount ($)</label>
                        <Input
                            name="amount"
                            type="number"
                            placeholder="0.00"
                            value={formData.amount}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? 'Saving...' : 'Record Rental'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
