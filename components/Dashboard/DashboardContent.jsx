// components/Dashboard/DashboardContent.jsx
import React, { useState } from 'react';
import Link from 'next/link';

const DashboardContent = () => {
  const [accountType] = useState('Free');
  const [savedCalculations] = useState(0);
  
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '28px',
      width: '100%',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 16px',
      // Add padding at the top to prevent overlap with navbar
      paddingTop: '20px'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px 28px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '12px'
    },
    headerLeft: {
      display: 'flex',
      flexDirection: 'column'
    },
    headerTitle: {
      fontSize: '28px',
      fontWeight: '700',
      color: '#1a202c',
      margin: '0'
    },
    headerSubtitle: {
      fontSize: '16px',
      color: '#718096',
      margin: '8px 0 0 0'
    },
    accountBadge: {
      display: 'flex',
      alignItems: 'center',
      backgroundColor: '#ebf8ff',
      color: '#3182ce',
      padding: '10px 16px',
      borderRadius: '9999px',
      fontSize: '14px',
      fontWeight: '500'
    },
    upgradeButton: {
      marginLeft: '8px',
      backgroundColor: '#4299e1',
      color: 'white',
      border: 'none',
      padding: '4px 10px',
      borderRadius: '6px',
      fontSize: '13px',
      cursor: 'pointer',
      fontWeight: '600'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '20px'
    },
    statCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      height: '100%'
    },
    statHeader: {
      fontSize: '15px',
      fontWeight: '600',
      color: '#4a5568',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginBottom: '16px'
    },
    statValue: {
      fontSize: '36px',
      fontWeight: 'bold',
      color: '#2d3748',
      margin: '0'
    },
    statSubtext: {
      fontSize: '14px',
      color: '#718096',
      margin: '8px 0 0 0',
      lineHeight: '1.5'
    },
    actionsContainer: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '24px 28px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    },
    sectionTitle: {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#1a202c',
      margin: '0 0 20px 0'
    },
    actionsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px'
    },
    actionButton: {
      backgroundColor: '#4299e1',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '12px 20px',
      fontSize: '15px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      textDecoration: 'none',
      transition: 'background-color 0.2s ease'
    },
    buttonIcon: {
      marginRight: '10px',
      width: '18px',
      height: '18px'
    },
    footer: {
      textAlign: 'center',
      color: '#718096',
      fontSize: '14px',
      padding: '20px 0',
      borderTop: '1px solid #e2e8f0',
      marginTop: '20px'
    }
  };
  
  return (
    <div style={styles.container}>
      {/* Header with Welcome */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.headerTitle}>Welcome to WinePricing</h1>
          <p style={styles.headerSubtitle}>Your wine pricing optimization tool</p>
        </div>
        <div style={styles.accountBadge}>
          <span>Account Type: <strong>{accountType}</strong></span>
          {accountType === 'Free' && (
            <button style={styles.upgradeButton}>Upgrade</button>
          )}
        </div>
      </div>
      
      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        {/* Saved Calculations */}
        <div style={styles.statCard}>
          <h3 style={styles.statHeader}>Saved Calculations</h3>
          <p style={styles.statValue}>{savedCalculations}</p>
          <p style={styles.statSubtext}>
            {accountType === 'Free' ? 'Limited to 5 saved calculations' : 'Unlimited saved calculations'}
          </p>
        </div>
        
        {/* Recent Activity */}
        <div style={styles.statCard}>
          <h3 style={styles.statHeader}>Recent Activity</h3>
          <p style={styles.statValue}>3</p>
          <p style={styles.statSubtext}>
            Last calculation: 2 days ago
          </p>
        </div>
        
        {/* Market Insights */}
        <div style={styles.statCard}>
          <h3 style={styles.statHeader}>Market Insights</h3>
          <p style={styles.statValue}>+4.2%</p>
          <p style={styles.statSubtext}>
            Average margin improvement based on your recent calculations
          </p>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div style={styles.actionsContainer}>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <div style={styles.actionsGrid}>
          <Link href="/calculator" style={styles.actionButton}>
            <span style={styles.buttonIcon}>+</span>
            New Calculation
          </Link>
          
          <Link href="/saved-calculations" style={{...styles.actionButton, backgroundColor: '#38a169'}}>
            <span style={styles.buttonIcon}>📋</span>
            View Saved Calculations
          </Link>
          
          <Link href="/pricing-tiers" style={{...styles.actionButton, backgroundColor: '#805ad5'}}>
            <span style={styles.buttonIcon}>💰</span>
            Pricing Tiers
          </Link>
        </div>
      </div>
      
      <div style={styles.footer}>
        © 2025 WinePricing. All rights reserved.
      </div>
    </div>
  );
};

export default DashboardContent;