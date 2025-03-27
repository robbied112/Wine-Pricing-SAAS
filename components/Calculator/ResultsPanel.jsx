// components/Calculator/ResultsPanel.jsx
import React from 'react';
import { AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'; // Import icons used here

// --- Helper function for formatting currency ---
// NOTE: It's better to pass this down as a prop from the parent OR
// move it to a shared utils file and import it here and in the parent.
// For simplicity here, we assume it's passed as a prop named `formatCurrency`.
// const formatCurrency = (value, currency = 'USD', maximumFractionDigits = 2) => { ... };

const ResultsPanel = ({
    calculations,
    formData,
    isCalculating,
    hasCalculations, // Boolean flag passed from parent
    errors,
    showGrossProfit,
    setShowGrossProfit,
    formatCurrency, // Passed as prop
    reverseTargetModel // Passed from parent
}) => {

    // --- JSX for the Results Panel ---
    // (Copy the JSX from the parent component's "Results Panel" section)
    return (
        <>
            {/* Loading Indicator */}
            {isCalculating && !hasCalculations && (
                <div className="flex justify-center items-center h-64 bg-gray-50 rounded-lg shadow border border-gray-100">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )}

            {/* Initial Prompt / Error Prompt */}
            {!isCalculating && !hasCalculations && (
                <div className="flex flex-col justify-center items-center h-64 bg-gray-50 rounded-lg shadow border border-gray-100 p-4 text-center">
                    {errors.calculation || errors.costInput || errors.targetSrp ? (
                        <p className="text-red-600">Please correct the input errors to see results.</p>
                    ) : (
                        <p className="text-gray-500">Enter cost or target SRP to see calculations.</p>
                    )}
                    {(errors.exchangeRate || errors.customExchangeRate) && formData.currency === 'EUR' && (
                         <p className="text-yellow-700 text-sm mt-2">Note: Using default/previous exchange rate due to input error.</p>
                    )}
                </div>
            )}

            {/* Display Results Area */}
            {hasCalculations && (
                <div className="bg-white p-4 md:p-6 rounded-lg shadow border border-gray-100">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Calculation Results {isCalculating ? '(Recalculating...)' : ''}</h3>

                    {/* Derived Cost Box for Reverse Mode */}
                     {formData.calculationMode === 'reverse' && calculations.baseBottleCostOriginal != null && (
                         <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-md text-sm">
                             <p className="font-semibold mb-1">
                                 Derived Supplier Cost ({formData.currency}) - Based on {reverseTargetModel} Target:
                             </p>
                             <p className="flex justify-between">
                                 <span>Calculated Bottle Cost:</span>
                                 <span>{formatCurrency(calculations.baseBottleCostOriginal, formData.currency, 4)}</span>
                             </p>
                             <p className="flex justify-between">
                                 <span>Calculated Case Cost:</span>
                                 <span>{formatCurrency(calculations.baseCasePriceOriginal, formData.currency, 2)}</span>
                             </p>
                         </div>
                     )}

                    {/* DI and SS Columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* DI Pricing Column */}
                        <div>
                            {/* (Copy DI Column JSX here) */}
                             <h4 className="text-md font-medium text-gray-700 mb-2 border-b pb-1">
                               Direct Import Pricing
                               {formData.calculationMode === 'reverse' && reverseTargetModel === 'DI' && (
                                 <span className="text-xs font-normal text-blue-600 ml-2">(Target Model)</span>
                               )}
                             </h4>
                             <div className="space-y-1 text-sm">
                               <p className="flex justify-between"><span>Base Case Cost (USD):</span> <span>{formatCurrency(calculations.caseCostUSD)}</span></p>
                               <p className="flex justify-between"><span>Tariff ({formData.tariff}%):</span> <span>{formatCurrency(calculations.tariffAmountUSD)}</span></p>
                               <p className="flex justify-between"><span>DI Logistics:</span> <span>{formatCurrency(formData.diLogistics)}</span></p>
                               <p className="flex justify-between"><span>Supp. Laid-In DI:</span> <span>{formatCurrency(calculations.supplierLaidInCostDI_USD)}</span></p>
                               <p className="flex justify-between font-semibold"><span>Supp. FOB DI ({formData.supplierMargin}%):</span> <span>{formatCurrency(calculations.supplierFobDI_USD)}</span></p>
                               <p className="flex justify-between"><span>Dist. Laid-In DI:</span> <span>{formatCurrency(calculations.distributorLaidInCostDI_USD)}</span></p>
                               <p className="flex justify-between font-semibold"><span>Dist. Whsl Case DI ({formData.distributorMargin}%):</span> <span>{formatCurrency(calculations.distCaseWholesaleDI_USD)}</span></p>
                               <p className="flex justify-between font-semibold"><span>Dist. Whsl Bottle DI:</span> <span>{formatCurrency(calculations.distBottleWholesaleDI_USD)}</span></p>
                               <p className="flex justify-between"><span>Dist. BTG Bottle DI ({formData.distributorBtgMargin}%):</span> <span>{formatCurrency(calculations.distBtgPriceDI_USD)}</span></p>
                               <p className="flex justify-between items-baseline mt-2">
                                   <span className="font-semibold">SRP (DI, {formData.retailerMargin}%):</span>
                                   <span className={`text-2xl font-bold ${formData.calculationMode === 'reverse' && reverseTargetModel === 'DI' ? 'text-blue-700' : 'text-blue-500'}`}>
                                     {formatCurrency(calculations.srpDi_USD)}
                                   </span>
                               </p>
                               {formData.roundSrp && calculations.originalSrpDi_USD && calculations.srpDi_USD !== calculations.originalSrpDi_USD && (
                                    <p className="text-xs text-gray-500 text-right">(Rounded from {formatCurrency(calculations.originalSrpDi_USD)})</p>
                               )}
                             </div>
                        </div>
                        {/* SS Pricing Column */}
                        <div>
                            {/* (Copy SS Column JSX here) */}
                             <h4 className="text-md font-medium text-gray-700 mb-2 border-b pb-1">
                               Stateside Inventory Pricing
                               {formData.calculationMode === 'reverse' && reverseTargetModel === 'SS' && (
                                 <span className="text-xs font-normal text-blue-600 ml-2">(Target Model)</span>
                               )}
                             </h4>
                             <div className="space-y-1 text-sm">
                               <p className="flex justify-between"><span>Supp. Base Cost SS:</span> <span>{formatCurrency(calculations.supplierLaidInCostSS_USD)}</span></p>
                               <p className="flex justify-between font-semibold"><span>Supp. FOB SS ({formData.supplierMargin}%):</span> <span>{formatCurrency(calculations.supplierFobSS_USD)}</span></p>
                               <p className="flex justify-between">
                                   <span>Stateside Logistics:</span>
                                   <span className="text-gray-500 italic font-normal">(+{formatCurrency(formData.statesideLogistics)})</span>
                               </p>
                               <p className="flex justify-between"><span>Dist. Laid-In SS:</span> <span>{formatCurrency(calculations.distributorLaidInCostSS_USD)}</span></p>
                               <p className="flex justify-between font-semibold"><span>Dist. Whsl Case SS ({formData.distributorMargin}%):</span> <span>{formatCurrency(calculations.distCaseWholesaleSS_USD)}</span></p>
                               <p className="flex justify-between font-semibold"><span>Dist. Whsl Bottle SS:</span> <span>{formatCurrency(calculations.distBottleWholesaleSS_USD)}</span></p>
                               <p className="flex justify-between"><span>Dist. BTG Bottle SS ({formData.distributorBtgMargin}%):</span> <span>{formatCurrency(calculations.distBtgPriceSS_USD)}</span></p>
                               <p className="flex justify-between items-baseline mt-2">
                                   <span className="font-semibold">SRP (SS, {formData.retailerMargin}%):</span>
                                   <span className={`text-2xl font-bold ${formData.calculationMode === 'reverse' && reverseTargetModel === 'SS' ? 'text-blue-700' : 'text-blue-500'}`}>
                                     {formatCurrency(calculations.srpSs_USD)}
                                   </span>
                               </p>
                               {formData.roundSrp && calculations.originalSrpSs_USD && calculations.srpSs_USD !== calculations.originalSrpSs_USD && (
                                    <p className="text-xs text-gray-500 text-right">(Rounded from {formatCurrency(calculations.originalSrpSs_USD)})</p>
                               )}
                             </div>
                        </div>
                    </div>

                    {/* Gross Profit Section */}
                     {hasCalculations && formData.casesSold > 0 && (
                         <div className="mt-6 pt-4 border-t">
                             <button type="button" onClick={() => setShowGrossProfit(!showGrossProfit)} className="flex items-center text-sm text-blue-600 hover:text-blue-800 focus:outline-none mb-2">
                                 {showGrossProfit ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />} Gross Profit Analysis ({formData.casesSold} Cases)
                             </button>
                             {showGrossProfit && (
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm bg-gray-50 p-3 rounded border">
                                     {/* DI GP */}
                                     <div>
                                         <h5 className="font-medium text-gray-600 mb-1">Direct Import GP</h5>
                                         <p className="flex justify-between"><span>Supplier GP DI:</span> <span className="font-semibold">{formatCurrency(calculations.supplierGrossProfitDI)}</span></p>
                                         <p className="flex justify-between"><span>Distributor GP DI:</span> <span className="font-semibold">{formatCurrency(calculations.distributorGrossProfitDI)}</span></p>
                                     </div>
                                     {/* SS GP */}
                                     <div>
                                         <h5 className="font-medium text-gray-600 mb-1">Stateside Inventory GP</h5>
                                         <p className="flex justify-between"><span>Supplier GP SS:</span> <span className="font-semibold">{formatCurrency(calculations.supplierGrossProfitSS)}</span></p>
                                         <p className="flex justify-between"><span>Distributor GP SS:</span> <span className="font-semibold">{formatCurrency(calculations.distributorGrossProfitSS)}</span></p>
                                     </div>
                                 </div>
                             )}
                         </div>
                     )}
                </div>
            )}
        </>
    );
};

export default ResultsPanel;