// lib/auth.js
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs'; // Updated import

export async function withAuth(context) {
  // --- Log: Check if function runs and for which page ---
  console.log(`--- Running withAuth (getServerSideProps) for page: ${context.resolvedUrl || context.req.url}`); 

  // Use the new function name here:
  const supabase = createPagesServerClient(context); 
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // --- Log: Check server-side session status ---
  console.log(`--- withAuth session status: ${session ? 'Session FOUND' : 'Session NOT FOUND'}`); 

  if (!session) {
    // --- Log: Confirm redirection reason ---
    console.log(`--- withAuth redirecting to /login because no session found.`); 
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  // --- Log: Confirm successful user prop return ---
  console.log(`--- withAuth found session, returning user props for ${session.user.email}`); 
  return {
    props: {
      user: session.user, 
    },
  };
}