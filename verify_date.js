
const tollDateStr = "12/24/2025 07:07:15 AM";
const tollDate = new Date(tollDateStr);

const rentalStart = new Date("2025-12-23T21:00:00.000Z"); // Dec 23 4pm EST
const rentalEnd = new Date("2025-12-25T00:30:00.000Z");   // Dec 24 7:30pm EST

console.log("Toll Date Parsed:", tollDate.toISOString(), tollDate.toString());
console.log("Rental Start:", rentalStart.toISOString());
console.log("Rental End:", rentalEnd.toISOString());

const isMatch = tollDate >= rentalStart && tollDate <= rentalEnd;
console.log("Is Match:", isMatch);
