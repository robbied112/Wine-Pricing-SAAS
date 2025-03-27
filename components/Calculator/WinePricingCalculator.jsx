// components/Calculator/WinePricingCalculator.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Save, Download, Printer, RefreshCw, AlertCircle, RotateCcw } from 'lucide-react'; // Icons for this component's buttons

// Assuming this file is in components/Calculator/, adjust path if needed
import { supabase } from '../../lib/supabaseClient';
import InputPanel from './InputPanel';
import ResultsPanel from './ResultsPanel';

// --- Constants (Copied from original full code) ---
const CURRENCIES = ['EUR', 'USD'];
const BOTTLE_SIZES = ['750ml', '375ml', '500ml', '1L', '1.5L', '3L'];
const CASE_PACK_SIZES = [12, 6, 3, 1];
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6 hours
const CACHE_KEY_OER = 'cachedRateEURUSD_OER'; // Unique key for OpenExchangeRates cache
const CACHE_TIMESTAMP_KEY_OER = 'lastFetchTime_OER'; // Unique key
const DEFAULT_EXCHANGE_RATE = '1.0750'; // Default EUR to USD rate
const CALCULATION_TIMEOUT = 300;

// --- Default Form Data (Copied and completed from original full code) ---
const DEFAULT_FORM_DATA = {
  calculationMode: 'forward',
  wineName: '',
  currency: 'EUR',
  bottleCost: '',
  casePrice: '',
  casePackSize: 12,
  bottleSize: '750ml',
  exchangeRate: DEFAULT_EXCHANGE_RATE, // Will be potentially overwritten by cache/fetch
  exchangeBuffer: 5,
  useCustomExchangeRate: false,
  customExchangeRate: DEFAULT_EXCHANGE_RATE, // Default custom to default rate
  diLogistics: 13,
  tariff: 0,
  statesideLogistics: 10,
  supplierMargin: 30,
  distributorMargin: 30,
  distributorBtgMargin: 27, // Default BTG Margin
  retailerMargin: 33,
  roundSrp: true,
  casesSold: '',
  targetSrp: '',
};

// --- Helper Functions (Copied from original full code) ---
const formatCurrency = (value, currency = 'USD', maximumFractionDigits = 2) => {
    const number = Number(value);
    if (isNaN(number)) return '$--.--';
    try {
        return number.toLocaleString('en-US', { style: 'currency', currency: currency, minimumFractionDigits: 2, maximumFractionDigits: maximumFractionDigits });
    } catch (e) { return `$${number.toFixed(2)}`; }
};

const escapeCsvCell = (cell) => {
    const stringValue = String(cell ?? '');
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        const escapedString = stringValue.replace(/"/g, '""');
        return `"${escapedString}"`;
    }
    return stringValue;
};

const roundToNearest99 = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return 0;
    const whole = Math.floor(num);
    return num - whole < 0.40 ? Math.max(0, whole - 1 + 0.99) : whole + 0.99;
};

