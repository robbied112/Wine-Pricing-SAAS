// components/Calculator/InputPanel.jsx

import React, { useState } from 'react';
import { RefreshCw, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

const InputPanel = ({ 
  formData,
  handleInputChange,
  handleCurrencyChange,
  handleSelectChange,
  handleCustomRateToggle,
  handleRefreshRate,
  isExchangeRateLoading,
  exchangeRateError,
  showAdvanced,
  setShowAdvanced,
  errors,
  reverseTargetModel,
  handleReverseTargetChange,
  CURRENCIES,
  BOTTLE_SIZES,
  CASE_PACK_SIZES,
}) => {
  const [hoveredButton, setHoveredButton] = useState(null);

  // Handle button hovering
  const handleButtonHover = (button, isHovering) => {
    setHoveredButton(isHovering ? button : null);
  };

  // Utility function for getting input style with error state
  const getInputStyle = (hasError) => {
    return {
      width: '100%',
      padding: '0.5rem',
      borderRadius: '0.25rem',
      border: `1px solid ${hasError ? '#e53e3e' : '#cbd5e0'}`,
      fontSize: '0.875rem',
      transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
    };
  };

  return (
    <div style={styles.panel}>
      <div style={styles.header}>
        <h2 style={styles.title}>Input Data</h2>
      </div>
      
      <div style={styles.body}>
        {/* Calculation Mode */}
        <div style={styles.formGroup}>
          <label style={styles.label}>Calculation Mode</label>
          <div style={styles.modeSelector}>
            <button 
              type="button" 
              style={{
                ...styles.modeButton,
                ...(formData.calculationMode === 'forward' ? styles.modeButtonActive : {})
              }}
              onClick={() => handleSelectChange({ target: { name: 'calculationMode', value: 'forward' } })}
            >
              Forward
            </button>
            <button 
              type="button" 
              style={{
                ...styles.modeButton,
                ...(formData.calculationMode === 'reverse' ? styles.modeButtonActive : {})
              }}
              onClick={() => handleSelectChange({ target: { name: 'calculationMode', value: 'reverse' } })}
            >
              Reverse
            </button>
          </div>
        </div>
        
        {/* Wine Name */}
        <div style={styles.formGroup}>
          <label htmlFor="wineName" style={styles.label}>Wine Name</label>
          <input
            id="wineName"
            name="wineName"
            type="text"
            value={formData.wineName}
            onChange={handleInputChange}
            style={getInputStyle(errors.wineName)}
            placeholder="Enter wine name"
          />
          {errors.wineName && <p style={styles.errorMessage}>{errors.wineName}</p>}
        </div>
        
        {/* Currency Selection */}
        <div style={styles.formGroup}>
          <label htmlFor="currency" style={styles.label}>Currency</label>
          <select
            id="currency"
            name="currency"
            value={formData.currency}
            onChange={handleCurrencyChange}
            style={styles.select}
          >
            {CURRENCIES.map(curr => (
              <option key={curr} value={curr}>{curr}</option>
            ))}
          </select>
        </div>
        
        {/* Cost Input Section - Conditional Display */}
        {formData.calculationMode === 'forward' ? (
          <div style={styles.grid}>
            {/* Bottle Cost */}
            <div style={styles.formGroup}>
              <label htmlFor="bottleCost" style={styles.label}>Bottle Cost ({formData.currency})</label>
              <div style={styles.inlineWrapper}>
                <input
                  id="bottleCost"
                  name="bottleCost"
                  type="text"
                  value={formData.bottleCost}
                  onChange={handleInputChange}
                  style={getInputStyle(errors.bottleCost || errors.costInput)}
                  placeholder="0.00"
                />
              </div>
            </div>
            
            {/* Case Price */}
            <div style={styles.formGroup}>
              <label htmlFor="casePrice" style={styles.label}>Case Price ({formData.currency})</label>
              <div style={styles.inlineWrapper}>
                <input
                  id="casePrice"
                  name="casePrice"
                  type="text"
                  value={formData.casePrice}
                  onChange={handleInputChange}
                  style={getInputStyle(errors.casePrice || errors.costInput)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        ) : (
          /* Target SRP for Reverse Mode */
          <div style={styles.formGroup}>
            <label htmlFor="targetSrp" style={styles.label}>Target SRP (USD)</label>
            <div style={styles.inlineWrapper}>
              <span style={styles.currencySymbol}>$</span>
              <input
                id="targetSrp"
                name="targetSrp"
                type="text"
                value={formData.targetSrp}
                onChange={handleInputChange}
                style={getInputStyle(errors.targetSrp)}
                placeholder="0.00"
              />
            </div>
            {errors.targetSrp && <p style={styles.errorMessage}>{errors.targetSrp}</p>}
            
            {/* Reverse Target Model Selection */}
            <div style={styles.radioGroup}>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  name="reverseTargetModel"
                  value="SS"
                  checked={reverseTargetModel === 'SS'}
                  onChange={handleReverseTargetChange}
                  style={styles.radio}
                />
                Stateside
              </label>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  name="reverseTargetModel"
                  value="DI"
                  checked={reverseTargetModel === 'DI'}
                  onChange={handleReverseTargetChange}
                  style={styles.radio}
                />
                Direct Import
              </label>
            </div>
          </div>
        )}
        
        {/* Case Pack and Bottle Size */}
        <div style={styles.grid}>
          <div style={styles.formGroup}>
            <label htmlFor="casePackSize" style={styles.label}>Case Pack Size</label>
            <select
              id="casePackSize"
              name="casePackSize"
              value={formData.casePackSize}
              onChange={handleSelectChange}
              style={styles.select}
            >
              {CASE_PACK_SIZES.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
          
          <div style={styles.formGroup}>
            <label htmlFor="bottleSize" style={styles.label}>Bottle Size</label>
            <select
              id="bottleSize"
              name="bottleSize"
              value={formData.bottleSize}
              onChange={handleSelectChange}
              style={styles.select}
            >
              {BOTTLE_SIZES.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Exchange Rate Section */}
        {formData.currency === 'EUR' && (
          <div style={styles.formGroup}>
            <div style={{...styles.formGroupInline, marginBottom: '0.5rem'}}>
              <label htmlFor="exchangeRate" style={{...styles.label, marginBottom: 0}}>
                Exchange Rate (EUR→USD)
              </label>
              <button
                type="button"
                onClick={handleRefreshRate}
                disabled={isExchangeRateLoading || formData.useCustomExchangeRate}
                style={{
                  ...styles.refreshButton,
                  opacity: (isExchangeRateLoading || formData.useCustomExchangeRate) ? 0.5 : 1,
                  cursor: (isExchangeRateLoading || formData.useCustomExchangeRate) ? 'not-allowed' : 'pointer'
                }}
                title="Refresh exchange rate from API"
              >
                <RefreshCw 
                  style={{
                    ...styles.icon,
                    ...(isExchangeRateLoading ? styles.spinner : {})
                  }}
                />
              </button>
            </div>
            
            <div style={styles.inlineWrapper}>
              <input
                id="exchangeRate"
                name="exchangeRate"
                type="text"
                value={!formData.useCustomExchangeRate ? formData.exchangeRate : formData.customExchangeRate}
                onChange={handleInputChange}
                disabled={!formData.useCustomExchangeRate}
                style={{
                  ...getInputStyle(errors.exchangeRate || errors.customExchangeRate),
                  backgroundColor: !formData.useCustomExchangeRate ? '#f7fafc' : '#fff'
                }}
              />
            </div>
            
            {exchangeRateError && (
              <div style={{...styles.errorMessage, display: 'flex', alignItems: 'center', marginTop: '0.5rem'}}>
                <AlertCircle style={{...styles.icon, marginRight: '0.25rem'}} />
                {exchangeRateError}
              </div>
            )}
            
            <label style={{...styles.checkboxLabel, marginTop: '0.5rem'}}>
              <input
                type="checkbox"
                name="useCustomExchangeRate"
                checked={formData.useCustomExchangeRate}
                onChange={handleCustomRateToggle}
                style={styles.checkbox}
              />
              Use manual exchange rate
            </label>
            
            <div style={styles.formGroup}>
              <label htmlFor="exchangeBuffer" style={styles.label}>Exchange Rate Buffer (%)</label>
              <input
                id="exchangeBuffer"
                name="exchangeBuffer"
                type="text"
                value={formData.exchangeBuffer}
                onChange={handleInputChange}
                style={getInputStyle(errors.exchangeBuffer)}
              />
              {errors.exchangeBuffer && <p style={styles.errorMessage}>{errors.exchangeBuffer}</p>}
            </div>
          </div>
        )}
        
        {/* Basic Margin Inputs */}
        <div style={styles.grid}>
          <div style={styles.formGroup}>
            <label htmlFor="supplierMargin" style={styles.label}>Supplier Margin (%)</label>
            <input
              id="supplierMargin"
              name="supplierMargin"
              type="text"
              value={formData.supplierMargin}
              onChange={handleInputChange}
              style={getInputStyle(errors.supplierMargin)}
            />
            {errors.supplierMargin && <p style={styles.errorMessage}>{errors.supplierMargin}</p>}
          </div>
          
          <div style={styles.formGroup}>
            <label htmlFor="distributorMargin" style={styles.label}>Distributor Margin (%)</label>
            <input
              id="distributorMargin"
              name="distributorMargin"
              type="text"
              value={formData.distributorMargin}
              onChange={handleInputChange}
              style={getInputStyle(errors.distributorMargin)}
            />
            {errors.distributorMargin && <p style={styles.errorMessage}>{errors.distributorMargin}</p>}
          </div>
          
          <div style={styles.formGroup}>
            <label htmlFor="retailerMargin" style={styles.label}>Retailer Margin (%)</label>
            <input
              id="retailerMargin"
              name="retailerMargin"
              type="text"
              value={formData.retailerMargin}
              onChange={handleInputChange}
              style={getInputStyle(errors.retailerMargin)}
            />
            {errors.retailerMargin && <p style={styles.errorMessage}>{errors.retailerMargin}</p>}
          </div>
          
          <div style={styles.formGroup}>
            <label htmlFor="distributorBtgMargin" style={styles.label}>Dist. BTG Margin (%)</label>
            <input
              id="distributorBtgMargin"
              name="distributorBtgMargin"
              type="text"
              value={formData.distributorBtgMargin}
              onChange={handleInputChange}
              style={getInputStyle(errors.distributorBtgMargin)}
            />
            {errors.distributorBtgMargin && <p style={styles.errorMessage}>{errors.distributorBtgMargin}</p>}
          </div>
        </div>
        
        {/* Round to 99¢ Checkbox */}
        <div style={styles.formGroup}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="roundSrp"
              checked={formData.roundSrp}
              onChange={handleInputChange}
              style={styles.checkbox}
            />
            Round SRP to $X.99
          </label>
        </div>
        
        {/* Cases Sold for Profit Calculation */}
        <div style={styles.formGroup}>
          <label htmlFor="casesSold" style={styles.label}>Cases Sold (annual projection)</label>
          <input
            id="casesSold"
            name="casesSold"
            type="text"
            value={formData.casesSold}
            onChange={handleInputChange}
            style={getInputStyle(errors.casesSold)}
            placeholder="Optional - for profit calculation"
          />
          {errors.casesSold && <p style={styles.errorMessage}>{errors.casesSold}</p>}
        </div>
      </div>
      
      {/* Advanced Settings Toggle Section */}
      <div 
        style={styles.advancedHeader}
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        <h3 style={styles.advancedTitle}>Advanced Settings</h3>
        {showAdvanced ? <ChevronUp style={styles.icon} /> : <ChevronDown style={styles.icon} />}
      </div>
      
      {/* Advanced Settings Content */}
      <div style={{...styles.advancedBody, ...(showAdvanced ? {} : styles.hidden)}}>
        <div style={styles.grid}>
          <div style={styles.formGroup}>
            <label htmlFor="diLogistics" style={styles.label}>DI Logistics ($/case)</label>
            <div style={styles.inlineWrapper}>
              <span style={styles.currencySymbol}>$</span>
              <input
                id="diLogistics"
                name="diLogistics"
                type="text"
                value={formData.diLogistics}
                onChange={handleInputChange}
                style={getInputStyle(errors.diLogistics)}
              />
            </div>
            {errors.diLogistics && <p style={styles.errorMessage}>{errors.diLogistics}</p>}
          </div>
          
          <div style={styles.formGroup}>
            <label htmlFor="tariff" style={styles.label}>Tariff (%)</label>
            <input
              id="tariff"
              name="tariff"
              type="text"
              value={formData.tariff}
              onChange={handleInputChange}
              style={getInputStyle(errors.tariff)}
            />
            {errors.tariff && <p style={styles.errorMessage}>{errors.tariff}</p>}
          </div>
          
          <div style={styles.formGroup}>
            <label htmlFor="statesideLogistics" style={styles.label}>Stateside Logistics ($/case)</label>
            <div style={styles.inlineWrapper}>
              <span style={styles.currencySymbol}>$</span>
              <input
                id="statesideLogistics"
                name="statesideLogistics"
                type="text"
                value={formData.statesideLogistics}
                onChange={handleInputChange}
                style={getInputStyle(errors.statesideLogistics)}
              />
            </div>
            {errors.statesideLogistics && <p style={styles.errorMessage}>{errors.statesideLogistics}</p>}
          </div>
        </div>
      </div>
      
      {/* General Error Message */}
      {errors.calculation && (
        <div style={{padding: '1rem', backgroundColor: '#FED7D7', color: '#9B2C2C', marginTop: '1rem', borderRadius: '0.25rem'}}>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <AlertCircle style={{...styles.icon, marginRight: '0.5rem'}} />
            <span>{errors.calculation}</span>
          </div>
        </div>
      )}
    </div>
  );
};

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
  formGroup: {
    marginBottom: '1.5rem',
  },
  formGroupInline: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '500',
    color: '#4a5568',
    fontSize: '0.875rem',
  },
  input: {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '0.25rem',
    border: '1px solid #cbd5e0',
    fontSize: '0.875rem',
    transition: 'border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
  },
  inputError: {
    borderColor: '#e53e3e',
  },
  select: {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '0.25rem',
    border: '1px solid #cbd5e0',
    fontSize: '0.875rem',
    backgroundColor: '#fff',
    appearance: 'none',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.5rem center',
    backgroundSize: '1.5em 1.5em',
    paddingRight: '2rem',
  },
  checkbox: {
    marginRight: '0.5rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '0.5rem',
    fontWeight: '500',
    color: '#4a5568',
    fontSize: '0.875rem',
  },
  modeSelector: {
    display: 'flex',
    marginBottom: '1.5rem',
    borderRadius: '0.25rem',
    overflow: 'hidden',
    border: '1px solid #cbd5e0',
  },
  modeButton: {
    flex: 1,
    padding: '0.75rem',
    textAlign: 'center',
    backgroundColor: '#edf2f7',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500',
    border: 'none',
    transition: 'background-color 0.15s ease-in-out',
  },
  modeButtonActive: {
    backgroundColor: '#7e3af2',
    color: '#fff',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  fullWidth: {
    gridColumn: '1 / -1',
  },
  errorMessage: {
    color: '#e53e3e',
    fontSize: '0.75rem',
    marginTop: '0.25rem',
  },
  advancedHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    cursor: 'pointer',
    borderTop: '1px solid #e2e8f0',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f7fafc',
  },
  advancedTitle: {
    fontWeight: '600',
    color: '#4a5568',
    margin: 0,
  },
  advancedBody: {
    padding: '1.5rem',
  },
  hidden: {
    display: 'none',
  },
  refreshButton: {
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.25rem',
    borderRadius: '0.25rem',
    color: '#7e3af2',
  },
  icon: {
    width: '1rem',
    height: '1rem',
  },
  inlineWrapper: {
    display: 'flex',
    alignItems: 'center',
  },
  currencySymbol: {
    marginRight: '0.5rem',
    fontWeight: '500',
  },
  radioGroup: {
    display: 'flex',
    gap: '1rem',
    marginTop: '0.5rem',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.875rem',
    cursor: 'pointer',
  },
  radio: {
    marginRight: '0.25rem',
  },
  spinner: {
    animation: 'spin 1s linear infinite',
  }
};

export default InputPanel;