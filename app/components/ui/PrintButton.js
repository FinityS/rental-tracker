'use client';

import { Printer } from 'lucide-react';

export function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
        >
            <Printer size={16} />
            <span>Print / Save PDF</span>
        </button>
    );
}