// --- Main Calculator Component Definition ---
// Added user prop for Supabase saving
const WinePricingCalculator = ({ user }) => {

  // Helper Function for Initial Form Data (Copied from original full code)
  const getInitialFormData = useCallback(() => {
    const cachedRate = localStorage.getItem(CACHE_KEY_OER);
    // Fallback to default if cache is invalid
    let rate = DEFAULT_EXCHANGE_RATE;
    if (cachedRate) {
        const parsedRate = parseFloat(cachedRate);
        if (!isNaN(parsedRate) && parsedRate > 0) {
            rate = parsedRate.toFixed(5); // Use cached rate if valid
        } else {
            console.warn("Invalid cached rate found, using default:", cachedRate);
        }
    }
    console.log("getInitialFormData: Initial rate determined - ", rate, cachedRate && rate !== DEFAULT_EXCHANGE_RATE ? "(from cache)" : "(default)");
    return {
        ...DEFAULT_FORM_DATA,
        exchangeRate: rate, // Overwrites default with cached/valid default
        customExchangeRate: rate, // Also set custom rate field initially
    };
  }, []); // Empty dependency array, relies on constants and localStorage

  // --- State Initialization (Copied from original full code) ---
  const [formData, setFormData] = useState(getInitialFormData);
  const [calculations, setCalculations] = useState({});
  const [errors, setErrors] = useState({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [isExchangeRateLoading, setIsExchangeRateLoading] = useState(false);
  const [exchangeRateError, setExchangeRateError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showGrossProfit, setShowGrossProfit] = useState(false);
  const [reverseTargetModel, setReverseTargetModel] = useState('SS');

  // --- API Key (Copied from original full code) ---
  // TODO: Consider moving this to Next.js environment variables if not already
  const oerAppId = process.env.NEXT_PUBLIC_OER_APP_ID || 'YOUR_OER_APP_ID'; // Fallback needed?

  // --- Fetching Logic (Copied from original full code) ---
  const fetchRateFromOER = useCallback(async (forceRefresh = false) => {
      console.log(`>>> fetchRateFromOER called. Force: ${forceRefresh}, Currency: ${formData.currency}, Custom: ${formData.useCustomExchangeRate}`);
      if (formData.currency !== 'EUR' || (formData.useCustomExchangeRate && !forceRefresh)) {
          console.log(">>> SKIPPING OER fetch: Conditions not met.");
          setExchangeRateError(null); return;
      }
      const now = Date.now();
      const lastFetchTimeString = localStorage.getItem(CACHE_TIMESTAMP_KEY_OER);
      const lastFetchTime = lastFetchTimeString ? parseInt(lastFetchTimeString, 10) : 0;
      const cachedRateString = localStorage.getItem(CACHE_KEY_OER);
      if (!forceRefresh && cachedRateString && now - lastFetchTime < CACHE_DURATION_MS) {
          const cachedRate = parseFloat(cachedRateString);
          if (!isNaN(cachedRate) && cachedRate > 0) {
              console.log(">>> Using cached OER rate:", cachedRate);
              setFormData(prev => ({ ...prev, exchangeRate: cachedRateString }));
              setExchangeRateError(null); return;
          }
      }
      console.log(">>> PROCEEDING TO FETCH from OpenExchangeRates (USD Base)...");
      setIsExchangeRateLoading(true); setExchangeRateError(null);
      if (!oerAppId || oerAppId === 'YOUR_OER_APP_ID') {
          console.error("OpenExchangeRates App ID is missing or using placeholder.");
          setExchangeRateError("Config Error: App ID missing.");
          setIsExchangeRateLoading(false);
          const fallbackRate = cachedRateString ? parseFloat(cachedRateString).toFixed(5) : DEFAULT_EXCHANGE_RATE;
          setFormData(prev => ({ ...prev, exchangeRate: fallbackRate })); return;
      }
      try {
          const apiUrl = `https://openexchangerates.org/api/latest.json?app_id=${oerAppId}&symbols=EUR`;
          console.log(">>> Fetching URL:", apiUrl);
          const response = await fetch(apiUrl);
          const data = await response.json();
          console.log(">>> RAW OER RESPONSE (USD Base):", JSON.stringify(data, null, 2));
          if (!response.ok || data.error) { const errorDescription = data?.description || `HTTP error! status: ${response.status}`; throw new Error(errorDescription); }
          if (data.base !== 'USD' || !data.rates || typeof data.rates.EUR !== 'number') { throw new Error("Could not parse valid USD->EUR rate from OER API. Unexpected response format."); }
          const rateUSDtoEUR = data.rates.EUR;
          if (rateUSDtoEUR <= 0) { throw new Error("Received invalid rate (<= 0) from OER API."); }
          const rateEURUSD = 1 / rateUSDtoEUR;
          const formattedRate = rateEURUSD.toFixed(5);
          console.log(`>>> Fetched OER Rate: USD->EUR=${rateUSDtoEUR}, Calculated EUR->USD=${formattedRate}`);
          setFormData(prev => ({ ...prev, exchangeRate: formattedRate, customExchangeRate: prev.useCustomExchangeRate ? prev.customExchangeRate : formattedRate }));
          localStorage.setItem(CACHE_KEY_OER, formattedRate);
          localStorage.setItem(CACHE_TIMESTAMP_KEY_OER, now.toString());
          setExchangeRateError(null);
      } catch (error) {
          console.error("Error fetching/processing OER rate:", error);
          setExchangeRateError(`Could not fetch rate: ${error.message}. Using previous/default.`);
          const fallbackRate = cachedRateString ? parseFloat(cachedRateString).toFixed(5) : DEFAULT_EXCHANGE_RATE;
          setFormData(prev => ({ ...prev, exchangeRate: fallbackRate }));
      } finally {
          setIsExchangeRateLoading(false);
      }
  }, [oerAppId, formData.currency, formData.useCustomExchangeRate]); // Dependencies

  // --- Calculation Logic (Copied from original full code) ---
  const calculatePricing = useCallback(() => {
      console.log("Calculating pricing with formData:", formData);
      console.log("Using reverseTargetModel:", reverseTargetModel);
      setIsCalculating(true);
      setErrors(prev => ({ /* ... Keep error clearing logic ... */
            calculation: null, costInput: null, targetSrp: null, exchangeRate: null, customExchangeRate: null,
      }));
      try { // Wrap core calculation
          // --- Input Parsing and Validation ---
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

          let effectiveExchangeRate; // Determine effective rate (logic copied)
           if (formData.currency === 'USD') { effectiveExchangeRate = 1; }
           else if (formData.useCustomExchangeRate) {
               if (!isNaN(customRate) && customRate > 0) { effectiveExchangeRate = customRate; }
               else { setErrors(prev => ({ ...prev, customExchangeRate: "Invalid Manual Rate" })); effectiveExchangeRate = parseFloat(DEFAULT_EXCHANGE_RATE); }
           } else {
               if (!isNaN(fetchedRate) && fetchedRate > 0) { effectiveExchangeRate = fetchedRate * (1 + exchangeBuffer / 100); }
               else { setErrors(prev => ({ ...prev, exchangeRate: "Invalid Fetched Rate" })); effectiveExchangeRate = parseFloat(DEFAULT_EXCHANGE_RATE) * (1 + (formData.exchangeBuffer || 0) / 100); }
           }
          if (isNaN(effectiveExchangeRate) || effectiveExchangeRate <= 0) { throw new Error("Invalid effective exchange rate for calculation."); }

          let baseBottleCostOriginal = null, baseCasePriceOriginal = null, caseCostUSD = 0; // Initialize

          // --- Determine Base Cost in USD (Forward/Reverse logic copied) ---
           if (formData.calculationMode === 'forward') {
               // ... (Forward mode cost determination logic copied) ...
                let baseCostOriginal = 0;
                if (bottleCost > 0) { baseCostOriginal = bottleCost * casePack; }
                else if (casePrice > 0) { baseCostOriginal = casePrice; }
                else {
                    if (formData.bottleCost !== '' || formData.casePrice !== '') { setErrors(prev => ({ ...prev, costInput: `Enter valid ${formData.currency} Bottle Cost or Case Price.` }));}
                    setIsCalculating(false); setCalculations({}); return;
                }
                if(baseCostOriginal <= 0) throw new Error(`Invalid non-positive ${formData.currency} cost input.`);
                caseCostUSD = baseCostOriginal * effectiveExchangeRate;
                baseCasePriceOriginal = baseCostOriginal; baseBottleCostOriginal = baseCostOriginal / casePack;
           } else { // Reverse Mode
               // ... (Reverse mode cost determination logic copied, including branching) ...
                if (targetSrp <= 0) {
                    if (formData.targetSrp !== '') { setErrors(prev => ({ ...prev, targetSrp: "Enter valid Target SRP (USD > 0)." })); }
                    setIsCalculating(false); setCalculations({}); return;
                }
                const marginCheck = (margin, name) => { if (isNaN(margin) || margin < 0 || margin >= 100) throw new Error(`Invalid ${name} (${margin}%). Must be 0-99.99.`); return margin / 100; };
                const retailerMarginFrac = marginCheck(retailerMarginPercent, "Retailer Margin");
                const distributorMarginFrac = marginCheck(distributorMarginPercent, "Distributor Margin");
                const supplierMarginFrac = marginCheck(supplierMarginPercent, "Supplier Margin");
                const tariffFrac = tariffPercent / 100; if (isNaN(tariffFrac) || tariffFrac < 0) throw new Error("Invalid Tariff percentage.");

                const effectiveSrp = formData.roundSrp ? roundToNearest99(targetSrp) : targetSrp;
                let distWholesaleBottle_USD = effectiveSrp * (1 - retailerMarginFrac); if (isNaN(distWholesaleBottle_USD) || distWholesaleBottle_USD <= 0) throw new Error("Retailer margin yields non-positive wholesale cost.");
                const distCaseWholesale_USD = distWholesaleBottle_USD * casePack;
                const distLaidInCostPreSSLogistics_USD = distCaseWholesale_USD * (1 - distributorMarginFrac); if (isNaN(distLaidInCostPreSSLogistics_USD) || distLaidInCostPreSSLogistics_USD <= 0) throw new Error("Distributor margin yields non-positive laid-in cost.");

                let supplierLaidInCost_Base;
                if (reverseTargetModel === 'SS') {
                    console.log('Calculating reverse based on SS Target');
                    const supplierFobSS_USD = distLaidInCostPreSSLogistics_USD - statesideLogistics; if (isNaN(supplierFobSS_USD) || supplierFobSS_USD <= 0) throw new Error('Stateside logistics cost exceeds distributor laid-in cost.');
                    supplierLaidInCost_Base = supplierFobSS_USD * (1 - supplierMarginFrac); if (isNaN(supplierLaidInCost_Base) || supplierLaidInCost_Base <= 0) throw new Error('Supplier margin yields non-positive SS laid-in cost.');
                } else { // 'DI' Path
                    console.log('Calculating reverse based on DI Target');
                    const supplierFobDI_USD = distLaidInCostPreSSLogistics_USD;
                    supplierLaidInCost_Base = supplierFobDI_USD * (1 - supplierMarginFrac); if (isNaN(supplierLaidInCost_Base) || supplierLaidInCost_Base <= 0) throw new Error('Supplier margin yields non-positive DI laid-in cost.');
                }

                const tariffFactor = 1 + tariffFrac; if (tariffFactor <= 0) throw new Error('Tariff cannot be -100% or less.');
                caseCostUSD = (supplierLaidInCost_Base - diLogistics) / tariffFactor; if (isNaN(caseCostUSD) || caseCostUSD <= 0) throw new Error('Logistics/Tariff/Margins yield non-positive base USD cost.');
                if (effectiveExchangeRate <= 0) throw new Error('Cannot convert back: Invalid effective exchange rate (<=0).');
                baseCasePriceOriginal = caseCostUSD / effectiveExchangeRate; baseBottleCostOriginal = baseCasePriceOriginal / casePack;

                // Update non-editable cost fields in UI state for reverse mode display
                setFormData(prev => ({ ...prev, bottleCost: baseBottleCostOriginal.toFixed(4), casePrice: baseCasePriceOriginal.toFixed(2) }));
           }

          // --- Common Calculations (DI, SS, SRP, GP logic copied) ---
           if (isNaN(caseCostUSD) || caseCostUSD <= 0) throw new Error("Base USD cost is invalid or non-positive.");
           const marginCheck = (margin, name) => { if (isNaN(margin) || margin >= 100 || margin < 0) throw new Error(`Invalid ${name} (${margin}%). Must be 0-99.99.`); return margin / 100; };
           const supplierMargin = marginCheck(supplierMarginPercent, "Supplier Margin");
           const distributorMargin = marginCheck(distributorMarginPercent, "Distributor Margin");
           const distBtgMargin = marginCheck(distBtgMarginPercent, "Distributor BTG Margin");
           const retailerMargin = marginCheck(retailerMarginPercent, "Retailer Margin");
           const tariffFrac = tariffPercent / 100; if (isNaN(tariffFrac) || tariffFrac < 0) throw new Error("Invalid Tariff percentage.");

           // DI Calcs
           const tariffAmountUSD = caseCostUSD * tariffFrac;
           const supplierLaidInCostDI_USD = caseCostUSD + tariffAmountUSD + diLogistics; if(supplierLaidInCostDI_USD <= 0) throw new Error("Supplier DI Laid-In Cost is non-positive.");
           const supplierFobDI_USD = supplierLaidInCostDI_USD / (1 - supplierMargin);
           const distributorLaidInCostDI_USD = supplierFobDI_USD;
           const distCaseWholesaleDI_USD = distributorLaidInCostDI_USD / (1 - distributorMargin);
           const distBottleWholesaleDI_USD = distCaseWholesaleDI_USD / casePack;
           const distLaidInCostDI_Bottle_USD = distributorLaidInCostDI_USD / casePack; if (isNaN(distLaidInCostDI_Bottle_USD) || distLaidInCostDI_Bottle_USD < 0) throw new Error("Invalid DI Laid-In Cost per bottle.");
           const distBtgPriceDI_USD = distLaidInCostDI_Bottle_USD / (1 - distBtgMargin);

           // SS Calcs
           const supplierLaidInCostSS_USD = supplierLaidInCostDI_USD;
           const supplierFobSS_USD = supplierLaidInCostSS_USD / (1 - supplierMargin);
           const distributorLaidInCostSS_USD = supplierFobSS_USD + statesideLogistics; if(distributorLaidInCostSS_USD <= 0) throw new Error("Distributor SS Laid-In Cost is non-positive.");
           const distCaseWholesaleSS_USD = distributorLaidInCostSS_USD / (1 - distributorMargin);
           const distBottleWholesaleSS_USD = distCaseWholesaleSS_USD / casePack;
           const distLaidInCostSS_Bottle_USD = distributorLaidInCostSS_USD / casePack; if (isNaN(distLaidInCostSS_Bottle_USD) || distLaidInCostSS_Bottle_USD < 0) throw new Error("Invalid SS Laid-In Cost per bottle.");
           const distBtgPriceSS_USD = distLaidInCostSS_Bottle_USD / (1 - distBtgMargin);

           if (![supplierFobDI_USD, supplierFobSS_USD, distCaseWholesaleDI_USD, distCaseWholesaleSS_USD, distBtgPriceDI_USD, distBtgPriceSS_USD].every(val => isFinite(val) && val >= 0)) { throw new Error("Calculation resulted in non-finite or negative intermediate price due to margin(s)."); }

           // SRP Calcs
           let srpDi_USD = distBottleWholesaleDI_USD / (1 - retailerMargin);
           let srpSs_USD = distBottleWholesaleSS_USD / (1 - retailerMargin);
           let adjustedCaseWholesaleDI_USD = distCaseWholesaleDI_USD, adjustedBottleWholesaleDI_USD = distBottleWholesaleDI_USD;
           let adjustedCaseWholesaleSS_USD = distCaseWholesaleSS_USD, adjustedBottleWholesaleSS_USD = distBottleWholesaleSS_USD;
           let adjustedDistBtgPriceDI_USD = distBtgPriceDI_USD, adjustedDistBtgPriceSS_USD = distBtgPriceSS_USD;
           let originalSrpDi_USD = srpDi_USD, originalSrpSs_USD = srpSs_USD;

           if (formData.roundSrp && formData.calculationMode === 'forward') { // Rounding logic copied
                srpDi_USD = roundToNearest99(srpDi_USD); srpSs_USD = roundToNearest99(srpSs_USD);
                adjustedBottleWholesaleDI_USD = srpDi_USD * (1 - retailerMargin); adjustedCaseWholesaleDI_USD = adjustedBottleWholesaleDI_USD * casePack;
                adjustedBottleWholesaleSS_USD = srpSs_USD * (1 - retailerMargin); adjustedCaseWholesaleSS_USD = adjustedBottleWholesaleSS_USD * casePack;
           } else if (formData.calculationMode === 'reverse') { // Reverse SRP display logic copied
                srpDi_USD = formData.roundSrp ? roundToNearest99(targetSrp) : targetSrp; srpSs_USD = formData.roundSrp ? roundToNearest99(targetSrp) : targetSrp;
           }

           // GP Calcs
           let supplierGrossProfitDI = null, distributorGrossProfitDI = null;
           let supplierGrossProfitSS = null, distributorGrossProfitSS = null;
           if (casesSold > 0) { // GP logic copied
                supplierGrossProfitDI = (supplierFobDI_USD - supplierLaidInCostDI_USD) * casesSold;
                distributorGrossProfitDI = (adjustedCaseWholesaleDI_USD - distributorLaidInCostDI_USD) * casesSold;
                supplierGrossProfitSS = (supplierFobSS_USD - supplierLaidInCostSS_USD) * casesSold;
                distributorGrossProfitSS = (adjustedCaseWholesaleSS_USD - distributorLaidInCostSS_USD) * casesSold;
           }

           // Set final calculation state (copied)
            setCalculations({
                effectiveExchangeRate, caseCostUSD, tariffAmountUSD,
                supplierLaidInCostDI_USD, supplierFobDI_USD, distributorLaidInCostDI_USD,
                distCaseWholesaleDI_USD: adjustedCaseWholesaleDI_USD, distBottleWholesaleDI_USD: adjustedBottleWholesaleDI_USD,
                distBtgPriceDI_USD: adjustedDistBtgPriceDI_USD, srpDi_USD, originalSrpDi_USD,
                supplierLaidInCostSS_USD, supplierFobSS_USD, distributorLaidInCostSS_USD,
                distCaseWholesaleSS_USD: adjustedCaseWholesaleSS_USD, distBottleWholesaleSS_USD: adjustedBottleWholesaleSS_USD,
                distBtgPriceSS_USD: adjustedDistBtgPriceSS_USD, srpSs_USD, originalSrpSs_USD,
                supplierGrossProfitDI, distributorGrossProfitDI,
                supplierGrossProfitSS, distributorGrossProfitSS,
                baseBottleCostOriginal, baseCasePriceOriginal,
                reverseTargetModelUsed: formData.calculationMode === 'reverse' ? reverseTargetModel : null
            });
           setErrors(prev => ({ ...prev, calculation: null })); // Clear calc error

      } catch (error) { // Error handling copied
           console.error("Calculation Error:", error);
           const errorMessage = (error instanceof Error) ? error.message : "An unexpected error occurred during calculation.";
           setErrors(prev => ({ ...prev, calculation: errorMessage }));
           setCalculations({}); // Clear results on error
      } finally {
           setIsCalculating(false);
      }
  }, [formData, reverseTargetModel]); // Dependencies

  // --- Input Change Handler (Copied from original full code) ---
  const handleInputChange = useCallback((e) => {
      const { name, value, type, checked } = e.target;
      let newValue = type === 'checkbox' ? checked : value;
      let fieldError = ""; // Validation logic copied...
      const numericFields = [ /* ... field list ... */
            "bottleCost", "casePrice", "targetSrp", "exchangeRate", "customExchangeRate", "exchangeBuffer", "diLogistics", "tariff", "statesideLogistics", "supplierMargin", "distributorMargin", "distributorBtgMargin", "retailerMargin", "casesSold"
      ];
      let updates = { [name]: newValue };
      const currentMode = formData.calculationMode;
      const casePack = parseInt(formData.casePackSize, 10);

      if (numericFields.includes(name)) {
          if (newValue === "" || newValue === "-") {
              fieldError = "";
              if (currentMode === 'forward') { if (name === 'bottleCost') updates.casePrice = ""; else if (name === 'casePrice') updates.bottleCost = ""; }
          } else {
              const num = parseFloat(newValue);
              if (isNaN(num)) { fieldError = "Invalid number"; }
              else {
                  if (["supplierMargin", "distributorMargin", "distributorBtgMargin", "retailerMargin"].includes(name) && (num < 0 || num >= 100)) { fieldError = "Must be 0-99.99"; }
                  else if (["bottleCost", "casePrice", "targetSrp", "diLogistics", "statesideLogistics", "casesSold", "exchangeRate", "customExchangeRate", "exchangeBuffer"].includes(name) && num < 0 && newValue !== "-") { fieldError = "Cannot be negative"; }
                  else if (name === "tariff" && (num < 0 || num > 200)) { fieldError = "Must be 0-200"; }
                  else { fieldError = ""; }
                  if (currentMode === 'forward' && !isNaN(casePack) && casePack > 0 && !isNaN(num) && num >= 0) { // Counterpart calc copied
                      if (name === 'bottleCost') { updates.casePrice = (num * casePack).toFixed(2); }
                      else if (name === 'casePrice') { updates.bottleCost = (num / casePack).toFixed(4); }
                  }
              }
          }
          if (currentMode === 'reverse' && (name === 'bottleCost' || name === 'casePrice')) { delete updates[name]; }
      } else if (name === 'calculationMode' && newValue === 'reverse') { // Mode switch logic copied
          updates.bottleCost = ''; updates.casePrice = ''; updates.targetSrp = ''; fieldError = "";
      } else if (name === 'calculationMode' && newValue === 'forward') {
          updates.targetSrp = ''; fieldError = "";
      } else { fieldError = ""; }

      setFormData(prev => ({ ...prev, ...updates }));
      setErrors(prev => ({ ...prev, [name]: fieldError || null }));
  }, [formData.calculationMode, formData.casePackSize]); // Dependencies

  // --- Other Handlers (Copied from original full code) ---
  const handleReverseTargetChange = useCallback((e) => {
      console.log('Setting Reverse Target Model to:', e.target.value);
      setReverseTargetModel(e.target.value);
      setCalculations({}); setErrors(prev => ({ ...prev, calculation: null }));
  }, []); // Dependencies

  const handleCurrencyChange = useCallback((e) => {
      const newCurrency = e.target.value;
      setFormData(prev => ({ ...prev, currency: newCurrency }));
      if (newCurrency === 'EUR' && !formData.useCustomExchangeRate) { fetchRateFromOER(false); }
      else { setExchangeRateError(null); }
      setErrors(prev => ({ ...prev, calculation: null }));
  }, [fetchRateFromOER, formData.useCustomExchangeRate]); // Dependencies

  const handleSelectChange = useCallback((e) => {
      const { name, value } = e.target;
      let updates = { [name]: value };
      if (name === 'casePackSize' && formData.calculationMode === 'forward') { // Counterpart calc copied
          const newCasePack = parseInt(value, 10);
          const bottleCost = parseFloat(formData.bottleCost); const casePrice = parseFloat(formData.casePrice);
          if (!isNaN(newCasePack) && newCasePack > 0) {
              if (!isNaN(bottleCost) && bottleCost > 0) { updates.casePrice = (bottleCost * newCasePack).toFixed(2); }
              else if (!isNaN(casePrice) && casePrice > 0) { updates.bottleCost = (casePrice / newCasePack).toFixed(4); }
          }
      } else if (name === 'calculationMode') { // Mode switch logic copied
          setCalculations({});
          if(value === 'forward') { updates.targetSrp = ''; } else { updates.bottleCost = ''; updates.casePrice = ''; }
          setErrors({});
      }
      setFormData(prev => ({ ...prev, ...updates }));
      if (name !== 'calculationMode') { setErrors(prev => ({ ...prev, calculation: null })); }
  }, [formData.calculationMode, formData.bottleCost, formData.casePrice]); // Dependencies

  const handleCustomRateToggle = useCallback((e) => {
      const useCustom = e.target.checked;
      setFormData(prev => { const newCustomRate = useCustom ? prev.exchangeRate : prev.customExchangeRate; return { ...prev, useCustomExchangeRate: useCustom, customExchangeRate: newCustomRate }; });
      if (!useCustom && formData.currency === 'EUR') { fetchRateFromOER(false); }
      else if (useCustom) { setExchangeRateError(null); }
      setErrors(prev => ({ ...prev, calculation: null }));
  }, [fetchRateFromOER, formData.currency]); // Dependencies

  const handleRefreshRate = useCallback(() => {
      console.log(">>> Manual Refresh Clicked");
      if (formData.currency === 'EUR' && !formData.useCustomExchangeRate) { fetchRateFromOER(true); }
      else { console.log(">>> Refresh skipped (Not EUR or using Custom)"); setExchangeRateError("Refresh only available for EUR currency when not using manual rate."); setTimeout(() => setExchangeRateError(null), 4000); }
  }, [fetchRateFromOER, formData.currency, formData.useCustomExchangeRate]); // Dependencies

  const handleReset = useCallback(() => {
      console.log("Resetting form state...");
      setFormData(getInitialFormData()); setCalculations({}); setErrors({});
      setReverseTargetModel('SS'); setShowAdvanced(false); setShowGrossProfit(false);
      setExchangeRateError(null);
  }, [getInitialFormData]); // Dependency on getInitialFormData

  const handleDownload = useCallback(() => { /* ... Keep download logic ... */
        if (!calculations.srpDi_USD && !calculations.srpSs_USD) { alert("Please perform a calculation first."); return; }
        const headers = [ /* ... headers ... */ "Parameter", "Value", "DI Parameter", "DI Value (USD)", "SS Parameter", "SS Value (USD)" ];
        const inputData = [ /* ... inputData array population ... */
            ["Wine Name", formData.wineName], ["Calculation Mode", formData.calculationMode], ["Supplier Currency", formData.currency],
            [`Bottle Cost (${formData.currency})`, formData.bottleCost], [`Case Price (${formData.currency})`, formData.casePrice],
            ["Case Pack Size", formData.casePackSize], ["Bottle Size", formData.bottleSize], ["Exchange Rate Source", formData.useCustomExchangeRate ? "Manual" : "Fetched"],
            ["Base Exchange Rate", formData.useCustomExchangeRate ? "N/A" : formData.exchangeRate], ["Manual Exchange Rate", formData.useCustomExchangeRate ? formData.customExchangeRate : "N/A"],
            ["Exchange Buffer (%)", formData.exchangeBuffer], ["Effective Rate (EUR->USD)", calculations.effectiveExchangeRate?.toFixed(5) ?? 'N/A'],
            ["DI Logistics ($/Case)", formData.diLogistics], ["Tariff (%)", formData.tariff], ["Stateside Logistics ($/Case)", formData.statesideLogistics],
            ["Supplier Margin (%)", formData.supplierMargin], ["Distributor Margin (%)", formData.distributorMargin], ["Distributor BTG Margin (%)", formData.distributorBtgMargin],
            ["Retailer Margin (%)", formData.retailerMargin], ["Round SRP?", formData.roundSrp ? 'Yes' : 'No'], ["Cases Sold (for GP)", formData.casesSold || "N/A"],
            ["Target SRP (USD)", formData.calculationMode === 'reverse' ? formData.targetSrp : "N/A"], ["Reverse Target Model", formData.calculationMode === 'reverse' ? reverseTargetModel : "N/A"]
        ];
        const calcDataBase = [ ["Base Case Cost (USD)", calculations.caseCostUSD], ["Tariff Amount (USD)", calculations.tariffAmountUSD], ];
        const calcDataDI = [ ...calcDataBase, /* ... DI results ... */
            ["Supplier Laid-In DI (USD)", calculations.supplierLaidInCostDI_USD], ["Supplier FOB DI (USD)", calculations.supplierFobDI_USD], ["Distributor Laid-In DI (USD)", calculations.distributorLaidInCostDI_USD],
            ["Distributor Whsl Case DI (USD)", calculations.distCaseWholesaleDI_USD], ["Distributor Whsl Bottle DI (USD)", calculations.distBottleWholesaleDI_USD], ["Distributor BTG Bottle DI (USD)", calculations.distBtgPriceDI_USD],
            ["SRP DI (USD)", calculations.srpDi_USD], ...(calculations.supplierGrossProfitDI != null ? [["Supplier GP DI (USD)", calculations.supplierGrossProfitDI]] : []), ...(calculations.distributorGrossProfitDI != null ? [["Distributor GP DI (USD)", calculations.distributorGrossProfitDI]] : []),
        ];
        const calcDataSS = [ ...calcDataBase, /* ... SS results ... */
            ["Supplier Laid-In SS (USD)", calculations.supplierLaidInCostSS_USD], ["Supplier FOB SS (USD)", calculations.supplierFobSS_USD], ["Distributor Laid-In SS (USD)", calculations.distributorLaidInCostSS_USD],
            ["Distributor Whsl Case SS (USD)", calculations.distCaseWholesaleSS_USD], ["Distributor Whsl Bottle SS (USD)", calculations.distBottleWholesaleSS_USD], ["Distributor BTG Bottle SS (USD)", calculations.distBtgPriceSS_USD],
            ["SRP SS (USD)", calculations.srpSs_USD], ...(calculations.supplierGrossProfitSS != null ? [["Supplier GP SS (USD)", calculations.supplierGrossProfitSS]] : []), ...(calculations.distributorGrossProfitSS != null ? [["Distributor GP SS (USD)", calculations.distributorGrossProfitSS]] : []),
        ];
        const maxInputRows = inputData.length; const maxCalcRows = Math.max(calcDataDI.length, calcDataSS.length); let combinedRows = [];
        for (let i = 0; i < maxInputRows; i++) { const inputRow = inputData[i] || ["", ""]; combinedRows.push([inputRow[0], inputRow[1], "", "", "", ""]); }
        combinedRows.push(["---", "---", "---", "---", "---", "---"]);
        for (let i = 0; i < maxCalcRows; i++) {
            const diRow = calcDataDI[i] || ["", ""]; const ssRow = calcDataSS[i] || ["", ""]; const formatValue = (val) => typeof val === 'number' ? val.toFixed(4) : val;
            combinedRows.push([ "", "", diRow[0], formatValue(diRow[1]), ssRow[0], formatValue(ssRow[1]), ]);
        }
        const csvContent = [ headers.map(escapeCsvCell).join(','), ...combinedRows.map(row => row.map(escapeCsvCell).join(',')) ].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); const link = document.createElement('a'); const url = URL.createObjectURL(blob); link.setAttribute('href', url);
        const safeWineName = (formData.wineName || 'WinePricing').replace(/[^a-z0-9]/gi, '_').toLowerCase(); link.setAttribute('download', `${safeWineName}_pricing_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden'; document.body.appendChild(link); link.click(); document.body.removeChild(link);
  }, [formData, calculations, reverseTargetModel, escapeCsvCell]); // Dependencies

  const handlePrint = useCallback(() => { window.print(); }, []); // Dependency

  // --- Effects (Copied from original full code) ---
  useEffect(() => { // Initial Fetch
      if (formData.currency === 'EUR' && !formData.useCustomExchangeRate) { fetchRateFromOER(false); }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount

  const calculationTimeoutRef = useRef(null);
  useEffect(() => { // Debounced Calculation
      clearTimeout(calculationTimeoutRef.current);
      calculationTimeoutRef.current = setTimeout(() => {
          const hasCriticalError = Object.values(errors).some(error => error && error !== errors.calculation); // Check input errors excluding calc error
          if (!hasCriticalError && ( (formData.calculationMode === 'forward' && (formData.bottleCost || formData.casePrice)) || (formData.calculationMode === 'reverse' && formData.targetSrp) ) ) {
              calculatePricing();
          } else {
              console.log("Skipping calculation due to input errors or missing required input:", errors);
              setCalculations({});
          }
      }, CALCULATION_TIMEOUT);
      return () => clearTimeout(calculationTimeoutRef.current);
  }, [formData, errors, calculatePricing, reverseTargetModel]); // Dependencies


  // --- Supabase Save Function (Kept from placeholder, uses 'user' prop) ---
  const saveCalculation = async () => {
    // Check if user is available
    if (!user || !user.id) {
      alert("You must be logged in to save calculations.");
      // TODO: Maybe redirect to login or show login modal
      return;
    }
    if (!calculations.srpDi_USD && !calculations.srpSs_USD) {
      alert("Please perform a calculation first.");
      return;
    }
    console.log("Saving calculation for user:", user.id); // Debug log

    try {
      // Ensure numeric values are numbers or null
      const numericOrNull = (val) => {
          const num = parseFloat(val);
          return isNaN(num) ? null : num;
      };

      const { data, error } = await supabase
        .from('calculations') // Ensure 'calculations' table exists in Supabase
        .insert([
          {
            user_id: user.id, // Use the user ID passed via props
            wine_name: formData.wineName || 'Unnamed Calculation',
            calculation_mode: formData.calculationMode,
            currency: formData.currency,
            // Store calculated original costs if reverse, otherwise input costs if forward
            bottle_cost: numericOrNull(formData.calculationMode === 'reverse' ? calculations.baseBottleCostOriginal : formData.bottleCost),
            case_price: numericOrNull(formData.calculationMode === 'reverse' ? calculations.baseCasePriceOriginal : formData.casePrice),
            case_pack_size: parseInt(formData.casePackSize, 10) || null,
            bottle_size: formData.bottleSize,
            srp_di: numericOrNull(calculations.srpDi_USD),
            srp_ss: numericOrNull(calculations.srpSs_USD),
            // Store the full formData and results as JSONB for potential future use/debugging
            form_data: formData,
            results: calculations
            // Add created_at handled by DB default
          }
        ])
        .select(); // Optionally select to confirm insertion

      if (error) {
          console.error('Supabase insert error:', error);
          throw error; // Re-throw to be caught by outer catch
      }

      console.log('Supabase insert success:', data); // Log success
      alert('Calculation saved successfully!');

    } catch (error) {
      console.error('Error saving calculation:', error);
      alert(`Error saving calculation: ${error.message || 'Unknown error'}`);
    }
  };

  // --- Render Logic ---
  const hasCalculations = calculations && (calculations.srpDi_USD != null || calculations.srpSs_USD != null);

  return (
    // (Keep the main JSX structure from placeholder/original)
    <div className="container mx-auto p-4 max-w-6xl font-sans">
      <div className="flex justify-between items-center mb-4 flex-wrap">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Wine Pricing Calculator</h1>
        <div className="flex space-x-2 mt-2 md:mt-0 print:hidden">
          {/* Add ALL action buttons, including the Supabase save */}
          <button onClick={handleReset} title="Reset Form" className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"> <RotateCcw className="w-5 h-5" /> </button>
          <button onClick={saveCalculation} title="Save Calculation to Account" className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded disabled:opacity-50 disabled:cursor-not-allowed" disabled={!hasCalculations}> <Save className="w-5 h-5" /> </button>
          <button onClick={handleDownload} title="Download Results as CSV" className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed" disabled={!hasCalculations}> <Download className="w-5 h-5" /> </button>
          <button onClick={handlePrint} title="Print Page" className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"> <Printer className="w-5 h-5" /> </button>
        </div>
      </div>

      {/* Global Calculation Error Display (Copied) */}
      {errors.calculation && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-800 rounded-md text-sm flex items-center">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0"/>
              <span>Calculation Error: {errors.calculation}</span>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Input Panel Component */}
        <div className="md:col-span-1">
          <InputPanel
            // Pass ALL necessary props determined in the previous step
            formData={formData}
            handleInputChange={handleInputChange}
            handleCurrencyChange={handleCurrencyChange}
            handleSelectChange={handleSelectChange}
            handleCustomRateToggle={handleCustomRateToggle}
            handleRefreshRate={handleRefreshRate}
            isExchangeRateLoading={isExchangeRateLoading}
            exchangeRateError={exchangeRateError}
            showAdvanced={showAdvanced}
            setShowAdvanced={setShowAdvanced} // Pass setter
            errors={errors}
            reverseTargetModel={reverseTargetModel}
            handleReverseTargetChange={handleReverseTargetChange}
            // Pass Constants used by InputPanel selects
            // CURRENCIES={CURRENCIES} // Defined globally above
            // BOTTLE_SIZES={BOTTLE_SIZES} // Defined globally above
            // CASE_PACK_SIZES={CASE_PACK_SIZES} // Defined globally above
          />
        </div>

        {/* Results Panel Component */}
        <div className="md:col-span-2">
          <ResultsPanel
             // Pass ALL necessary props determined in the previous step
            calculations={calculations}
            formData={formData}
            isCalculating={isCalculating}
            hasCalculations={hasCalculations}
            errors={errors}
            showGrossProfit={showGrossProfit}
            setShowGrossProfit={setShowGrossProfit} // Pass setter
            formatCurrency={formatCurrency} // Pass helper
            reverseTargetModel={reverseTargetModel}
          />
        </div>
      </div>
    </div>
  );
};

export default WinePricingCalculator;