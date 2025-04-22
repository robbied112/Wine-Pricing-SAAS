// components/Calculator/WinePricingCalculator.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Save, Download, Printer, RefreshCw, AlertCircle, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';

// Import CSS for animations
import '../../styles/calculator.css';

// --- Constants ---
const CURRENCIES = ['EUR', 'USD'];
const BOTTLE_SIZES = ['750ml', '375ml', '500ml', '1L', '1.5L', '3L'];
const CASE_PACK_SIZES = [12, 6, 3, 1];
const DEFAULT_EXCHANGE_RATE = '1.0750';
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hours
const CACHE_KEY_OER = 'cachedRateEURUSD_OER';
const CACHE_TIMESTAMP_KEY_OER = 'lastFetchTime_OER';
const CALCULATION_TIMEOUT = 300; // Debounce timeout for calculations

// --- Helper Functions ---
const formatCurrency = (value, currency = 'USD', maximumFractionDigits = 2) => {
  const number = Number(value);
  if (value === null || value === undefined || (isNaN(number) && typeof value !== 'string')) return '$--.--';
  const actualNumber = isNaN(number) ? parseFloat(value) : number;
  if (isNaN(actualNumber)) return '$--.--';
  try {
    return actualNumber.toLocaleString('en-US', { style: 'currency', currency: currency, minimumFractionDigits: 2, maximumFractionDigits: maximumFractionDigits });
  } catch (e) {
    console.error("Currency formatting error:", e);
    return `$${actualNumber.toFixed(2)}`;
  }
};
// Add this helper function at the top with your other helper functions
const roundToNearest99 = (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) return 0;
  const whole = Math.floor(num);
  return num - whole < 0.40 ? Math.max(0, whole - 1 + 0.99) : whole + 0.99;
};
// --- Default Form Data ---
const DEFAULT_FORM_DATA = {
  calculationMode: 'forward',
  wineName: '',
  currency: 'EUR',
  bottleCost: '',
  casePrice: '',
  casePackSize: 12,
  bottleSize: '750ml',
  exchangeRate: DEFAULT_EXCHANGE_RATE,
  exchangeBuffer: 5,
  useCustomExchangeRate: false,
  customExchangeRate: DEFAULT_EXCHANGE_RATE,
  diLogistics: 13,
  tariff: 0,
  statesideLogistics: 10,
  supplierMargin: 30,
  distributorMargin: 30,
  distributorBtgMargin: 27,
  retailerMargin: 33,
  roundSrp: true,
  casesSold: '',
  targetSrp: '',
};

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  headerBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem'
  },
  actionButtons: {
    display: 'flex',
    marginLeft: 'auto'
  },
  actionButton: {
    padding: '0.5rem',
    color: '#4B5563',
    backgroundColor: 'transparent',
    borderRadius: '0.375rem',
    border: 'none',
    cursor: 'pointer',
    marginLeft: '0.5rem'
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1.5rem'
  },
  panel: {
    backgroundColor: '#fff',
    borderRadius: '0.5rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    overflow: 'hidden'
  },
  panelHeader: {
    padding: '1rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  panelTitle: {
    fontWeight: 600,
    fontSize: '1.25rem',
    color: '#1a202c',
    margin: 0
  },
  panelBody: {
    padding: '1.5rem'
  },
  formGroup: {
    marginBottom: '1.5rem'
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 500,
    color: '#4a5568',
    fontSize: '0.875rem'
  },
  input: {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '0.25rem',
    border: '1px solid #cbd5e0',
    fontSize: '0.875rem'
  },
  select: {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '0.25rem',
    border: '1px solid #cbd5e0',
    fontSize: '0.875rem',
    backgroundColor: '#fff'
  },
  modeSelector: {
    display: 'flex',
    marginBottom: '1.5rem',
    borderRadius: '0.25rem',
    overflow: 'hidden',
    border: '1px solid #cbd5e0'
  },
  modeButton: {
    flex: 1,
    padding: '0.75rem',
    textAlign: 'center',
    backgroundColor: '#edf2f7',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 500,
    border: 'none'
  },
  modeButtonActive: {
    backgroundColor: '#7e3af2',
    color: '#fff'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    fontWeight: 500,
    fontSize: '0.875rem',
    color: '#4a5568'
  },
  checkbox: {
    marginRight: '0.5rem'
  },
  advancedHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    cursor: 'pointer',
    borderTop: '1px solid #e2e8f0',
    backgroundColor: '#f7fafc'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #E2E8F0'
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem 1.5rem',
    color: '#718096'
  },
  emptyTitle: {
    fontWeight: 600,
    fontSize: '1.25rem',
    marginBottom: '0.5rem',
    color: '#4a5568'
  },
  resultRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0',
    borderBottom: '1px solid #EDF2F7'
  },
  resultLabel: {
    color: '#4A5568',
    fontSize: '0.875rem'
  },
  resultValue: {
    fontWeight: 500,
    fontSize: '0.875rem',
    color: '#2D3748'
  },
  highlightedValue: {
    fontWeight: 600,
    fontSize: '1rem',
    color: '#7e3af2'
  },
  sectionTitle: {
    fontWeight: 600,
    fontSize: '1.125rem',
    color: '#2D3748',
    marginBottom: '0rem',
    flex: '1'
  }
};

