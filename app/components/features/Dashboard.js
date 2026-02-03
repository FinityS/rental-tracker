'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

export function Dashboard({ rentals }) {
    const stats = useMemo(() => {
        let totalRevenue = 0;
        let totalExpenses = 0;
        let totalOutstanding = 0;
        const monthlyData = {};

        rentals.forEach(rental => {
            const amount = Number(rental.amount) || 0;
            const tolls = rental.totalTolls || 0;
            const tickets = rental.totalTickets || 0;
            const paid = Number(rental.totalPaid) || 0;

            const expenses = tolls + tickets;
            const totalCost = amount + expenses;
            const balance = totalCost - paid;

            totalRevenue += amount;
            totalExpenses += expenses;
            if (balance > 0) totalOutstanding += balance;

            // Monthly breakdown
            const date = new Date(rental.startDate);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthLabel = date.toLocaleString('default', { month: 'short', year: 'numeric' });

            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = {
                    label: monthLabel,
                    revenue: 0,
                    expenses: 0,
                    profit: 0,
                    count: 0
                };
            }

            monthlyData[monthKey].revenue += amount;
            monthlyData[monthKey].expenses += expenses;
            monthlyData[monthKey].profit += (amount - expenses);
            monthlyData[monthKey].count += 1;
        });

        // Sort months descending
        const sortedMonths = Object.entries(monthlyData)
            .sort(([keyA], [keyB]) => keyB.localeCompare(keyA))
            .map(([_, data]) => data);

        return {
            totalRevenue,
            totalExpenses,
            totalOutstanding,
            netProfit: totalRevenue - totalExpenses,
            monthlyBreakdown: sortedMonths
        };
    }, [rentals]);

    return (
        <div className="space-y-6">
            {/* Summary Cards - Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="glass border-0 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardContent className="p-6 relative z-10">
                        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Revenue</p>
                        <h3 className="text-3xl font-bold text-white mt-2">
                            ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h3>
                    </CardContent>
                </Card>

                <Card className="glass border-0 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardContent className="p-6 relative z-10">
                        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Expenses</p>
                        <h3 className="text-3xl font-bold text-red-400 mt-2">
                            ${stats.totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">Tolls & Tickets</p>
                    </CardContent>
                </Card>

                <Card className="glass border-0 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardContent className="p-6 relative z-10">
                        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Net Profit</p>
                        <h3 className={`text-3xl font-bold mt-2 ${stats.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ${stats.netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h3>
                    </CardContent>
                </Card>

                <Card className="glass border-0 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <CardContent className="p-6 relative z-10">
                        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Outstanding</p>
                        <h3 className="text-3xl font-bold text-orange-400 mt-2">
                            ${stats.totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">To Collect</p>
                    </CardContent>
                </Card>
            </div>

            {/* Monthly Breakdown */}
            <Card className="glass border-0">
                <CardHeader>
                    <CardTitle className="text-xl font-light tracking-wide">Monthly Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {stats.monthlyBreakdown.map((month, idx) => (
                            <div key={idx} className="group flex items-center justify-between p-4 hover:bg-white/5 rounded-xl transition-colors duration-300">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">
                                        {month.label.split(' ')[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white">{month.label}</h4>
                                        <p className="text-xs text-gray-500">{month.count} Rentals</p>
                                    </div>
                                </div>
                                <div className="flex gap-8 text-right">
                                    <div className="hidden md:block">
                                        <p className="text-xs text-gray-500 uppercase">Revenue</p>
                                        <p className="text-white font-medium">${month.revenue.toLocaleString()}</p>
                                    </div>
                                    <div className="hidden md:block">
                                        <p className="text-xs text-gray-500 uppercase">Expenses</p>
                                        <p className="text-red-400 font-medium">-${month.expenses.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">Profit</p>
                                        <p className={`font-bold ${month.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            ${month.profit.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {stats.monthlyBreakdown.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500">No data available yet</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
