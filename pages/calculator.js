// pages/calculator.js - CORRECTED VERSION (Apr 7, 2025)
import Head from 'next/head';
import DashboardLayout from '../components/Layout/DashboardLayout';
import WinePricingCalculator from '../components/Calculator/WinePricingCalculator'; 
// Removed 'withAuth' import

// Removed { user } prop
export default function CalculatorPage() { 
  return (
    // Use the layout component as the wrapper
    <DashboardLayout> 
      <Head>
        {/* Layout sets dynamic title, but keep Head for other potential tags */}
        <title>Calculator - WinePricing</title> 
      </Head>
      
      {/* Render the main calculator component directly */}
      {/* No user prop passed down */}
      <WinePricingCalculator /> 
      
    </DashboardLayout>
  );
}

// No getServerSideProps here