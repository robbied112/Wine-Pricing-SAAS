// components/Layout/DashboardLayout.jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router'; // Need router for redirect here
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient'; 

export default function DashboardLayout({ children }) {
  const router = useRouter(); // Get router instance
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    // Check initial user state quickly (no redirect here)
    const getInitialUser = async () => {
      try {
        const { data: { user: initialUser } } = await supabase.auth.getUser();
        setUser(initialUser); 
      } catch (error) {
        console.error("Error fetching initial user:", error);
      } finally {
        setLoading(false); 
      }
    };
    getInitialUser(); 

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event); // Log the event
      const currentUser = session?.user ?? null;
      setUser(currentUser); // Update user state
      setLoading(false); // Ensure loading is false

      // --- ADDED REDIRECT LOGIC ---
      // If the user just signed in, redirect them to the dashboard
      if (event === 'SIGNED_IN' && currentUser) {
        console.log("SIGNED_IN event detected, redirecting to /dashboard...");
        router.push('/dashboard'); 
      }
      // If the user just signed OUT, redirect them to login
      // (This might conflict with explicit redirect in handleSignOut, choose one place)
      // if (event === 'SIGNED_OUT') {
      //   console.log("SIGNED_OUT event detected, redirecting to /login...");
      //   router.push('/login');
      // }
      // --- END ADDED REDIRECT LOGIC ---
    });

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, [router]); // Add router to dependency array as it's used in the effect now

  const handleSignOut = async () => {
    setLoading(true); 
    await supabase.auth.signOut();
    // Redirect explicitly here OR rely solely on the SIGNED_OUT event in the listener above
    router.push('/login'); 
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // ... Keep the rest of the return (...) JSX the same ...
  // Including the Nav, Sidebar, and Main Content rendering
   return (
     <div className="min-h-screen bg-gray-50">
       {/* Top Navigation */}
       <nav className="bg-white border-b border-gray-200 fixed z-30 w-full">
         <div className="px-3 py-3 lg:px-5 lg:pl-3">
           <div className="flex items-center justify-between">
             <div className="flex items-center justify-start">
               <Link href="/dashboard" className="text-xl font-bold flex items-center lg:ml-2.5">
                 <span className="self-center text-gray-900">WinePricing</span>
               </Link>
             </div>
             <div className="flex items-center">
               <div className="flex items-center ml-3">
                 <div>
                   {user ? (
                     <>
                       <span className="text-sm font-medium text-gray-700 mr-2 hidden sm:inline">
                         {user.email}
                       </span>
                       <button onClick={handleSignOut} className="text-sm text-gray-500 hover:text-gray-900">
                         Sign out
                       </button>
                     </>
                   ) : (
                     <Link href="/login" className="text-sm text-blue-600 hover:text-blue-800">
                       Sign In
                     </Link>
                   )}
                 </div>
               </div>
             </div>
           </div>
         </div>
       </nav>
       
       {/* Sidebar */}
       <aside className="fixed hidden z-20 h-full top-0 left-0 pt-16 lg:flex flex-shrink-0 flex-col w-64 transition-width duration-75">
          {/* ... Sidebar content ... */}
          <div className="relative flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white pt-0">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex-1 px-3 bg-white divide-y space-y-1">
                <ul className="space-y-2 pb-2">
                  {/* Links... */}
                  <li> <Link href="/dashboard" className={`text-base text-gray-900 font-normal rounded-lg flex items-center p-2 hover:bg-gray-100 group ${ router.pathname === '/dashboard' ? 'bg-gray-100' : '' }`}> {/* Dashboard Icon */} <svg className="w-6 h-6 text-gray-500 group-hover:text-gray-900" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path></svg> <span className="ml-3">Dashboard</span> </Link> </li>
                  <li> <Link href="/calculator" className={`text-base text-gray-900 font-normal rounded-lg flex items-center p-2 hover:bg-gray-100 group ${ router.pathname === '/calculator' ? 'bg-gray-100' : '' }`}> {/* Calculator Icon */} <svg className="w-6 h-6 text-gray-500 group-hover:text-gray-900" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg> <span className="ml-3">Wine Calculator</span> </Link> </li>
                  <li> <Link href="/saved-calculations" className={`text-base text-gray-900 font-normal rounded-lg flex items-center p-2 hover:bg-gray-100 group ${ router.pathname === '/saved-calculations' ? 'bg-gray-100' : '' }`}> {/* Saved Icon */} <svg className="w-6 h-6 text-gray-500 group-hover:text-gray-900" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M8.707 7.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L11 7.586V3a1 1 0 10-2 0v4.586l-.293-.293z"></path><path d="M3 5a2 2 0 012-2h1a1 1 0 010 2H5v7h2l1 2h4l1-2h2V5h-1a1 1 0 110-2h1a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"></path></svg> <span className="ml-3">Saved Calculations</span> </Link> </li>
                </ul>
              </div>
            </div>
          </div>
       </aside>
       
       {/* Main Content Area */}
       <div className="bg-gray-50 relative min-h-screen lg:ml-64 pt-16 pb-10">
         <div className="px-4 py-6">
           {children} 
         </div>
       </div>
     </div>
   );
}