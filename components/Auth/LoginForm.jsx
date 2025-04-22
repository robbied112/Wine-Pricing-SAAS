// components/Auth/LoginForm.jsx
import { useState } from 'react';
import { useRouter } from 'next/router'; // <-- Step 1: Ensure useRouter is imported
import { supabase } from '../../lib/supabaseClient';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter(); // <-- Step 2: Initialize the router hook

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Perform the login
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      console.log("Login successful via signInWithPassword!");
      router.push('/dashboard'); // Redirect to dashboard on success

    } catch (error) {
      console.error("Login failed:", error.message); // Log the error
      setError(error.message);
    } finally {
      // It's generally good practice to NOT set loading=false here if a redirect
      // is happening immediately, as the component might unmount anyway.
      // However, if the redirect fails or there's a delay, you might need it.
      // Let's keep it for now for the error case.
      setLoading(false); 
    }
  };

  // The return (...) JSX remains exactly the same as you provided.
  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <form onSubmit={handleLogin} className="space-y-4">
        {/* Email Input */}
         <div>
           <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
           <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
         </div>
         {/* Password Input */}
         <div>
           <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
           <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
         </div>
         {/* Submit Button */}
         <div>
           <button type="submit" disabled={loading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50">
             {loading ? 'Logging in...' : 'Log in'}
           </button>
         </div>
      </form>
    </div>
  );
}