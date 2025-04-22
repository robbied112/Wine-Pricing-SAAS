// components/Calculator/ResultsPanel.jsx

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

// Inline styles object
const styles = {
  panel: {
    backgroundColor: '#fff',
    borderRadius: '0.5rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    overflow: 'hidden',
  },
  header: {
    padding: '1rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontWeight: '600',
    fontSize: '1.25rem',
    color: '#1a202c',
    margin: 0,
  },
  body: {
    padding: '1.5rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem 1.5rem',
    color: '#718096',
  },
  emptyIcon: {
    width: '3rem',
    height: '3rem',
    margin: '0 auto 1rem auto',
    color: '#A0AEC0',
  },
  emptyTitle: {
    fontWeight: '600',
    fontSize: '1.25rem',
    marginBottom: '0.5rem',
    color: '#4a5568',
  },
  emptyText: {
    maxWidth: '24rem',
    margin: '0 auto',
    lineHeight: '1.5',
  },
  loadingState: {
    textAlign: 'center',
    padding: '3rem 1.5rem',
    color: '#7e3af2',
  },
  loadingSpinner: {
    width: '2rem',
    height: '2rem',
    margin: '0 auto 1rem auto',
    animation: 'spin 1s linear infinite',
    '@keyframes spin': {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' }
    }
  },
  loadingText: {
    fontWeight: '500',
  },
  errorState: {
    textAlign: 'center',
    padding: '2rem 1.5rem',
    backgroundColor: '#FED7D7',
    color: '#9B2C2C',
  },
  errorIcon: {
    width: '2rem',
    height: '2rem',
    margin: '0 auto 1rem auto',
    color: '#C53030',
  },
  errorTitle: {
    fontWeight: '600',
    fontSize: '1.25rem',
    marginBottom: '0.5rem',
  },
  errorText: {
    maxWidth: '24rem',
    margin: '0 auto',
    lineHeight: '1.5',
  },
  tabsRow: {
    display: 'flex',
    borderBottom: '1px solid #e2e8f0',
    overflowX: 'auto',
  },
  tab: {
    padding: '0.75rem 1.5rem',
    fontWeight: '500',
    color: '#4a5568',
    cursor: 'pointer',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s ease',
  },
  tabActive: {
    color: '#7e3af2',
    borderBottomColor: '#7e3af2',
  },
  resultsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    margin: '1rem 0',
  },
  resultsSection: {
    marginBottom: '2rem',
  },
  sectionTitle: {
    fontWeight: '600',
    fontSize: '1.125rem',
    color: '#2D3748',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #E2E8F0',
  },
  resultRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0',
    borderBottom: '1px solid #EDF2F7',
  },
  resultLabel: {
    color: '#4A5568',
    fontSize: '0.875rem',
  },
  resultValue: {
    fontWeight: '500',
    fontSize: '0.875rem',
    color: '#2D3748',
  },
  highlightedValue: {
    fontWeight: '600',
    fontSize: '1rem',
    color: '#7e3af2',
  },
  profitToggle: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.75rem',
    backgroundColor: '#F7FAFC',
    borderRadius: '0.25rem',
    cursor: 'pointer',
    marginBottom: '1rem',
  },
  toggleLabel: {
    marginLeft: '0.5rem',
    fontWeight: '500',
    fontSize: '0.875rem',
    color: '#4A5568',
  },
  checkbox: {
    marginRight: '0.5rem',
  },
  fullWidth: {
    gridColumn: '1 / -1',
  },
  modelTypeLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#7e3af2',
    textTransform: 'uppercase',
    marginBottom: '0.5rem',
  },
  strikethrough: {
    textDecoration: 'line-through',
    color: '#A0AEC0',
  },
  printOnly: {
    display: 'none',
    '@media print': {
      display: 'block',
    }
  },
  screenOnly: {
    '@media print': {
      display: 'none',
    }
  },
  printHeader: {
    marginBottom: '1.5rem',
    borderBottom: '1px solid #e2e8f0',
    paddingBottom: '1rem',
  },
  printTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
  printSubtitle: {
    fontSize: '1rem',
    color: '#4a5568',
  }
};

