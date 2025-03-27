// pages/calculator.js
import Head from 'next/head'
import DashboardLayout from '../components/Layout/DashboardLayout'
import WinePricingCalculator from '../components/Calculator/WinePricingCalculator'
import { withAuth } from '../lib/auth'

export default function Calculator({ user }) {
  return (
    <DashboardLayout>
      <Head>
        <title>Wine Pricing Calculator</title>
      </Head>
      
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">Wine Pricing Calculator</h1>
        <p className="mt-1 text-sm text-gray-500">Calculate pricing across your distribution channels</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <WinePricingCalculator user={user} />
      </div>
    </DashboardLayout>
  )
}

export const getServerSideProps = withAuth;