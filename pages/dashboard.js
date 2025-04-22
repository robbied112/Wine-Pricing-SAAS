// pages/dashboard.js - CORRECT STRUCTURE

import Head from 'next/head';
import DashboardLayout from '../components/Layout/DashboardLayout';
// Import the component holding the new dashboard content
import DashboardContent from '../components/Dashboard/DashboardContent'; 

export default function Dashboard() { 
  return (
    // Use the layout component as the wrapper
    <DashboardLayout> 
      <Head>
        <title>Dashboard - Wine Pricing Calculator</title>
      </Head>
      {/* Render the separate content component inside the layout */}
      <DashboardContent /> 
    </DashboardLayout>
  );
}

// No getServerSideProps needed here