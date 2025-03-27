// pages/login.js
import Head from 'next/head'
import Link from 'next/link'
import LoginForm from '@/components/Auth/LoginForm'

export default function Login() {
  return (
    <>
      <Head>
        <title>Login - Wine Pricing Calculator</title>
      </Head>
      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h1 className="text-center text-3xl font-extrabold text-gray-900">
            Wine Pricing Calculator
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Professional pricing for your wine portfolio
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <LoginForm />
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    New to Wine Pricing?
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/signup"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Create an account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}