import { getRentals } from '../lib/actions';
import { RentalList } from '../components/features/RentalList';
import { Dashboard } from '../components/features/Dashboard';
import { RentersList } from '../components/features/RentersList';

export default async function RentalsPage() {
    const rentals = await getRentals();

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Rentals Dashboard
            </h1>

            <Dashboard rentals={rentals} />

            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">Renters Summary</h2>
                <RentersList rentals={rentals} />
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold text-white">Recent Rentals</h2>
                <RentalList initialRentals={rentals} />
            </div>
        </div>
    );
}
