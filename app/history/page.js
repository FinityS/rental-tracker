import { getRentals } from '../lib/actions';
import { RentalList } from '../components/features/RentalList';

export default async function HistoryPage() {
    const rentals = await getRentals();

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Rental History
            </h1>

            <div className="space-y-4">
                <p className="text-gray-400">View your past, fully paid, and archived rentals.</p>
                <RentalList initialRentals={rentals} showArchived={true} />
            </div>
        </div>
    );
}
