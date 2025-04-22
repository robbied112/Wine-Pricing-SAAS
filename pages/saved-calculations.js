import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import DashboardLayout from '../components/Layout/DashboardLayout'
import { supabase } from '../lib/supabaseClient'
import { withAuth } from '../lib/auth'

export default function SavedCalculations({ user }) {
  const [calculations, setCalculations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCalculations = async () => {
      try {
        const { data, error } = await supabase
          .from('calculations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        
        setCalculations(data || [])
      } catch (error) {
        console.error('Error fetching calculations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCalculations()
  }, [user])

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this calculation?')) return
    
    try {
      const { error } = await supabase
        .from('calculations')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      setCalculations(calculations.filter(calc => calc.id !== id))
    } catch (error) {
      console.error('Error deleting calculation:', error)
    }
  }

  return (
    <DashboardLayout>
      <Head>
        <title>Saved Calculations - Wine Pricing Calculator</title>
      </Head>
      
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">Saved Calculations</h1>
        <p className="mt-1 text-sm text-gray-500">Your saved wine pricing calculations</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : calculations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">You haven't saved any calculations yet.</p>
            <Link 
              href="/calculator" 
              className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create a calculation
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wine Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DI SRP</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SS SRP</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {calculations.map(calc => (
                  <tr key={calc.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{calc.wine_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(calc.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${calc.srp_di?.toFixed(2) || '--.--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${calc.srp_ss?.toFixed(2) || '--.--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      <button
                        onClick={() => handleDelete(calc.id)}
                        className="text-red-600 hover:text-red-900 ml-3"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