const ResultsPanel = ({
  calculations,
  formData,
  isCalculating,
  hasCalculations,
  errors,
  showGrossProfit,
  setShowGrossProfit,
  formatCurrency,
  reverseTargetModel
}) => {
  // Tabs state
  const [activeTab, setActiveTab] = useState('summary');
  
  // If there's an error in the calculation
  if (errors?.calculation && !isCalculating) {
    return (
      <div style={styles.panel}>
        <div style={styles.header}>
          <h2 style={styles.title}>Results</h2>
        </div>
        <div style={styles.errorState}>
          <AlertCircle style={styles.errorIcon} />
          <h3 style={styles.errorTitle}>Calculation Error</h3>
          <p style={styles.errorText}>{errors.calculation}</p>
        </div>
      </div>
    );
  }
  
  // If still calculating
  if (isCalculating) {
    return (
      <div style={styles.panel}>
        <div style={styles.header}>
          <h2 style={styles.title}>Results</h2>
        </div>
        <div style={styles.loadingState}>
          <div style={styles.loadingSpinner}>
            {/* Use an actual spinner here or rotate icon with CSS */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="32" strokeDashoffset="10" />
            </svg>
          </div>
          <p style={styles.loadingText}>Calculating prices...</p>
        </div>
      </div>
    );
  }
  
  // If there are no calculations to show yet
  if (!hasCalculations) {
    return (
      <div style={styles.panel}>
        <div style={styles.header}>
          <h2 style={styles.title}>Results</h2>
        </div>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>
            {/* Calculator or other appropriate icon */}
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
              <line x1="8" y1="7" x2="16" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <line x1="8" y1="17" x2="16" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h3 style={styles.emptyTitle}>No Results Yet</h3>
          <p style={styles.emptyText}>
            Enter your pricing data in the input panel to calculate wholesale and retail pricing.
          </p>
        </div>
      </div>
    );
  }
  
  // Helpers for result display
  const showTargetModel = formData.calculationMode === 'reverse';
  const targetModel = reverseTargetModel;
  
  return (
    <div style={styles.panel}>
      {/* Print-only header */}
      <div style={styles.printOnly}>
        <div style={styles.printHeader}>
          <h1 style={styles.printTitle}>{formData.wineName || 'Wine'} - Pricing Analysis</h1>
          <p style={styles.printSubtitle}>
            Date: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
      
      {/* Panel header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Results</h2>
      </div>
      
      {/* Tabs - Screen Only */}
      <div style={{...styles.tabsRow, ...styles.screenOnly}}>
        <button 
          style={{
            ...styles.tab, 
            ...(activeTab === 'summary' ? styles.tabActive : {})
          }}
          onClick={() => setActiveTab('summary')}
        >
          Summary
        </button>
        <button 
          style={{
            ...styles.tab, 
            ...(activeTab === 'di' ? styles.tabActive : {})
          }}
          onClick={() => setActiveTab('di')}
        >
          Direct Import
        </button>
        <button 
          style={{
            ...styles.tab, 
            ...(activeTab === 'ss' ? styles.tabActive : {})
          }}
          onClick={() => setActiveTab('ss')}
        >
          Stateside
        </button>
      </div>
      
      {/* Results Panel Content */}
      <div style={styles.body}>
        {/* Gross Profit Toggle */}
        {parseInt(formData.casesSold, 10) > 0 && (
          <div 
            style={styles.profitToggle}
            onClick={() => setShowGrossProfit(!showGrossProfit)}
          >
            <input
              type="checkbox"
              checked={showGrossProfit}
              onChange={() => setShowGrossProfit(!showGrossProfit)}
              style={styles.checkbox}
            />
            <span style={styles.toggleLabel}>
              Show Annual Gross Profit Projections
            </span>
          </div>
        )}
        
        {/* SUMMARY TAB */}
        {(activeTab === 'summary' || styles.printOnly) && (
          <div>
            {/* Input Summary Section */}
            <div style={styles.resultsSection}>
              <h3 style={styles.sectionTitle}>Input Summary</h3>
              <div style={styles.resultsGrid}>
                <div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>Wine Name</span>
                    <span style={styles.resultValue}>{formData.wineName || 'N/A'}</span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>Currency</span>
                    <span style={styles.resultValue}>{formData.currency}</span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>Effective Exchange Rate</span>
                    <span style={styles.resultValue}>{calculations.effectiveExchangeRate?.toFixed(5) || 'N/A'}</span>
                  </div>
                  {showTargetModel && (
                    <div style={styles.resultRow}>
                      <span style={styles.resultLabel}>Target Model</span>
                      <span style={styles.resultValue}>{targetModel === 'DI' ? 'Direct Import' : 'Stateside'}</span>
                    </div>
                  )}
                </div>
                
                <div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>Bottle Size</span>
                    <span style={styles.resultValue}>{formData.bottleSize}</span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>Case Pack</span>
                    <span style={styles.resultValue}>{formData.casePackSize} bottles</span>
                  </div>
                  {formData.calculationMode === 'forward' ? (
                    <>
                      <div style={styles.resultRow}>
                        <span style={styles.resultLabel}>Bottle Cost ({formData.currency})</span>
                        <span style={styles.resultValue}>
                          {formatCurrency(formData.bottleCost, formData.currency)}
                        </span>
                      </div>
                      <div style={styles.resultRow}>
                        <span style={styles.resultLabel}>Case Cost ({formData.currency})</span>
                        <span style={styles.resultValue}>
                          {formatCurrency(formData.casePrice, formData.currency)}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={styles.resultRow}>
                        <span style={styles.resultLabel}>Target SRP (USD)</span>
                        <span style={styles.resultValue}>
                          {formatCurrency(formData.targetSrp, 'USD')}
                        </span>
                      </div>
                      <div style={styles.resultRow}>
                        <span style={styles.resultLabel}>Derived Bottle Cost ({formData.currency})</span>
                        <span style={styles.resultValue}>
                          {formatCurrency(calculations.baseBottleCostOriginal, formData.currency)}
                        </span>
                      </div>
                      <div style={styles.resultRow}>
                        <span style={styles.resultLabel}>Derived Case Cost ({formData.currency})</span>
                        <span style={styles.resultValue}>
                          {formatCurrency(calculations.baseCasePriceOriginal, formData.currency)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Pricing Summary Section */}
            <div style={styles.resultsSection}>
              <h3 style={styles.sectionTitle}>Pricing Summary</h3>
              <div style={styles.resultsGrid}>
                {/* Direct Import */}
                <div>
                  <div style={{
                    ...styles.modelTypeLabel, 
                    color: showTargetModel && targetModel === 'DI' ? '#7e3af2' : '#4A5568'
                  }}>
                    Direct Import {showTargetModel && targetModel === 'DI' && '(Target)'}
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>Supplier FOB ($)</span>
                    <span style={styles.resultValue}>
                      {formatCurrency(calculations.supplierFobDI_USD / formData.casePackSize, 'USD')} per bottle
                    </span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>Distributor Wholesale ($)</span>
                    <span style={styles.resultValue}>
                      {formatCurrency(calculations.distBottleWholesaleDI_USD, 'USD')} per bottle
                    </span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>By-The-Glass ($)</span>
                    <span style={styles.resultValue}>
                      {formatCurrency(calculations.distBtgPriceDI_USD, 'USD')} per bottle
                    </span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>Suggested Retail Price</span>
                    <span style={{...styles.resultValue, ...styles.highlightedValue}}>
                      {formatCurrency(calculations.srpDi_USD, 'USD')}
                    </span>
                  </div>
                </div>
                
                {/* Stateside */}
                <div>
                  <div style={{
                    ...styles.modelTypeLabel, 
                    color: showTargetModel && targetModel === 'SS' ? '#7e3af2' : '#4A5568'
                  }}>
                    Stateside {showTargetModel && targetModel === 'SS' && '(Target)'}
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>Supplier FOB ($)</span>
                    <span style={styles.resultValue}>
                      {formatCurrency(calculations.supplierFobSS_USD / formData.casePackSize, 'USD')} per bottle
                    </span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>Distributor Wholesale ($)</span>
                    <span style={styles.resultValue}>
                      {formatCurrency(calculations.distBottleWholesaleSS_USD, 'USD')} per bottle
                    </span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>By-The-Glass ($)</span>
                    <span style={styles.resultValue}>
                      {formatCurrency(calculations.distBtgPriceSS_USD, 'USD')} per bottle
                    </span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>Suggested Retail Price</span>
                    <span style={{...styles.resultValue, ...styles.highlightedValue}}>
                      {formatCurrency(calculations.srpSs_USD, 'USD')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Profit Projections Section */}
            {showGrossProfit && parseInt(formData.casesSold, 10) > 0 && (
              <div style={styles.resultsSection}>
                <h3 style={styles.sectionTitle}>
                  Annual Profit Projections ({formData.casesSold} cases)
                </h3>
                <div style={styles.resultsGrid}>
                  {/* Direct Import Profits */}
                  <div>
                    <div style={styles.modelTypeLabel}>Direct Import</div>
                    <div style={styles.resultRow}>
                      <span style={styles.resultLabel}>Supplier Gross Profit</span>
                      <span style={styles.resultValue}>
                        {formatCurrency(calculations.supplierGrossProfitDI, 'USD')}
                      </span>
                    </div>
                    <div style={styles.resultRow}>
                      <span style={styles.resultLabel}>Distributor Gross Profit</span>
                      <span style={styles.resultValue}>
                        {formatCurrency(calculations.distributorGrossProfitDI, 'USD')}
                      </span>
                    </div>
                    <div style={styles.resultRow}>
                      <span style={styles.resultLabel}>Tariff Payments</span>
                      <span style={styles.resultValue}>
                        {formatCurrency(calculations.distributorTariffTotalDI || 0, 'USD')}
                      </span>
                    </div>
                  </div>
                  
                  {/* Stateside Profits */}
                  <div>
                    <div style={styles.modelTypeLabel}>Stateside</div>
                    <div style={styles.resultRow}>
                      <span style={styles.resultLabel}>Supplier Gross Profit</span>
                      <span style={styles.resultValue}>
                        {formatCurrency(calculations.supplierGrossProfitSS, 'USD')}
                      </span>
                    </div>
                    <div style={styles.resultRow}>
                      <span style={styles.resultLabel}>Distributor Gross Profit</span>
                      <span style={styles.resultValue}>
                        {formatCurrency(calculations.distributorGrossProfitSS, 'USD')}
                      </span>
                    </div>
                    <div style={styles.resultRow}>
                      <span style={styles.resultLabel}>Tariff Payments</span>
                      <span style={styles.resultValue}>
                        {formatCurrency(calculations.supplierTariffTotal || 0, 'USD')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* DIRECT IMPORT TAB */}
        {activeTab === 'di' && (
          <div>
            <div style={styles.resultsSection}>
              <h3 style={styles.sectionTitle}>Direct Import Pricing Details</h3>
              <div style={styles.resultsGrid}>
                <div style={styles.fullWidth}>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>Base Cost in {formData.currency}</span>
                    <span style={styles.resultValue}>
                      {formatCurrency(calculations.baseCasePriceOriginal, formData.currency)} per case
                    </span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>Base Cost in USD</span>
                    <span style={styles.resultValue}>
                      {formatCurrency(calculations.caseCostUSD, 'USD')} per case
                    </span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>Supplier Margin ({formData.supplierMargin}%)</span>
                    <span style={styles.resultValue}>
                      {formatCurrency(calculations.supplierFobDI_USD - calculations.caseCostUSD, 'USD')} per case
                    </span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>Supplier FOB</span>
                    <span style={styles.resultValue}>
                      {formatCurrency(calculations.supplierFobDI_USD, 'USD')} per case
                    </span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>Tariff ({formData.tariff}%)</span>
                    <span style={styles.resultValue}>
                      {formatCurrency(calculations.distributorTariffPerCaseDI, 'USD')} per case
                    </span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>DI Logistics</span>
                    <span style={styles.resultValue}>
                      {formatCurrency(formData.diLogistics, 'USD')} per case
                    </span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>Distributor Laid-In Cost</span>
                    <span style={styles.resultValue}>
                      {formatCurrency(calculations.distributorLaidInCostDI_USD, 'USD')} per case
                    </span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>Distributor Margin ({formData.distributorMargin}%)</span>
                    <span style={styles.resultValue}>
                      {formatCurrency(calculations.distCaseWholesaleDI_USD - calculations.distributorLaidInCostDI_USD, 'USD')} per case
                    </span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>Distributor Wholesale Price</span>
                    <span style={styles.resultValue}>
                      {formatCurrency(calculations.distCaseWholesaleDI_USD, 'USD')} per case
                    </span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>Distributor Bottle Wholesale</span>
                    <span style={styles.resultValue}>
                      {formatCurrency(calculations.distBottleWholesaleDI_USD, 'USD')} per bottle
                    </span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>Retailer Margin ({formData.retailerMargin}%)</span>
                    <span style={styles.resultValue}>
                      {formatCurrency(calculations.srpDi_USD - calculations.distBottleWholesaleDI_USD, 'USD')} per bottle
                    </span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={{...styles.resultLabel, fontWeight: '600'}}>Suggested Retail Price</span>
                    <span style={{...styles.resultValue, ...styles.highlightedValue}}>
                      {formatCurrency(calculations.srpDi_USD, 'USD')} per bottle
                    </span>
                  </div>
                  
                  {/* BTG pricing */}
                  <div style={{...styles.resultRow, marginTop: '1rem'}}>
                    <span style={styles.resultLabel}>By-The-Glass Distributor Price</span>
                    <span style={styles.resultValue}>
                      {formatCurrency(calculations.distBtgPriceDI_USD, 'USD')} per bottle
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* STATESIDE TAB */}
        {activeTab === 'ss' && (
          <div>
            <div style={styles.resultsSection}>
              <h3 style={styles.sectionTitle}>Stateside Pricing Details</h3>
              <div style={styles.resultsGrid}>
                <div style={styles.fullWidth}>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>Base Cost in {formData.currency}</span>
                    <span style={styles.resultValue}>
                      {formatCurrency(calculations.baseCasePriceOriginal, formData.currency)} per case
                    </span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>Base Cost in USD</span>
                    <span style={styles.resultValue}>
                      {formatCurrency(calculations.caseCostUSD, 'USD')} per case
                    </span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>Tariff ({formData.tariff}%)</span>
                    <span style={styles.resultValue}>
                      {formatCurrency(calculations.supplierTariffPerCase, 'USD')} per case
                    </span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>DI Logistics</span>
                    <span style={styles.resultValue}>
                      {formatCurrency(formData.diLogistics, 'USD')} per case
                    </span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>Supplier Laid-In Cost</span>
                    <span style={styles.resultValue}>
                      {formatCurrency(calculations.supplierLaidInCostSS_USD, 'USD')} per case
                    </span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>Supplier Margin ({formData.supplierMargin}%)</span>
                    <span style={styles.resultValue}>
                      {formatCurrency(calculations.supplierFobSS_USD - calculations.supplierLaidInCostSS_USD, 'USD')} per case
                    </span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>Supplier FOB</span>
                    <span style={styles.resultValue}>
                      {formatCurrency(calculations.supplierFobSS_USD, 'USD')} per case
                    </span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>Stateside Logistics</span>
                    <span style={styles.resultValue}>
                      {formatCurrency(formData.statesideLogistics, 'USD')} per case
                    </span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>Distributor Laid-In Cost</span>
                    <span style={styles.resultValue}>
                      {formatCurrency(calculations.distributorLaidInCostSS_USD, 'USD')} per case
                    </span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>Distributor Margin ({formData.distributorMargin}%)</span>
                    <span style={styles.resultValue}>
                      {formatCurrency(calculations.distCaseWholesaleSS_USD - calculations.distributorLaidInCostSS_USD, 'USD')} per case
                    </span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>Distributor Wholesale Price</span>
                    <span style={styles.resultValue}>
                      {formatCurrency(calculations.distCaseWholesaleSS_USD, 'USD')} per case
                    </span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>Distributor Bottle Wholesale</span>
                    <span style={styles.resultValue}>
                      {formatCurrency(calculations.distBottleWholesaleSS_USD, 'USD')} per bottle
                    </span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={styles.resultLabel}>Retailer Margin ({formData.retailerMargin}%)</span>
                    <span style={styles.resultValue}>
                      {formatCurrency(calculations.srpSs_USD - calculations.distBottleWholesaleSS_USD, 'USD')} per bottle
                    </span>
                  </div>
                  <div style={styles.resultRow}>
                    <span style={{...styles.resultLabel, fontWeight: '600'}}>Suggested Retail Price</span>
                    <span style={{...styles.resultValue, ...styles.highlightedValue}}>
                      {formatCurrency(calculations.srpSs_USD, 'USD')} per bottle
                    </span>
                  </div>
                  
                  {/* BTG pricing */}
                  <div style={{...styles.resultRow, marginTop: '1rem'}}>
                    <span style={styles.resultLabel}>By-The-Glass Distributor Price</span>
                    <span style={styles.resultValue}>
                      {formatCurrency(calculations.distBtgPriceSS_USD, 'USD')} per bottle
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPanel;