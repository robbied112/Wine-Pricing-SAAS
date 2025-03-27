import Head from 'next/head'
import Link from 'next/link'
import DashboardLayout from '../components/Layout/DashboardLayout'
import { withAuth } from '../lib/auth'

export default function Dashboard({ user }) {
  return (
    <DashboardLayout>
      <Head>
        <title>Dashboard - Wine Pricing Calculator</title>
      </Head>
      
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome, {user.email}</p>
      </div>
      
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:gap-4">
        {/* Quick Stats */}
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <div className="ml-3">
                  <span className="text-sm font-medium text-blue-600">Saved Calculations</span>
                  <h4 className="text-2xl font-bold text-blue-900">0</h4>
                </div>
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <div className="ml-3">
                  <span className="text-sm font-medium text-green-600">Account Type</span>
                  <h4 className="text-xl font-bold text-green-900">Free</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4">
            <Link 
              href="/calculator" 
              className="inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path>
              </svg>
              New Calculation
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export const getServerSideProps = withAuth;