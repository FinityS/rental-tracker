
import { getRental } from '../../lib/actions';
import { ManualTollForm } from '../../components/features/ManualTollForm';
import { TollList } from '../../components/features/TollList';
import { TicketForm } from '../../components/features/TicketForm';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import Link from 'next/link';

export default async function RentalDetailPage(props) {
    const params = await props.params;
    const rental = await getRental(params.id);

    if (!rental) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-red-500">Rental Not Found</h1>
                <Link href="/rentals" className="text-blue-400 hover:underline mt-4 block">
                    &larr; Back to Rentals
                </Link>
            </div>
        );
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleString();
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <Link href="/rentals" className="text-muted-foreground hover:text-white transition-colors">
                    &larr; Back to Dashboard
                </Link>
                <div className="text-right">
                    <span className="text-sm text-muted-foreground block">RENTAL ID</span>
                    <span className="font-mono text-xs">{rental.id}</span>
                </div>
            </div>

            {/* Rental Summary Card */}
            <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
                <CardHeader>
                    <CardTitle className="text-2xl text-blue-400">{rental.renterName}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="text-xs text-muted-foreground uppercase tracking-wider">Vehicle</label>
                            <p className="text-lg font-medium">{rental.carModel || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground uppercase tracking-wider">Duration</label>
                            <p className="text-sm">{formatDate(rental.startDate)}</p>
                            <p className="text-sm text-muted-foreground">to</p>
                            <p className="text-sm">{formatDate(rental.endDate)}</p>
                        </div>
                        <div>
                            <label className="text-xs text-muted-foreground uppercase tracking-wider">Financials</label>
                            <div className="flex justify-between items-center bg-gray-950/50 p-2 rounded mt-1">
                                <span>Rental</span>
                                <span>{formatCurrency(rental.amount)}</span>
                            </div>
                            <div className="flex justify-between items-center bg-gray-950/50 p-2 rounded mt-1">
                                <span>Tolls</span>
                                <span>{formatCurrency(rental.totalTolls || 0)}</span>
                            </div>
                            <div className="flex justify-between items-center bg-gray-950/50 p-2 rounded mt-1">
                                <span>Tickets</span>
                                <span>{formatCurrency(rental.totalTickets || 0)}</span>
                            </div>
                            <div className="flex justify-between items-center bg-blue-900/20 p-2 rounded mt-2 border border-blue-500/30">
                                <span className="font-bold text-blue-400">Total Owed</span>
                                <span className="font-bold text-xl">
                                    {formatCurrency(
                                        Number(rental.amount) +
                                        (rental.totalTolls || 0) +
                                        (rental.totalTickets || 0)
                                    )}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* TOLLS SECTION */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold border-b border-gray-700 pb-2">Tolls</h2>

                    {/* List of Tolls */}
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                        <TollList tolls={rental.tolls} rentalId={rental.id} />
                    </div>

                    {/* Manual Entry Form */}
                    <ManualTollForm rentalId={rental.id} />
                </div>

                {/* TICKETS SECTION */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold border-b border-gray-700 pb-2">Tickets</h2>

                    {/* List of Tickets */}
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                        {rental.tickets && rental.tickets.length > 0 ? (
                            rental.tickets.map((ticket, idx) => (
                                <div key={idx} className="bg-gray-800/50 p-3 rounded flex justify-between items-center text-sm">
                                    <div>
                                        <div className="font-medium">{ticket.reason}</div>
                                        <div className="text-xs text-muted-foreground">{ticket.date} @ {ticket.location}</div>
                                    </div>
                                    <div className="font-mono">{formatCurrency(ticket.amount)}</div>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground italic text-sm">No tickets recorded.</p>
                        )}
                    </div>

                    {/* Ticket Form */}
                    {/* Reusing existing TicketForm but we need to ensure it takes rentalId */}
                    <Card>
                        <CardHeader><CardTitle>Add Ticket</CardTitle></CardHeader>
                        <CardContent>
                            <TicketForm rentalId={rental.id} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
