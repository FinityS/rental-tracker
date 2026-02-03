# Car Rental Tracker

A modern, responsive web application built with Next.js for tracking personal car rentals, managing tolls, and monitoring revenue.

I made this using Antigravity and Gemini Pro, to practice AI development and to help me with my rental tracking needs.

## Features

### 📊 Dashboard
- **Revenue Overview**: Real-time calculation of total revenue including rentals and tolls.
- **Visual Analytics**: Beautiful, responsive layout with glassmorphism design elements.
- **Recent Activity**: Quick view of recent rentals and their status.

### 🚗 Rental Management
- **Detailed Tracking**: Record renter name, car model, dates, times, and amounts.
- **Automatic Calculations**: System automatically handles toll associations and total cost calculations.

### 🛣️ Tolls Management
- **CSV Upload**: Easily import toll data from CSV files.
- **Automatic Matching**: Smart algorithm matches tolls to specific rentals based on date and time.
- **Unmatched Tolls**: Tracks unmatched tolls for future assignment.
- **Mobile Friendly**: Card-based view for easy management on mobile devices.

### 📱 Responsive Design
- **Mobile First**: Fully responsive interface that works seamlessly on desktop, tablet, and mobile.
- **Smart Navigation**: Sidebar navigation on desktop, collapsible drawer on mobile.

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Font**: [Outfit](https://fonts.google.com/specimen/Outfit)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/app`: Main application code (App Router)
  - `/components`: Reusable UI components and feature-specific logic
  - `/lib`: Utility functions and server actions
  - `/tolls`: Toll management page
  - `/rentals`: Rental management page
- `/public`: Static assets

## License

This project is licensed under the MIT License.
