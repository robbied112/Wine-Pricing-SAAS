// components/Calculator/InputPanel.jsx
import React from 'react';
import { RefreshCw, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'; // Import icons used here

// --- Constants needed only within InputPanel (if any, otherwise keep in parent) ---
// You can move CURRENCIES, BOTTLE_SIZES, CASE_PACK_SIZES here if ONLY used here,
// but they are likely needed elsewhere (like download), so keep them in parent for now.

// --- InputPanel Component Definition ---
const InputPanel = ({
    formData,
    // Removed setFormData (pass specific handlers instead)
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
    // --- Props for Reverse Target Model ---
    reverseTargetModel,
    handleReverseTargetChange
}) => {

    // Function to get the effective rate for display
    const getEffectiveRate = () => {
        // (Keep the existing getEffectiveRate function logic here)
        if (formData.currency === 'USD') return 'N/A';
        const baseRate = parseFloat(formData.exchangeRate);
        const buffer = parseFloat(formData.exchangeBuffer) || 0;
        const customRate = parseFloat(formData.customExchangeRate);

        if (formData.useCustomExchangeRate) {
            return !isNaN(customRate) ? customRate.toFixed(4) : 'Invalid';
        } else {
            return !isNaN(baseRate) ? (baseRate * (1 + buffer / 100)).toFixed(4) : 'Invalid Base';
        }
    };

    // --- JSX for the Input Panel ---
    // (Copy the ENTIRE return (...) block from the existing InputPanel definition in your original code)
    return (
        <div className="bg-white p-4 md:p-6 rounded-lg shadow border border-gray-100 print:hidden">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Input Parameters</h3>
            <div className="space-y-4">
                {/* Wine Name */}
                <div>
                    <label htmlFor="wineName" className="block text-sm font-medium text-gray-700">Wine Name</label>
                    <input type="text" id="wineName" name="wineName" value={formData.wineName} onChange={handleInputChange} placeholder="Enter wine name (optional)" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"/>
                </div>
                {/* Calculation Mode */}
                <div>
                    <label htmlFor="calculationMode" className="block text-sm font-medium text-gray-700">Calculation Mode</label>
                    <select id="calculationMode" name="calculationMode" value={formData.calculationMode} onChange={handleSelectChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white">
                        <option value="forward">Forward (Cost to SRP)</option>
                        <option value="reverse">Reverse (SRP to Cost)</option>
                    </select>
                </div>
                {/* Supplier Cost Inputs (Forward Mode) */}
                {formData.calculationMode === 'forward' && (
                    <div className="p-3 border rounded-md bg-gray-50">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Cost ({formData.currency})</label>
                        <div className="grid grid-cols-2 gap-3">
                             {/* Bottle Cost Input */}
                             <div>
                                 <label htmlFor="bottleCost" className="block text-xs font-medium text-gray-500">Bottle Cost</label>
                                 <input type="number" id="bottleCost" name="bottleCost" value={formData.bottleCost} onChange={handleInputChange} placeholder="e.g., 5.00" min="0" step="0.01" className={`mt-1 block w-full px-3 py-2 border ${errors.bottleCost || errors.costInput ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}/>
                             </div>
                             {/* Case Price Input */}
                             <div>
                                  <label htmlFor="casePrice" className="block text-xs font-medium text-gray-500">Case Price</label>
                                 <input type="number" id="casePrice" name="casePrice" value={formData.casePrice} onChange={handleInputChange} placeholder="e.g., 60.00" min="0" step="0.01" className={`mt-1 block w-full px-3 py-2 border ${errors.casePrice || errors.costInput ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}/>
                             </div>
                        </div>
                        {errors.costInput && <p className="mt-1 text-xs text-red-600">{errors.costInput}</p>}
                        {!errors.costInput && <p className="mt-1 text-xs text-gray-500">Enter either bottle or case cost ({formData.currency}).</p>}
                    </div>
                )}
                {/* Target SRP Input (Reverse Mode) */}
                {formData.calculationMode === 'reverse' && (
                     <div className="p-3 border rounded-md bg-gray-50">
                         <label htmlFor="targetSrp" className="block text-sm font-medium text-gray-700">Target SRP (USD)</label>
                         <input type="number" id="targetSrp" name="targetSrp" value={formData.targetSrp} onChange={handleInputChange} placeholder="e.g., 19.99" min="0" step="0.01" className={`mt-1 block w-full px-3 py-2 border ${errors.targetSrp ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}/>
                         {errors.targetSrp && <p className="mt-1 text-xs text-red-600">{errors.targetSrp}</p>}
                         {/* Reverse Target Model Selector */}
                         <div className="mt-2">
                              <label htmlFor="reverseTargetModel" className="block text-sm font-medium text-gray-700">Target SRP Applies To:</label>
                              <select
                                id="reverseTargetModel"
                                name="reverseTargetModel"
                                value={reverseTargetModel}
                                onChange={handleReverseTargetChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                              >
                                <option value="SS">Stateside Inventory (SS)</option>
                                <option value="DI">Direct Import (DI)</option>
                              </select>
                              <p className="mt-1 text-xs text-gray-500">Select which pricing model your target SRP is based on.</p>
                         </div>
                     </div>
                )}
                {/* Currency Selection */}
                <div>
                    {/* (Keep Currency select JSX here) */}
                    <label htmlFor="currency" className="block text-sm font-medium text-gray-700">Supplier Cost Currency</label>
                    <select
                        id="currency" name="currency" value={formData.currency} onChange={handleCurrencyChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
                    >
                       {/* Assuming CURRENCIES is defined in parent or imported */}
                       {['EUR', 'USD'].map((currencyCode) => (
                         <option key={currencyCode} value={currencyCode}>{currencyCode}</option>
                       ))}
                    </select>
                </div>
                {/* Case Pack & Bottle Size */}
                <div className="grid grid-cols-2 gap-3">
                    {/* (Keep Case Pack select JSX here) */}
                    <div>
                       <label htmlFor="casePackSize" className="block text-sm font-medium text-gray-700">Case Pack</label>
                       <select id="casePackSize" name="casePackSize" value={formData.casePackSize} onChange={handleSelectChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white">
                         {/* Assuming CASE_PACK_SIZES is defined in parent or imported */}
                         {[12, 6, 3, 1].map(size => <option key={size} value={size}>{size}</option>)}
                       </select>
                    </div>
                    {/* (Keep Bottle Size select JSX here) */}
                    <div>
                       <label htmlFor="bottleSize" className="block text-sm font-medium text-gray-700">Bottle Size</label>
                       <select id="bottleSize" name="bottleSize" value={formData.bottleSize} onChange={handleSelectChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white">
                         {/* Assuming BOTTLE_SIZES is defined in parent or imported */}
                         {['750ml', '375ml', '500ml', '1L', '1.5L', '3L'].map(size => <option key={size} value={size}>{size}</option>)}
                       </select>
                    </div>
                </div>
                {/* Exchange Rate Section */}
                {formData.currency === 'EUR' && (
                    // (Keep the entire Exchange Rate div block JSX here)
                     <div className="p-3 border rounded-md bg-gray-50 space-y-2">
                       <div className="flex items-center justify-between">
                         <label className="block text-sm font-medium text-gray-700">Exchange Rate (EUR to USD)</label>
                         {!formData.useCustomExchangeRate && (
                           <button className="p-1 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed" onClick={handleRefreshRate} title="Force refresh exchange rate (Uses API Credit)" disabled={isExchangeRateLoading} type="button" aria-label="Refresh Base Exchange Rate">
                             {isExchangeRateLoading ? <div className="w-3 h-3 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div> : <RefreshCw className="w-3 h-3"/>}
                           </button>
                         )}
                       </div>
                       {exchangeRateError && <p className="text-xs text-yellow-700 bg-yellow-100 p-1 rounded border border-yellow-200 flex items-center"><AlertCircle className="w-3 h-3 mr-1"/>{exchangeRateError}</p>}
                       <div className="flex items-center space-x-2 pt-1">
                         <input id="useCustomExchangeRate" name="useCustomExchangeRate" type="checkbox" checked={formData.useCustomExchangeRate} onChange={handleCustomRateToggle} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"/>
                         <label htmlFor="useCustomExchangeRate" className="text-sm text-gray-600">Use Manual Rate</label>
                       </div>
                       <div className="flex items-center space-x-2 mt-1">
                         <label htmlFor="exchangeRateInput" className="text-sm text-gray-500 w-24 whitespace-nowrap">
                           {formData.useCustomExchangeRate ? "Manual Rate:" : "Fetched Rate:"}
                         </label>
                         <input
                           type="number" id="exchangeRateInput"
                           name={formData.useCustomExchangeRate ? "customExchangeRate" : "exchangeRate"}
                           value={formData.useCustomExchangeRate ? formData.customExchangeRate : formData.exchangeRate}
                           onChange={handleInputChange} min="0" step="0.0001"
                           className={`block w-28 px-2 py-1 border ${errors.exchangeRate || errors.customExchangeRate ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed`}
                           placeholder="e.g., 1.0750"
                           disabled={!formData.useCustomExchangeRate}
                           aria-label={formData.useCustomExchangeRate ? "Custom Exchange Rate" : "Fetched Exchange Rate"}
                         />
                           {errors.exchangeRate && !formData.useCustomExchangeRate && <p className="mt-1 text-xs text-red-600">{errors.exchangeRate}</p>}
                           {errors.customExchangeRate && formData.useCustomExchangeRate && <p className="mt-1 text-xs text-red-600">{errors.customExchangeRate}</p>}
                       </div>
                       <div className="flex items-center space-x-2 mt-1">
                         <label htmlFor="exchangeBuffer" className="text-sm text-gray-500 w-24 whitespace-nowrap">Rate Buffer (%):</label>
                         <input type="number" id="exchangeBuffer" name="exchangeBuffer" value={formData.exchangeBuffer} onChange={handleInputChange} min="0" max="100" step="0.1" className={`block w-20 px-2 py-1 border ${errors.exchangeBuffer ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} placeholder="e.g., 5" aria-label="Exchange Rate Buffer"/>
                           {errors.exchangeBuffer && <p className="mt-1 text-xs text-red-600">{errors.exchangeBuffer}</p>}
                       </div>
                       <div className="text-xs text-gray-500 mt-1">
                            Effective Rate: {getEffectiveRate()} ( {formData.useCustomExchangeRate ? 'Manual' : `Workspaceed ${formData.exchangeRate} + ${formData.exchangeBuffer || 0}% buffer`})
                       </div>
                     </div>
                )}
                {/* Advanced Options Toggle */}
                <div className="mt-4">
                    <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center text-sm text-blue-600 hover:text-blue-800 focus:outline-none">
                        {showAdvanced ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />} {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
                    </button>
                </div>
                {/* Advanced Options Inputs */}
                {showAdvanced && (
                    // (Keep the entire Advanced Options div block JSX here)
                     <div className="p-3 border rounded-md bg-gray-50 space-y-3 mt-2">
                       <h4 className="text-sm font-medium text-gray-600 mb-2">Costs & Margins</h4>
                       <div>
                           <label htmlFor="diLogistics" className="block text-xs font-medium text-gray-500">DI Logistics (USD/Case)</label>
                           <input type="number" id="diLogistics" name="diLogistics" value={formData.diLogistics} onChange={handleInputChange} min="0" step="0.01" placeholder="e.g., 13" className={`mt-1 block w-full px-3 py-2 border ${errors.diLogistics ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} /> {errors.diLogistics && <p className="mt-1 text-xs text-red-600">{errors.diLogistics}</p>}
                       </div>
                       <div>
                           <label htmlFor="tariff" className="block text-xs font-medium text-gray-500">Tariff (%)</label>
                           <input type="number" id="tariff" name="tariff" value={formData.tariff} onChange={handleInputChange} min="0" max="200" step="0.1" placeholder="e.g., 0" className={`mt-1 block w-full px-3 py-2 border ${errors.tariff ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} /> {errors.tariff && <p className="mt-1 text-xs text-red-600">{errors.tariff}</p>}
                       </div>
                       <div>
                           <label htmlFor="statesideLogistics" className="block text-xs font-medium text-gray-500">Stateside Logistics (USD/Case)</label>
                           <input type="number" id="statesideLogistics" name="statesideLogistics" value={formData.statesideLogistics} onChange={handleInputChange} min="0" step="0.01" placeholder="e.g., 10" className={`mt-1 block w-full px-3 py-2 border ${errors.statesideLogistics ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} /> {errors.statesideLogistics && <p className="mt-1 text-xs text-red-600">{errors.statesideLogistics}</p>}
                       </div>
                       <div className="grid grid-cols-2 gap-3">
                           <div>
                               <label htmlFor="supplierMargin" className="block text-xs font-medium text-gray-500">Supplier Margin (%)</label>
                               <input type="number" id="supplierMargin" name="supplierMargin" value={formData.supplierMargin} onChange={handleInputChange} min="0" max="100" step="0.1" placeholder="e.g., 30" className={`mt-1 block w-full px-3 py-2 border ${errors.supplierMargin ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} /> {errors.supplierMargin && <p className="mt-1 text-xs text-red-600">{errors.supplierMargin}</p>}
                           </div>
                           <div>
                               <label htmlFor="distributorMargin" className="block text-xs font-medium text-gray-500">Distributor Margin (%)</label>
                               <input type="number" id="distributorMargin" name="distributorMargin" value={formData.distributorMargin} onChange={handleInputChange} min="0" max="100" step="0.1" placeholder="e.g., 30" className={`mt-1 block w-full px-3 py-2 border ${errors.distributorMargin ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} /> {errors.distributorMargin && <p className="mt-1 text-xs text-red-600">{errors.distributorMargin}</p>}
                           </div>
                           <div>
                               <label htmlFor="distributorBtgMargin" className="block text-xs font-medium text-gray-500">Dist. BTG Margin (%)</label>
                               <input type="number" id="distributorBtgMargin" name="distributorBtgMargin" value={formData.distributorBtgMargin} onChange={handleInputChange} min="0" max="100" step="0.1" placeholder="e.g., 27" className={`mt-1 block w-full px-3 py-2 border ${errors.distributorBtgMargin ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} /> {errors.distributorBtgMargin && <p className="mt-1 text-xs text-red-600">{errors.distributorBtgMargin}</p>}
                           </div>
                           <div>
                               <label htmlFor="retailerMargin" className="block text-xs font-medium text-gray-500">Retailer Margin (%)</label>
                               <input type="number" id="retailerMargin" name="retailerMargin" value={formData.retailerMargin} onChange={handleInputChange} min="0" max="100" step="0.1" placeholder="e.g., 33" className={`mt-1 block w-full px-3 py-2 border ${errors.retailerMargin ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} /> {errors.retailerMargin && <p className="mt-1 text-xs text-red-600">{errors.retailerMargin}</p>}
                           </div>
                       </div>
                       <div className="flex items-center space-x-2">
                           <input id="roundSrp" name="roundSrp" type="checkbox" checked={formData.roundSrp} onChange={handleInputChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"/>
                           <label htmlFor="roundSrp" className="text-sm text-gray-600">Round SRP to nearest .99?</label>
                       </div>
                       <div>
                           <label htmlFor="casesSold" className="block text-xs font-medium text-gray-500">Cases Sold (for GP Calc)</label>
                           <input type="number" id="casesSold" name="casesSold" value={formData.casesSold} onChange={handleInputChange} min="0" step="1" placeholder="e.g., 100" className={`mt-1 block w-full px-3 py-2 border ${errors.casesSold ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} /> {errors.casesSold && <p className="mt-1 text-xs text-red-600">{errors.casesSold}</p>}
                       </div>
                     </div>
                )}
            </div>
        </div>
    );
};

export default InputPanel;