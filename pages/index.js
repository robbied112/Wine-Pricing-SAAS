// pages/index.js
import Head from 'next/head'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to login page
    router.push('/login')
  }, [router])

  return (
    <div>
      <Head>
        <title>Wine Pricing Calculator</title>
        <meta name="description" content="Professional wine pricing calculations" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Wine Pricing Calculator</h1>
          <p className="mt-2">Redirecting to login...</p>
        </div>
      </main>
    </div>
  )
}