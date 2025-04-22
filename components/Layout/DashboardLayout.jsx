// components/Layout/DashboardLayout.jsx - REDESIGNED VERSION (Apr 6, 2025)

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

// Import global styles using the relative path
import '../../styles/globals.css'; 

export default function DashboardLayout({ children }) {
  const router = useRouter(); 
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check initial user state quickly
    const getInitialUser = async () => {
      try {
        const { data: { user: initialUser } } = await supabase.auth.getUser();
        if (initialUser) { 
          setUser(initialUser);
        } 
      } catch (error) {
        console.error("Error fetching initial user:", error);
        setLoading(false); 
      } 
    };
    getInitialUser(); 

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session); 
      const currentUser = session?.user ?? null;
      setUser(currentUser); 
      setLoading(false);

      // Client-side protection
      if (!loading && !currentUser) {
        if (router.pathname !== '/login' && router.pathname !== '/signup') {
          console.log("Client-side check: No user found, redirecting to /login");
          router.push('/login');
        }
      }
      
      // Redirect away from auth pages if user is logged in
      if (event === 'SIGNED_IN' && currentUser && (router.pathname === '/login' || router.pathname === '/signup')) {
         console.log("SIGNED_IN detected on auth page, redirecting to /dashboard...");
         router.push('/dashboard'); 
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, [router, loading]); 

  const handleSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    router.push('/login'); 
  };

  // Loading state display
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Render the actual layout
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        position: 'fixed',
        zIndex: 30,
        width: '100%',
        padding: '12px 16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1400px',
          margin: '0 auto',
          width: '100%'
        }}>
          {/* Logo/Title Area */}
          <div style={{display: 'flex', alignItems: 'center'}}>
            {/* Mobile menu button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: window.innerWidth < 1024 ? 'flex' : 'none',
                marginRight: '12px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#4a5568'
              }}
              aria-label="Toggle menu"
            >
              <svg style={{width: '24px', height: '24px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
            
            <Link href="/dashboard" style={{display: 'flex', alignItems: 'center', textDecoration: 'none'}}>
              {/* Wine glass logo */}
              <svg style={{width: '32px', height: '32px', color: '#805ad5'}} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 2a1 1 0 00-1 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738.694a1 1 0 11-.394 1.96l-1.736-.692-.001.001 1.965 2.455a1 1 0 11-1.57 1.256L10 9.417l-3.217 3.764a1 1 0 01-1.568-1.256l1.965-2.455-.001-.001-1.74.695a1 1 0 11-.394-1.963l1.733-.692-1.233-.616a1 1 0 01.894-1.79l1.599.8L9 4.323V3a1 1 0 00-1-1H6.64c-.695 0-1.18.42-1.499.897-.37 0-.7.247-.921.67L3.55 5.89c-.18.324-.329.682-.329 1.11v7c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V7c0-.428-.149-.786-.329-1.11l-.66-1.323C16.01 4.148 15.689 4 15.36 4H14a1 1 0 00-1-1h-2.64z"/>
              </svg>
              <span style={{marginLeft: '8px', fontSize: '20px', fontWeight: 'bold', color: '#1a202c'}}>
                Wine<span style={{color: '#805ad5'}}>Pricing</span>
              </span>
            </Link>
          </div>
          
          {/* User Menu Area */}
          <div style={{display: 'flex', alignItems: 'center'}}>
            {/* Help button - only visible on desktop */}
            <button type="button" style={{
              display: window.innerWidth < 640 ? 'none' : 'flex',
              padding: '8px',
              marginRight: '12px',
              color: '#718096',
              borderRadius: '9999px',
              background: 'none',
              border: 'none',
              cursor: 'pointer'
            }}>
              <svg style={{width: '24px', height: '24px'}} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            
            {/* User profile */}
            <div>
              {user ? (
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <div style={{
                    display: window.innerWidth < 768 ? 'none' : 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    marginRight: '12px'
                  }}>
                    <span style={{fontSize: '14px', fontWeight: '500', color: '#2d3748'}}>
                      {user.email?.split('@')[0]}
                    </span>
                    <span style={{fontSize: '12px', color: '#718096'}}>
                      {accountTypeFromEmail(user.email)}
                    </span>
                  </div>
                  <div>
                    <button style={{
                      display: 'flex',
                      backgroundColor: '#EBF4FF',
                      borderRadius: '9999px',
                      border: 'none',
                      width: '32px',
                      height: '32px',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#805ad5',
                      fontWeight: 'bold'
                    }}>
                      {user.email?.charAt(0).toUpperCase()}
                    </button>
                  </div>
                  <button 
                    onClick={handleSignOut} 
                    style={{
                      marginLeft: '16px',
                      fontSize: '14px',
                      color: '#718096',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }}
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <Link href="/login" style={{
                  fontSize: '14px',
                  backgroundColor: '#805ad5',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  display: 'inline-block'
                }}>
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* Mobile menu */}
      <div style={{
        position: 'fixed',
        zIndex: 20,
        top: '60px',
        left: 0,
        right: 0,
        backgroundColor: 'white',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        transform: mobileMenuOpen ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s ease-in-out',
        display: window.innerWidth >= 1024 ? 'none' : 'block'
      }}>
        <div style={{padding: '8px'}}>
          <Link 
            href="/dashboard" 
            style={{
              display: 'block',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '500',
              textDecoration: 'none',
              color: router.pathname === '/dashboard' ? '#805ad5' : '#4a5568',
              backgroundColor: router.pathname === '/dashboard' ? '#F7FAFC' : 'transparent'
            }}
            onClick={() => setMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link 
            href="/calculator" 
            style={{
              display: 'block',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '500',
              textDecoration: 'none',
              color: router.pathname === '/calculator' ? '#805ad5' : '#4a5568',
              backgroundColor: router.pathname === '/calculator' ? '#F7FAFC' : 'transparent',
              marginTop: '4px'
            }}
            onClick={() => setMobileMenuOpen(false)}
          >
            Wine Calculator
          </Link>
          <Link 
            href="/saved-calculations" 
            style={{
              display: 'block',
              padding: '12px',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '500',
              textDecoration: 'none',
              color: router.pathname === '/saved-calculations' ? '#805ad5' : '#4a5568',
              backgroundColor: router.pathname === '/saved-calculations' ? '#F7FAFC' : 'transparent',
              marginTop: '4px'
            }}
            onClick={() => setMobileMenuOpen(false)}
          >
            Saved Calculations
          </Link>
        </div>
      </div>
      
      {/* Sidebar - Desktop */}
      <aside style={{
        position: 'fixed',
        zIndex: 20,
        top: 0,
        left: 0,
        height: '100%',
        width: '256px',
        backgroundColor: 'white',
        borderRight: '1px solid #e2e8f0',
        paddingTop: '64px', // Space for navbar
        display: window.innerWidth >= 1024 ? 'flex' : 'none',
        flexDirection: 'column',
        transition: 'width 0.3s'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflowY: 'auto'
        }}>
          <div style={{padding: '20px 12px'}}>
            {/* User info at top of sidebar */}
            {user && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px',
                marginBottom: '20px',
                backgroundColor: '#F7FAFC',
                borderRadius: '8px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '9999px',
                  backgroundColor: '#EBF4FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#805ad5',
                  fontWeight: 'bold'
                }}>
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <div style={{flex: '1', minWidth: 0}}>
                  <p style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#2d3748',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {user.email?.split('@')[0]}
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: '#718096',
                    margin: '4px 0 0 0',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {accountTypeFromEmail(user.email)}
                  </p>
                </div>
              </div>
            )}
            
            {/* Navigation */}
            <div style={{marginBottom: '24px'}}>
              <p style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#718096',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '8px',
                paddingLeft: '12px'
              }}>
                General
              </p>
              
              <div style={{marginTop: '4px'}}>
                <Link href="/dashboard" style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  color: router.pathname === '/dashboard' ? '#805ad5' : '#4a5568',
                  backgroundColor: router.pathname === '/dashboard' ? '#F7FAFC' : 'transparent',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}>
                  <svg style={{
                    marginRight: '12px',
                    width: '20px',
                    height: '20px',
                    color: router.pathname === '/dashboard' ? '#805ad5' : '#a0aec0'
                  }} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z"></path>
                    <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z"></path>
                  </svg>
                  Dashboard
                </Link>
              </div>
              
              <div style={{marginTop: '4px'}}>
                <Link href="/calculator" style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  color: router.pathname === '/calculator' ? '#805ad5' : '#4a5568',
                  backgroundColor: router.pathname === '/calculator' ? '#F7FAFC' : 'transparent',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}>
                  <svg style={{
                    marginRight: '12px',
                    width: '20px',
                    height: '20px',
                    color: router.pathname === '/calculator' ? '#805ad5' : '#a0aec0'
                  }} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M5 2a1 1 0 00-1 1v16a1 1 0 001 1h10a1 1 0 001-1V3a1 1 0 00-1-1H5zm6 2H6v2h5V4zm4 3H5v2h10V7zm0 3H5v2h10v-2zm-4 6v-2H6v2h5z" clipRule="evenodd"></path>
                  </svg>
                  Wine Calculator
                </Link>
              </div>
              
              <div style={{marginTop: '4px'}}>
                <Link href="/saved-calculations" style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  color: router.pathname === '/saved-calculations' ? '#805ad5' : '#4a5568',
                  backgroundColor: router.pathname === '/saved-calculations' ? '#F7FAFC' : 'transparent',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}>
                  <svg style={{
                    marginRight: '12px',
                    width: '20px',
                    height: '20px',
                    color: router.pathname === '/saved-calculations' ? '#805ad5' : '#a0aec0'
                  }} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z"></path>
                    <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z"></path>
                  </svg>
                  Saved Calculations
                </Link>
              </div>
            </div>
            
            {/* Additional sections */}
            <div style={{marginBottom: '24px'}}>
              <p style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#718096',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '8px',
                paddingLeft: '12px'
              }}>
                Resources
              </p>
              
              <div style={{marginTop: '4px'}}>
                <Link href="/market-insights" style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  color: router.pathname === '/market-insights' ? '#805ad5' : '#4a5568',
                  backgroundColor: router.pathname === '/market-insights' ? '#F7FAFC' : 'transparent',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}>
                  <svg style={{
                    marginRight: '12px',
                    width: '20px',
                    height: '20px',
                    color: router.pathname === '/market-insights' ? '#805ad5' : '#a0aec0'
                  }} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path>
                  </svg>
                  Market Insights
                </Link>
              </div>
              
              <div style={{marginTop: '4px'}}>
                <Link href="/pricing-guides" style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  color: router.pathname === '/pricing-guides' ? '#805ad5' : '#4a5568',
                  backgroundColor: router.pathname === '/pricing-guides' ? '#F7FAFC' : 'transparent',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'background-color 0.2s'
                }}>
                  <svg style={{
                    marginRight: '12px',
                    width: '20px',
                    height: '20px',
                    color: router.pathname === '/pricing-guides' ? '#805ad5' : '#a0aec0'
                  }} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"></path>
                  </svg>
                  Pricing Guides
                </Link>
              </div>
            </div>
          </div>
          
          {/* Footer section in sidebar */}
          <div style={{
            marginTop: 'auto',
            padding: '16px 12px',
            borderTop: '1px solid #e2e8f0'
          }}>
            <div style={{padding: '0 12px'}}>
              <Link href="/settings" style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: '6px',
                textDecoration: 'none',
                color: '#4a5568',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                <svg style={{
                  marginRight: '12px',
                  width: '20px',
                  height: '20px',
                  color: '#a0aec0'
                }} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path>
                </svg>
                Settings
              </Link>
              
              <Link href="/help" style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: '6px',
                textDecoration: 'none',
                color: '#4a5568',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                <svg style={{
                  marginRight: '12px',
                  width: '20px',
                  height: '20px',
                  color: '#a0aec0'
                }} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path>
                </svg>
                Help & Support
              </Link>
            </div>
          </div>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <div style={{
        backgroundColor: '#f7fafc',
        minHeight: '100vh',
        marginLeft: window.innerWidth >= 1024 ? '256px' : '0',
        paddingTop: '90px', // Increased to prevent overlap
        paddingBottom: '40px'
      }}>
        <main style={{
          padding: '0 24px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* No page title here to avoid overlap with dashboard content */}
          
          {/* Main content */}
          {children}
        </main>
        
        {/* Footer */}
        <footer style={{
          padding: '24px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#718096',
          borderTop: '1px solid #e2e8f0',
          marginTop: '48px'
        }}>
          <p style={{margin: 0}}>&copy; 2025 WinePricing. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

// Helper functions
function accountTypeFromEmail(email) {
  if (!email) return 'Free Account';
  return email.includes('premium') ? 'Premium Account' : 'Free Account';
}