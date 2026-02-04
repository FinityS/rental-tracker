import React from 'react';
import { RentalForm } from './components/features/RentalForm';
import { TollUploader } from './components/features/TollUploader';
import { getRentals } from './lib/actions';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/Card';

// FORCE DYNAMIC: Ensure this page never caches and always hits the DB
export const dynamic = 'force-dynamic';

export default async function Home() {
  const rentals = await getRentals();

  // Calculate total revenue (Rentals + Tolls)
  const totalRevenue = rentals.reduce((sum, rental) => {
    return sum + Number(rental.amount || 0) + (rental.totalTolls || 0);
  }, 0);

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="container mx-auto space-y-8 animate-fade-in">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-primary">Car Rental Tracker</h1>
          <div className="text-left md:text-right">
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-3xl font-bold">${totalRevenue.toFixed(2)}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <RentalForm />
            <TollUploader rentals={rentals} />
          </div>

          <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Card>
              <CardHeader>
                <CardTitle>Recent Rentals</CardTitle>
              </CardHeader>
              <CardContent>
                {rentals.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No rentals recorded yet.</p>
                ) : (
                  <div className="space-y-4">
                    {rentals.slice().reverse().map((rental) => (
                      <div key={rental.id} className="flex justify-between items-center p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                        <div>
                          <p className="font-medium">{rental.renterName}</p>
                          <p className="text-sm text-muted-foreground">{rental.carModel}</p>
                          {rental.totalTolls > 0 && (
                            <p className="text-xs text-primary">
                              + ${rental.totalTolls.toFixed(2)} Tolls
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${(Number(rental.amount) + (rental.totalTolls || 0)).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(rental.startDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