const WinePricingCalculator = () => {
  // State with default form data
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [isDesktop, setIsDesktop] = useState(false);
  
  // Other state variables
  const [calculations, setCalculations] = useState({});
  const [errors, setErrors] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [isExchangeRateLoading, setIsExchangeRateLoading] = useState(false);
  const [exchangeRateError, setExchangeRateError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showGrossProfit, setShowGrossProfit] = useState(false);
  const [reverseTargetModel, setReverseTargetModel] = useState('SS');
  const hasCalculations = calculations && (calculations.srpDi_USD || calculations.srpSs_USD);
  const [showProfitSummary, setShowProfitSummary] = useState(true);
  const [showInputSummary, setShowInputSummary] = useState(true);

  // Basic handlers
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
  }, []);
  
  const handleSelectChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleModeChange = (mode) => {
    setFormData(prev => ({ 
      ...prev, 
      calculationMode: mode,
      targetSrp: mode === 'reverse' ? '' : prev.targetSrp
    }));
  };
  
  const handleReverseTargetChange = (e) => {
    setReverseTargetModel(e.target.value);
  };
  
  // NEW: Handler for currency changes that resets any exchange rate errors when leaving EUR
  const handleCurrencyChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: value,
      ...(prev.currency === 'EUR' && value !== 'EUR' ? { exchangeRateError: null } : {})
    }));
  };

  // NEW: Handler for toggling custom (manual) exchange rate
  const handleCustomRateToggle = (e) => {
    const { checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      useCustomExchangeRate: checked,
      ...(checked && { customExchangeRate: prev.exchangeRate })
    }));
  };

  // Mock calculation function (placeholder for actual calculation)
  // Replace the mock calculatePricing function with your full implementation if needed.
  const calculatePricing = useCallback(() => {
    console.log("Calculating pricing with formData:", formData);
    console.log("Using reverseTargetModel:", reverseTargetModel);
    setIsCalculating(true);
    setErrors(prev => ({ ...prev, calculation: null }));

    const bottleCost = parseFloat(formData.bottleCost) || 0;
    const casePrice = parseFloat(formData.casePrice) || 0;
    const casePack = parseInt(formData.casePackSize, 10) || 12;
    const exchangeBuffer = parseFloat(formData.exchangeBuffer) || 0;
    const diLogistics = parseFloat(formData.diLogistics) || 0;
    const tariffPercent = parseFloat(formData.tariff) || 0;
    const statesideLogistics = parseFloat(formData.statesideLogistics) || 0;
    const supplierMarginPercent = parseFloat(formData.supplierMargin) || 0;
    const distributorMarginPercent = parseFloat(formData.distributorMargin) || 0;
    const distBtgMarginPercent = parseFloat(formData.distributorBtgMargin) || 0;
    const retailerMarginPercent = parseFloat(formData.retailerMargin) || 0;
    const casesSold = parseInt(formData.casesSold, 10) || 0;
    const targetSrp = parseFloat(formData.targetSrp) || 0;
    const customRate = parseFloat(formData.customExchangeRate);
    const fetchedRate = parseFloat(formData.exchangeRate);

    let effectiveExchangeRate;
    if (formData.currency === 'USD') { 
      effectiveExchangeRate = 1; 
    } else if (formData.useCustomExchangeRate) {
      if (!isNaN(customRate) && customRate > 0) { 
        effectiveExchangeRate = customRate; 
      } else { 
        setErrors(prev => ({ 
          ...prev, 
          customExchangeRate: "Invalid Manual Rate", 
          calculation: "Calculation stopped: Invalid Manual Rate." 
        })); 
        setIsCalculating(false); 
        setCalculations({}); 
        return; 
      }
    } else {
      if (!isNaN(fetchedRate) && fetchedRate > 0) { 
        effectiveExchangeRate = fetchedRate * (1 + exchangeBuffer / 100); 
      } else { 
        setErrors(prev => ({ 
          ...prev, 
          exchangeRate: "Invalid Fetched Rate", 
          calculation: "Calculation stopped: Invalid Fetched Rate." 
        })); 
        setIsCalculating(false); 
        setCalculations({}); 
        return; 
      }
    }

    if (isNaN(effectiveExchangeRate) || effectiveExchangeRate <= 0) { 
      setErrors(prev => ({ ...prev, calculation: "Invalid effective exchange rate." })); 
      setIsCalculating(false); 
      setCalculations({}); 
      return; 
    }

    let baseBottleCostOriginal = null;
    let baseCasePriceOriginal = null;
    let caseCostUSD = 0;

    try {
      if (formData.calculationMode === 'forward') {
        let baseCostOriginal = 0;
        if (bottleCost > 0) { 
          baseCostOriginal = bottleCost * casePack; 
        } else if (casePrice > 0) { 
          baseCostOriginal = casePrice; 
        } else {
          if (formData.bottleCost !== '' || formData.casePrice !== '') { 
            setErrors(prev => ({ ...prev, costInput: `Enter valid ${formData.currency} Bottle Cost or Case Price.` })); 
          } else { 
            setErrors(prev => ({ ...prev, costInput: null })); 
          }
          setIsCalculating(false); 
          setCalculations({}); 
          return;
        }
        
        if (baseCostOriginal <= 0) throw new Error(`Invalid non-positive ${formData.currency} cost input.`);
        caseCostUSD = baseCostOriginal * effectiveExchangeRate;
        baseCasePriceOriginal = baseCostOriginal;
        baseBottleCostOriginal = baseCostOriginal / casePack;
      } else { // Reverse Mode
        if (targetSrp <= 0) {
          if (formData.targetSrp !== '') { 
            setErrors(prev => ({ ...prev, targetSrp: "Enter valid Target SRP (USD > 0)." })); 
          } else { 
            setErrors(prev => ({ ...prev, targetSrp: null })); 
          }
          setIsCalculating(false); 
          setCalculations({}); 
          return;
        }
        
        const marginCheckReverse = (margin, name) => { 
          if (isNaN(margin) || margin < 0 || margin >= 100) 
            throw new Error(`Invalid ${name} (${margin}%). Must be 0-99.99.`); 
          return margin / 100; 
        };
        
        const retailerMarginFrac = marginCheckReverse(retailerMarginPercent, "Retailer Margin");
        const distributorMarginFrac = marginCheckReverse(distributorMarginPercent, "Distributor Margin");
        const supplierMarginFrac = marginCheckReverse(supplierMarginPercent, "Supplier Margin");
        const tariffFrac = tariffPercent / 100;
        
        if (isNaN(tariffFrac) || tariffFrac < 0) throw new Error("Invalid Tariff percentage.");
        
        const effectiveSrp = formData.roundSrp ? roundToNearest99(targetSrp) : targetSrp;
        let distWholesaleBottle_USD = effectiveSrp * (1 - retailerMarginFrac);
        
        if (isNaN(distWholesaleBottle_USD) || distWholesaleBottle_USD <= 0) 
          throw new Error("Retailer margin yields non-positive wholesale cost.");
        
        const distCaseWholesale_USD = distWholesaleBottle_USD * casePack;
        const distLaidInCostPreLogisticsAndTariff_USD = distCaseWholesale_USD * (1 - distributorMarginFrac);
        
        if (isNaN(distLaidInCostPreLogisticsAndTariff_USD) || distLaidInCostPreLogisticsAndTariff_USD <= 0) 
          throw new Error("Distributor margin yields non-positive pre-cost laid-in value.");
        
        let supplierFob_USD;
        if (reverseTargetModel === 'SS') {
          const supplierFobSS_PreMargin_USD = distLaidInCostPreLogisticsAndTariff_USD - statesideLogistics;
          if (isNaN(supplierFobSS_PreMargin_USD) || supplierFobSS_PreMargin_USD <= 0) {
            setErrors(prev => ({ 
              ...prev, 
              calculation: "Warning: Stateside logistics cost exceeds distributor pre-cost value. Try increasing Target SRP or reducing Stateside Logistics costs.",
              statesideLogistics: "Cost too high for target price" 
            }));
            supplierFob_USD = 0.01;
          } else {
            supplierFob_USD = supplierFobSS_PreMargin_USD * (1 - supplierMarginFrac);
            
            if (isNaN(supplierFob_USD) || supplierFob_USD <= 0) {
              setErrors(prev => ({ 
                ...prev, 
                calculation: "Warning: Supplier margin yields non-positive SS base FOB cost. Try increasing Target SRP or reducing margins.",
                supplierMargin: "Margin too high for this price point"
              }));
              supplierFob_USD = 0.01;
            }
          }
        } else {
          supplierFob_USD = distLaidInCostPreLogisticsAndTariff_USD * (1 - supplierMarginFrac);
          
          if (isNaN(supplierFob_USD) || supplierFob_USD <= 0) {
            setErrors(prev => ({ 
              ...prev, 
              calculation: "Warning: Supplier margin yields non-positive DI base FOB cost. Try increasing Target SRP or reducing Supplier Margin.",
              supplierMargin: "Margin too high for this price point" 
            }));
            supplierFob_USD = 0.01;
          }
        }
        
        if (reverseTargetModel === 'DI') {
          caseCostUSD = supplierFob_USD / (1 / (1 - supplierMarginFrac));
          if (isNaN(caseCostUSD)) {
            setErrors(prev => ({ 
              ...prev, 
              calculation: "Warning: Error deriving base USD cost from DI target. Check input values.",
            }));
            caseCostUSD = 0.01;
          }
        } else {
          const term1 = supplierFob_USD * (1 - supplierMarginFrac);
          const term2 = term1 - diLogistics;
          caseCostUSD = term2 / (1 + tariffFrac);
          if (isNaN(caseCostUSD)) {
            setErrors(prev => ({ 
              ...prev, 
              calculation: "Warning: Error deriving base USD cost from SS target. Check input values.",
            }));
            caseCostUSD = 0.01;
          }
        }
        
        if (isNaN(caseCostUSD) || caseCostUSD < 0) { 
          console.warn("Reverse calculation resulted in non-positive base USD cost."); 
          caseCostUSD = 0; 
        }
        
        if (effectiveExchangeRate <= 0) 
          throw new Error('Cannot convert back: Invalid effective exchange rate (<=0).');
        
        baseCasePriceOriginal = caseCostUSD / effectiveExchangeRate;
        baseBottleCostOriginal = baseCasePriceOriginal / casePack;
        
        setFormData(prev => ({ 
          ...prev, 
          bottleCost: isFinite(baseBottleCostOriginal) ? baseBottleCostOriginal.toFixed(4) : '', 
          casePrice: isFinite(baseCasePriceOriginal) ? baseCasePriceOriginal.toFixed(2) : '' 
        }));
      }
      
      if (baseCasePriceOriginal == null || isNaN(baseCasePriceOriginal) || baseBottleCostOriginal == null || isNaN(baseBottleCostOriginal)) { 
        throw new Error("Could not determine base supplier cost."); 
      }
      
      if (isNaN(caseCostUSD) || caseCostUSD < 0) { 
        console.warn("Base USD cost is invalid or negative."); 
        caseCostUSD = 0; 
      }

      const marginCheck = (margin, name) => { 
        if (isNaN(margin) || margin >= 100 || margin < 0) 
          throw new Error(`Invalid ${name} (${margin}%). Must be 0-99.99.`); 
        return margin / 100; 
      };
      
      const supplierMargin = marginCheck(supplierMarginPercent, "Supplier Margin");
      const distributorMargin = marginCheck(distributorMarginPercent, "Distributor Margin");
      const distBtgMargin = marginCheck(distBtgMarginPercent, "Distributor BTG Margin");
      const retailerMargin = marginCheck(retailerMarginPercent, "Retailer Margin");
      const tariffFrac = tariffPercent / 100;
      
      if (isNaN(tariffFrac) || tariffFrac < 0) 
        throw new Error("Invalid Tariff percentage.");

      const supplierTariffPerCase = caseCostUSD * tariffFrac;
      const supplierFobDI_USD = caseCostUSD / (1 - supplierMargin);
      
      if (!isFinite(supplierFobDI_USD)) 
        throw new Error("Non-finite Supplier FOB DI.");

      let distributorTariffBaseDI_USD = 0;
      let distributorTariffPerCaseDI = 0;
      
      if (tariffFrac > 0) {
        distributorTariffBaseDI_USD = supplierFobDI_USD;
        if (distributorTariffBaseDI_USD > 0 && isFinite(distributorTariffBaseDI_USD)) { 
          distributorTariffPerCaseDI = distributorTariffBaseDI_USD * tariffFrac; 
        } else if (!isFinite(distributorTariffBaseDI_USD)) { 
          console.warn("Cannot calculate DI Tariff: FOB DI non-finite."); 
          distributorTariffPerCaseDI = NaN; 
        }
      }

      const distributorLaidInCostDI_USD = supplierFobDI_USD + distributorTariffPerCaseDI + diLogistics;
      
      if (distributorLaidInCostDI_USD < 0) { 
        console.warn("Warning: DI Laid-In Cost is negative."); 
      }
      
      const distCaseWholesaleDI_USD = distributorLaidInCostDI_USD / (1 - distributorMargin);
      const distBottleWholesaleDI_USD = distCaseWholesaleDI_USD / casePack;
      const distLaidInCostDI_Bottle_USD = distributorLaidInCostDI_USD / casePack;
      
      if (isNaN(distLaidInCostDI_Bottle_USD) || distLaidInCostDI_Bottle_USD < 0) 
        throw new Error("Invalid DI Laid-In Bottle Cost.");
      
      const distBtgPriceDI_USD = distLaidInCostDI_Bottle_USD / (1 - distBtgMargin);

      const supplierLaidInCostSS_USD = caseCostUSD + supplierTariffPerCase + diLogistics;
      
      if (supplierLaidInCostSS_USD < 0) { 
        console.warn("Warning: Base SS Cost Before Margin is negative."); 
      }
      
      const supplierFobSS_USD = supplierLaidInCostSS_USD / (1 - supplierMargin);
      const distributorLaidInCostSS_USD = supplierFobSS_USD + statesideLogistics;
      
      if (distributorLaidInCostSS_USD < 0) { 
        console.warn("Warning: SS Laid-In Cost is negative."); 
      }
      
      const distCaseWholesaleSS_USD = distributorLaidInCostSS_USD / (1 - distributorMargin);
      const distBottleWholesaleSS_USD = distCaseWholesaleSS_USD / casePack;
      const distLaidInCostSS_Bottle_USD = distributorLaidInCostSS_USD / casePack;
      
      if (isNaN(distLaidInCostSS_Bottle_USD) || distLaidInCostSS_Bottle_USD < 0) 
        throw new Error("Invalid SS Laid-In Bottle Cost.");
      
      const distBtgPriceSS_USD = distLaidInCostSS_Bottle_USD / (1 - distBtgMargin);

      const intermediateValues = [
        supplierFobDI_USD, distributorLaidInCostDI_USD, distCaseWholesaleDI_USD, 
        distBottleWholesaleDI_USD, distBtgPriceDI_USD, supplierLaidInCostSS_USD, 
        supplierFobSS_USD, distributorLaidInCostSS_USD, distCaseWholesaleSS_USD, 
        distBottleWholesaleSS_USD, distBtgPriceSS_USD
      ];
      
      if (intermediateValues.some(val => !isFinite(val))) { 
        throw new Error("Non-finite intermediate price."); 
      }

      let srpDi_USD = distBottleWholesaleDI_USD / (1 - retailerMargin);
      let srpSs_USD = distBottleWholesaleSS_USD / (1 - retailerMargin);
      
      if (!isFinite(srpDi_USD) || !isFinite(srpSs_USD)) 
        throw new Error("Retailer margin yields non-finite SRP.");

      let adjustedCaseWholesaleDI_USD = distCaseWholesaleDI_USD;
      let adjustedBottleWholesaleDI_USD = distBottleWholesaleDI_USD;
      let adjustedCaseWholesaleSS_USD = distCaseWholesaleSS_USD;
      let adjustedBottleWholesaleSS_USD = distBottleWholesaleSS_USD;
      let adjustedDistBtgPriceDI_USD = distBtgPriceDI_USD;
      let adjustedDistBtgPriceSS_USD = distBtgPriceSS_USD;
      let originalSrpDi_USD = srpDi_USD, originalSrpSs_USD = srpSs_USD;

      if (formData.roundSrp && formData.calculationMode === 'forward') {
        srpDi_USD = roundToNearest99(srpDi_USD);
        srpSs_USD = roundToNearest99(srpSs_USD);
        adjustedBottleWholesaleDI_USD = srpDi_USD * (1 - retailerMargin);
        adjustedCaseWholesaleDI_USD = adjustedBottleWholesaleDI_USD * casePack;
        adjustedBottleWholesaleSS_USD = srpSs_USD * (1 - retailerMargin);
        adjustedCaseWholesaleSS_USD = adjustedBottleWholesaleSS_USD * casePack;
      } else if (formData.calculationMode === 'reverse') {
        if (reverseTargetModel === 'DI') {
          srpDi_USD = formData.roundSrp ? roundToNearest99(targetSrp) : targetSrp;
          srpSs_USD = distBottleWholesaleSS_USD / (1 - retailerMargin);
          if (formData.roundSrp) srpSs_USD = roundToNearest99(srpSs_USD);
          adjustedBottleWholesaleDI_USD = srpDi_USD * (1 - retailerMargin);
          adjustedCaseWholesaleDI_USD = adjustedBottleWholesaleDI_USD * casePack;
        } else {
          srpSs_USD = formData.roundSrp ? roundToNearest99(targetSrp) : targetSrp;
          srpDi_USD = distBottleWholesaleDI_USD / (1 - retailerMargin);
          if (formData.roundSrp) srpDi_USD = roundToNearest99(srpDi_USD);
          adjustedBottleWholesaleSS_USD = srpSs_USD * (1 - retailerMargin);
          adjustedCaseWholesaleSS_USD = adjustedBottleWholesaleSS_USD * casePack;
        }
      }

      let supplierGrossProfitDI = null, distributorGrossProfitDI = null;
      let supplierGrossProfitSS = null, distributorGrossProfitSS = null;
      let supplierTariffTotal = null;
      let distributorTariffTotalDI = null;

      if (casesSold > 0) {
        supplierGrossProfitDI = (supplierFobDI_USD - caseCostUSD) * casesSold;
        distributorGrossProfitDI = (adjustedCaseWholesaleDI_USD - distributorLaidInCostDI_USD) * casesSold;
        supplierGrossProfitSS = (supplierFobSS_USD - supplierLaidInCostSS_USD) * casesSold;
        distributorGrossProfitSS = (adjustedCaseWholesaleSS_USD - distributorLaidInCostSS_USD) * casesSold;
        supplierTariffTotal = supplierTariffPerCase * casesSold;
        distributorTariffTotalDI = distributorTariffPerCaseDI * casesSold;
      }

      const results = {
        effectiveExchangeRate, 
        caseCostUSD, 
        supplierTariffPerCase, 
        distributorTariffPerCaseDI,
        supplierTariffTotal, 
        distributorTariffTotalDI, 
        supplierFobDI_USD, 
        distributorLaidInCostDI_USD,
        distCaseWholesaleDI_USD: adjustedCaseWholesaleDI_USD, 
        distBottleWholesaleDI_USD: adjustedBottleWholesaleDI_USD,
        distBtgPriceDI_USD: adjustedDistBtgPriceDI_USD, 
        srpDi_USD, 
        originalSrpDi_USD,
        supplierLaidInCostSS_USD, 
        supplierFobSS_USD, 
        distributorLaidInCostSS_USD,
        distCaseWholesaleSS_USD: adjustedCaseWholesaleSS_USD, 
        distBottleWholesaleSS_USD: adjustedBottleWholesaleSS_USD,
        distBtgPriceSS_USD: adjustedDistBtgPriceSS_USD, 
        srpSs_USD, 
        originalSrpSs_USD,
        supplierGrossProfitDI, 
        distributorGrossProfitDI, 
        supplierGrossProfitSS, 
        distributorGrossProfitSS,
        baseBottleCostOriginal, 
        baseCasePriceOriginal,
        reverseTargetModelUsed: formData.calculationMode === 'reverse' ? reverseTargetModel : null
      };

      for (const key in results) { 
        if (typeof results[key] === 'number' && !isFinite(results[key])) { 
          throw new Error(`Non-finite value for ${key}.`); 
        } 
      }

      setCalculations(results);
      setErrors(prev => ({ ...prev, calculation: null }));

    } catch (error) {
      console.error("Calculation Error:", error);
      const errorMessage = (error instanceof Error) ? error.message : "Calculation error.";
      setErrors(prev => ({ ...prev, calculation: errorMessage }));
      setCalculations({});
    } finally {
      setIsCalculating(false);
    }
  }, [formData, reverseTargetModel]);
  
  // Placeholder function for reset
  const handleReset = () => {
    setFormData(DEFAULT_FORM_DATA);
    setCalculations({});
    setErrors({});
    setReverseTargetModel('SS');
    setShowAdvanced(false);
    setShowGrossProfit(false);
    setShowProfitSummary(true);
    setShowInputSummary(true);
  };
  
  // Helper to display field errors with highlighting
  const getInputStyle = (fieldName) => {
    return {
      ...styles.input,
      ...(errors[fieldName] ? {
        borderColor: '#DC2626',
        backgroundColor: '#FEF2F2'
      } : {})
    };
  };
  
  // Check window size for responsive design
  useEffect(() => {
    const checkIfDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    if (typeof window !== 'undefined') {
      checkIfDesktop();
      window.addEventListener('resize', checkIfDesktop);
      return () => window.removeEventListener('resize', checkIfDesktop);
    }
  }, []);
  
  // Effect to trigger calculation
  useEffect(() => {
    const hasRequiredData = 
      (formData.calculationMode === 'forward' && (formData.bottleCost || formData.casePrice)) || 
      (formData.calculationMode === 'reverse' && formData.targetSrp);
    
    if (hasRequiredData) {
      setErrors({});  // Clear any previous errors
      calculatePricing();
    }
  }, [formData, calculatePricing]);
  
  return (
    <div style={styles.container}>
      <div style={styles.headerBar}>
        <h1>Wine Pricing Calculator</h1>
        <div style={styles.actionButtons}>
          <button style={styles.actionButton} onClick={handleReset}>
            <RotateCcw size={20} />
          </button>
          <button style={styles.actionButton}>
            <Save size={20} />
          </button>
          <button style={styles.actionButton} disabled={!hasCalculations}>
            <Download size={20} />
          </button>
          <button style={styles.actionButton}>
            <Printer size={20} />
          </button>
        </div>
      </div>
      
      <div style={{
        ...styles.mainGrid,
        gridTemplateColumns: isDesktop ? '1fr 2fr' : '1fr'
      }}>
        {/* Input Panel */}
        <div style={styles.panel}>
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>Input Data</h2>
          </div>
          
          <div style={styles.panelBody}>
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
                  onClick={() => handleModeChange('forward')}
                >
                  Forward
                </button>
                <button 
                  type="button" 
                  style={{
                    ...styles.modeButton,
                    ...(formData.calculationMode === 'reverse' ? styles.modeButtonActive : {})
                  }}
                  onClick={() => handleModeChange('reverse')}
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
                style={styles.input}
                placeholder="Enter wine name"
              />
            </div>
            
            {/* Currency Selection - UPDATED: using handleCurrencyChange */}
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
            
            {/* NEW: Exchange Rate Section for EUR */}
            {formData.currency === 'EUR' && (
              <div style={styles.formGroup}>
                <div style={{...styles.formGroup, marginBottom: '0.5rem'}}>
                  <label htmlFor="exchangeRate" style={{...styles.label, marginBottom: 0}}>
                    Exchange Rate (EUR→USD)
                  </label>
                </div>
                
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <input
                    id="exchangeRate"
                    name={formData.useCustomExchangeRate ? "customExchangeRate" : "exchangeRate"}
                    type="text"
                    value={!formData.useCustomExchangeRate ? formData.exchangeRate : formData.customExchangeRate}
                    onChange={handleInputChange}
                    disabled={!formData.useCustomExchangeRate}
                    style={{
                      ...styles.input,
                      backgroundColor: !formData.useCustomExchangeRate ? '#f7fafc' : '#fff'
                    }}
                  />
                </div>
                
                {exchangeRateError && (
                  <div style={{color: '#e53e3e', fontSize: '0.75rem', marginTop: '0.25rem', display: 'flex', alignItems: 'center'}}>
                    <AlertCircle style={{width: '1rem', height: '1rem', marginRight: '0.25rem'}} />
                    {exchangeRateError}
                  </div>
                )}
                
                <label style={{display: 'flex', alignItems: 'center', marginTop: '0.5rem', fontWeight: 500, fontSize: '0.875rem', color: '#4a5568'}}>
                  <input
                    type="checkbox"
                    name="useCustomExchangeRate"
                    checked={formData.useCustomExchangeRate}
                    onChange={handleCustomRateToggle}
                    style={{marginRight: '0.5rem'}}
                  />
                  Use manual exchange rate
                </label>
                
                {!formData.useCustomExchangeRate && (
                  <div style={{fontSize: '0.75rem', color: '#718096', marginTop: '0.25rem'}}>
                    Exchange rate data updates twice daily
                  </div>
                )}
                
                <div style={styles.formGroup}>
                  <label htmlFor="exchangeBuffer" style={styles.label}>Exchange Rate Buffer (%)</label>
                  <input
                    id="exchangeBuffer"
                    name="exchangeBuffer"
                    type="text"
                    value={formData.exchangeBuffer}
                    onChange={handleInputChange}
                    style={getInputStyle('exchangeBuffer')}
                  />
                  {errors.exchangeBuffer && <p style={{color: '#e53e3e', fontSize: '0.75rem', marginTop: '0.25rem'}}>{errors.exchangeBuffer}</p>}
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
            
            {/* Cost Input Section - Conditional Display */}
            {formData.calculationMode === 'forward' ? (
              <div style={styles.grid}>
                <div style={styles.formGroup}>
                  <label htmlFor="bottleCost" style={styles.label}>Bottle Cost ({formData.currency})</label>
                  <input
                    id="bottleCost"
                    name="bottleCost"
                    type="text"
                    value={formData.bottleCost}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="0.00"
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label htmlFor="casePrice" style={styles.label}>Case Price ({formData.currency})</label>
                  <input
                    id="casePrice"
                    name="casePrice"
                    type="text"
                    value={formData.casePrice}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="0.00"
                  />
                </div>
              </div>
            ) : (
              <div style={styles.formGroup}>
                <label htmlFor="targetSrp" style={styles.label}>Target SRP (USD)</label>
                <input
                  id="targetSrp"
                  name="targetSrp"
                  type="text"
                  value={formData.targetSrp}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="0.00"
                />
                
                {/* Reverse Target Model Selection */}
                <div style={{display: 'flex', gap: '1rem', marginTop: '0.5rem'}}>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="radio"
                      name="reverseTargetModel"
                      value="SS"
                      checked={reverseTargetModel === 'SS'}
                      onChange={handleReverseTargetChange}
                      style={styles.checkbox}
                    />
                    Stateside
                  </label>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="radio"
                      name="reverseTargetModel"
                      value="DI"
                      checked={reverseTargetModel === 'DI'}
                      onChange={handleReverseTargetChange}
                      style={styles.checkbox}
                    />
                    Direct Import
                  </label>
                </div>
              </div>
            )}
            
            {/* Basic Margin Inputs */}
            <div style={styles.grid}>
              <div style={styles.formGroup}>
                <label htmlFor="supplierMargin" style={styles.label}>
                  Supplier Margin (%)
                  {errors.supplierMargin && (
                    <span style={{color: '#DC2626', fontSize: '0.75rem', marginLeft: '0.5rem'}}>
                      ({errors.supplierMargin})
                    </span>
                  )}
                </label>
                <input
                  id="supplierMargin"
                  name="supplierMargin"
                  type="text"
                  value={formData.supplierMargin}
                  onChange={handleInputChange}
                  style={getInputStyle('supplierMargin')}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label htmlFor="distributorMargin" style={styles.label}>Distributor Margin (%)</label>
                <input
                  id="distributorMargin"
                  name="distributorMargin"
                  type="text"
                  value={formData.distributorMargin}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label htmlFor="retailerMargin" style={styles.label}>Retailer Margin (%)</label>
                <input
                  id="retailerMargin"
                  name="retailerMargin"
                  type="text"
                  value={formData.retailerMargin}
                  onChange={handleInputChange}
                  style={styles.input}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label htmlFor="casesSold" style={styles.label}>Cases Sold </label>
                <input
                  id="casesSold"
                  name="casesSold"
                  type="text"
                  value={formData.casesSold}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Optional"
                />
              </div>
            </div>
            
            {/* Round SRP Checkbox */}
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
            
            {/* Advanced Settings Toggle */}
            <div 
              style={styles.advancedHeader}
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <h3 style={{margin: 0, fontWeight: 600, fontSize: '1rem'}}>Advanced Settings</h3>
              {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
            
            {/* Advanced Settings Content */}
            {showAdvanced && (
              <div style={{padding: '1.5rem'}}>
                <div style={styles.grid}>
                  <div style={styles.formGroup}>
                    <label htmlFor="diLogistics" style={styles.label}>DI Logistics ($/case)</label>
                    <input
                      id="diLogistics"
                      name="diLogistics"
                      type="text"
                      value={formData.diLogistics}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label htmlFor="tariff" style={styles.label}>Tariff (%)</label>
                    <input
                      id="tariff"
                      name="tariff"
                      type="text"
                      value={formData.tariff}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label htmlFor="statesideLogistics" style={styles.label}>
                      Stateside Logistics ($/case)
                      {errors.statesideLogistics && (
                        <span style={{color: '#DC2626', fontSize: '0.75rem', marginLeft: '0.5rem'}}>
                          ({errors.statesideLogistics})
                        </span>
                      )}
                    </label>
                    <input
                      id="statesideLogistics"
                      name="statesideLogistics"
                      type="text"
                      value={formData.statesideLogistics}
                      onChange={handleInputChange}
                      style={getInputStyle('statesideLogistics')}
                    />
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label htmlFor="distributorBtgMargin" style={styles.label}>Dist. BTG Margin (%)</label>
                    <input
                      id="distributorBtgMargin"
                      name="distributorBtgMargin"
                      type="text"
                      value={formData.distributorBtgMargin}
                      onChange={handleInputChange}
                      style={styles.input}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Results Panel */}
<div style={styles.panel}>
  <div style={styles.panelHeader}>
    <h2 style={styles.panelTitle}>Results</h2>
  </div>
  
  <div style={styles.panelBody}>
    {/* Error Display */}
    {errors.calculation && (
      <div style={{
        padding: '0.75rem 1rem',
        marginBottom: '1rem',
        backgroundColor: errors.calculation.startsWith('Warning') ? '#FEF3C7' : '#FEE2E2',
        borderRadius: '0.375rem',
        borderLeft: `4px solid ${errors.calculation.startsWith('Warning') ? '#D97706' : '#DC2626'}`,
        color: errors.calculation.startsWith('Warning') ? '#92400E' : '#B91C1C'
      }}>
        <div style={{display: 'flex', alignItems: 'flex-start', gap: '0.5rem'}}>
          <AlertCircle size={18} />
          <div>
            <p style={{margin: 0, fontWeight: 500}}>{errors.calculation}</p>
          </div>
        </div>
      </div>
    )}
    
    {isCalculating ? (
      <div style={{textAlign: 'center', padding: '2rem'}}>
        <div style={{width: '2rem', height: '2rem', margin: '0 auto 1rem auto'}} className="spinner">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="32" strokeDashoffset="10" />
          </svg>
        </div>
        <p style={{fontWeight: 500}}>Calculating prices...</p>
      </div>
    ) : !hasCalculations ? (
      <div style={styles.emptyState}>
        <h3 style={styles.emptyTitle}>No Results Yet</h3>
        <p>Enter your pricing data in the input panel to calculate wholesale and retail pricing.</p>
      </div>
    ) : (
      <>
        <h3 style={styles.sectionTitle}>Pricing Summary</h3>
        <div style={styles.grid}>
          {/* Direct Import */}
          <div>
            <div style={{fontSize: '0.75rem', fontWeight: 600, color: '#7e3af2', textTransform: 'uppercase', marginBottom: '0.5rem'}}>
              Direct Import {formData.calculationMode === 'reverse' && reverseTargetModel === 'DI' && '(Target)'}
            </div>
            <div style={styles.resultRow}>
              <span style={styles.resultLabel}>Supplier FOB ($)</span>
              <span style={styles.resultValue}>
                {formatCurrency(calculations.supplierFobDI_USD / formData.casePackSize, 'USD')} per bottle
              </span>
            </div>
            {formData.currency !== 'USD' && (
              <div style={styles.resultRow}>
                <span style={styles.resultLabel}>Supplier FOB ({formData.currency})</span>
                <span style={styles.resultValue}>
                  {formatCurrency(calculations.baseBottleCostOriginal, formData.currency)} per bottle
                </span>
              </div>
            )}
            <div style={styles.resultRow}>
              <span style={styles.resultLabel}>Distributor Wholesale ($)</span>
              <span style={styles.resultValue}>
                {formatCurrency(calculations.distBottleWholesaleDI_USD, 'USD')} per bottle
              </span>
            </div>
            <div style={styles.resultRow}>
              <span style={styles.resultLabel}>Suggested Retail Price</span>
              <span style={styles.highlightedValue}>
                {formatCurrency(calculations.srpDi_USD, 'USD')}
              </span>
            </div>
            
            {/* Add tariff information */}
            <div style={styles.resultRow}>
              <span style={styles.resultLabel}>Tariff per Case</span>
              <span style={styles.resultValue}>
                {formatCurrency(calculations.distributorTariffPerCaseDI, 'USD')}
              </span>
            </div>
            
            {/* Show GP if cases sold is provided */}
            {parseInt(formData.casesSold, 10) > 0 && (
              <>
                <div style={styles.resultRow}>
                  <span style={styles.resultLabel}>Supplier GP </span>
                  <span style={styles.resultValue}>
                    {formatCurrency(calculations.supplierGrossProfitDI, 'USD')}
                  </span>
                </div>
                <div style={styles.resultRow}>
                  <span style={styles.resultLabel}>Distributor GP </span>
                  <span style={styles.resultValue}>
                    {formatCurrency(calculations.distributorGrossProfitDI, 'USD')}
                  </span>
                </div>
                <div style={styles.resultRow}>
                  <span style={styles.resultLabel}>Total Tariff </span>
                  <span style={styles.resultValue}>
                    {formatCurrency(calculations.distributorTariffTotalDI, 'USD')}
                  </span>
                </div>
              </>
            )}
          </div>
          
          {/* Stateside */}
          <div>
            <div style={{fontSize: '0.75rem', fontWeight: 600, color: '#7e3af2', textTransform: 'uppercase', marginBottom: '0.5rem'}}>
              Stateside {formData.calculationMode === 'reverse' && reverseTargetModel === 'SS' && '(Target)'}
            </div>
            <div style={styles.resultRow}>
              <span style={styles.resultLabel}>Supplier FOB ($)</span>
              <span style={styles.resultValue}>
                {formatCurrency(calculations.supplierFobSS_USD / formData.casePackSize, 'USD')} per bottle
              </span>
            </div>
            {formData.currency !== 'USD' && (
              <div style={styles.resultRow}>
                <span style={styles.resultLabel}>Supplier FOB ({formData.currency})</span>
                <span style={styles.resultValue}>
                  {formatCurrency(calculations.baseBottleCostOriginal, formData.currency)} per bottle
                </span>
              </div>
            )}
            <div style={styles.resultRow}>
              <span style={styles.resultLabel}>Distributor Wholesale ($)</span>
              <span style={styles.resultValue}>
                {formatCurrency(calculations.distBottleWholesaleSS_USD, 'USD')} per bottle
              </span>
            </div>
            <div style={styles.resultRow}>
              <span style={styles.resultLabel}>Suggested Retail Price</span>
              <span style={styles.highlightedValue}>
                {formatCurrency(calculations.srpSs_USD, 'USD')}
              </span>
            </div>
            
            {/* Add tariff information */}
            <div style={styles.resultRow}>
              <span style={styles.resultLabel}>Tariff per Case</span>
              <span style={styles.resultValue}>
                {formatCurrency(calculations.supplierTariffPerCase, 'USD')}
              </span>
            </div>
            
            {/* Show GP if cases sold is provided */}
            {parseInt(formData.casesSold, 10) > 0 && (
              <>
                <div style={styles.resultRow}>
                  <span style={styles.resultLabel}>Supplier GP </span>
                  <span style={styles.resultValue}>
                    {formatCurrency(calculations.supplierGrossProfitSS, 'USD')}
                  </span>
                </div>
                <div style={styles.resultRow}>
                  <span style={styles.resultLabel}>Distributor GP </span>
                  <span style={styles.resultValue}>
                    {formatCurrency(calculations.distributorGrossProfitSS, 'USD')}
                  </span>
                </div>
                <div style={styles.resultRow}>
                  <span style={styles.resultLabel}>Total Tariff </span>
                  <span style={styles.resultValue}>
                    {formatCurrency(calculations.supplierTariffTotal, 'USD')}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Annual Profit Summary with Dropdown Toggle */}
        {parseInt(formData.casesSold, 10) > 0 && (
          <div style={{marginTop: '2rem'}}>
            <div 
              style={styles.sectionHeader}
              onClick={() => setShowProfitSummary(!showProfitSummary)}
            >
              <h3 style={styles.sectionTitle}>Annual Profit Summary ({formData.casesSold} cases)</h3>
              {showProfitSummary ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>
            
            {showProfitSummary && (
              <>
                <div style={styles.resultRow}>
                  <span style={styles.resultLabel}>DI Supplier Gross Profit</span>
                  <span style={styles.highlightedValue}>
                    {formatCurrency(calculations.supplierGrossProfitDI || 0, 'USD')}
                  </span>
                </div>
                <div style={styles.resultRow}>
                  <span style={styles.resultLabel}>DI Distributor Gross Profit</span>
                  <span style={styles.highlightedValue}>
                    {formatCurrency(calculations.distributorGrossProfitDI || 0, 'USD')}
                  </span>
                </div>
                <div style={styles.resultRow}>
                  <span style={styles.resultLabel}>SS Supplier Gross Profit</span>
                  <span style={styles.highlightedValue}>
                    {formatCurrency(calculations.supplierGrossProfitSS || 0, 'USD')}
                  </span>
                </div>
                <div style={styles.resultRow}>
                  <span style={styles.resultLabel}>SS Distributor Gross Profit</span>
                  <span style={styles.highlightedValue}>
                    {formatCurrency(calculations.distributorGrossProfitSS || 0, 'USD')}
                  </span>
                </div>
                <div style={styles.resultRow}>
                  <span style={styles.resultLabel}>DI vs SS GP Difference</span>
                  <span style={{
                    ...styles.highlightedValue,
                    color: ((calculations.supplierGrossProfitDI || 0) + (calculations.distributorGrossProfitDI || 0)) > 
                          ((calculations.supplierGrossProfitSS || 0) + (calculations.distributorGrossProfitSS || 0)) ? 
                          '#047857' : '#B91C1C'
                  }}>
                    {formatCurrency(
                      ((calculations.supplierGrossProfitDI || 0) + (calculations.distributorGrossProfitDI || 0)) - 
                      ((calculations.supplierGrossProfitSS || 0) + (calculations.distributorGrossProfitSS || 0)), 
                      'USD'
                    )}
                  </span>
                </div>
                <div style={styles.resultRow}>
                  <span style={styles.resultLabel}>Total DI Tariff (Annual)</span>
                  <span style={styles.resultValue}>
                    {formatCurrency(calculations.distributorTariffTotalDI, 'USD')}
                  </span>
                </div>
                <div style={styles.resultRow}>
                  <span style={styles.resultLabel}>Total SS Tariff (Annual)</span>
                  <span style={styles.resultValue}>
                    {formatCurrency(calculations.supplierTariffTotal, 'USD')}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
        
        {/* Input Summary with Dropdown Toggle */}
        <div style={{marginTop: '2rem'}}>
          <div 
            style={styles.sectionHeader}
            onClick={() => setShowInputSummary(!showInputSummary)}
          >
            <h3 style={styles.sectionTitle}>Input Summary</h3>
            {showInputSummary ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
          
          {showInputSummary && (
            <>
              <div style={styles.resultRow}>
                <span style={styles.resultLabel}>Wine Name</span>
                <span style={styles.resultValue}>{formData.wineName || 'N/A'}</span>
              </div>
              <div style={styles.resultRow}>
                <span style={styles.resultLabel}>Calculation Mode</span>
                <span style={styles.resultValue}>{formData.calculationMode === 'forward' ? 'Forward' : 'Reverse'}</span>
              </div>
              <div style={styles.resultRow}>
                <span style={styles.resultLabel}>Currency</span>
                <span style={styles.resultValue}>{formData.currency}</span>
              </div>
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
                <div style={styles.resultRow}>
                  <span style={styles.resultLabel}>Target SRP (USD)</span>
                  <span style={styles.resultValue}>
                    {formatCurrency(formData.targetSrp, 'USD')}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </>
    )}
  </div>
</div>
</div>
    </div>
  );
};

export default WinePricingCalculator;