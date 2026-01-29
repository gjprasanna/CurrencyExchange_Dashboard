

// import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// import { ChevronDown, Search, TrendingUp, TrendingDown, Minus, RefreshCw, AlertCircle } from 'lucide-react';

// const API_BASE = 'http://localhost:8080';

// // ==================== INTERFACES ====================
// interface Currency {
//   code: string;
//   name: string;
//   bnrrate: number;
//   buyCustomerRate: number;
//   sellCustomerRate: number;
//   previousBnrRate: number | null;
//   bnrRateDifference: number | null;
//   bnrRateChangePercent: number | null;
//   previousBuyCustomerRate: number | null;
//   buyRateDifference: number | null;
//   buyRateChangePercent: number | null;
//   previousSellCustomerRate: number | null;
//   sellRateDifference: number | null;
//   sellRateChangePercent: number | null;
//   hasHistoricalData: boolean;
// }

// interface ConversionResponse {
//   buyCode: string;
//   sellCode: string;
//   inputAmount: number;
//   conversionRate: number;
//   finalAmount: number;
//   treasuryRate: number;
//   customerRate: number;
//   spread: number;
//   pnlStatus: string;
//   tradingDate: string; 
// }

// interface CurrencyPosition {
//   id: number;
//   currencyCode: string;
//   positionStatus: string;
//   lastUpdated: string;
// }

// // ==================== POSITION PANEL COMPONENT (UPDATED) ====================
// const PositionPanel: React.FC<{ activeBuy: string; activeSell: string }> = ({ activeBuy, activeSell }) => {
//   const [positions, setPositions] = useState<CurrencyPosition[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const fetchPositions = async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const res = await fetch(`${API_BASE}/api/positions/list`);
//       if (!res.ok) throw new Error('Failed to load positions');
//       const data = await res.json();
//       setPositions(data);
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPositions();
//     const interval = setInterval(fetchPositions, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   // Manager's Logic: Sort active currencies to the top
//   const sortedPositions = useMemo(() => {
//     const pinned = positions.filter(p => p.currencyCode === activeBuy || p.currencyCode === activeSell);
//     const rest = positions.filter(p => p.currencyCode !== activeBuy && p.currencyCode !== activeSell);
//     return { pinned, rest };
//   }, [positions, activeBuy, activeSell]);

//   const getPositionStyle = (status: string) => {
//     switch (status.toUpperCase()) {
//       case 'LONG': return { bg: '#ecfdf5', color: '#059669', border: '#10b981', icon: '📈', label: 'LONG' };
//       case 'SHORT': return { bg: '#fef2f2', color: '#dc2626', border: '#ef4444', icon: '📉', label: 'SHORT' };
//       // case 'NEUTRAL': return { bg: '#f3f4f6', color: '#6b7280', border: '#9ca3af', icon: '➖', label: 'NEUTRAL' };
//       default: return { bg: '#f9fafb', color: '#4b5563', border: '#d1d5db', icon: '❓', label: status };
//     }
//   };

//   return (
//     <div style={{
//       width: '100%', maxWidth: '450px', backgroundColor: 'white', borderRadius: '16px',
//       boxShadow: '0 4px 20px rgba(0,0,0,0.1)', padding: '30px', display: 'flex', 
//       flexDirection: 'column', height: '850px' // Fixed height to enable scrolling
//     }}>
//       <div style={{ marginBottom: '15px', paddingBottom: '12px', borderBottom: '2px solid #e5e7eb' }}>
//         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//           <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>Positions</h2>
//           <button 
//             onClick={fetchPositions} 
//             aria-label="Refresh positions"
//             style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#4f46e5' }}
//           >
//             <RefreshCw size={14} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
//           </button>
//         </div>
//       </div>

//       <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
//         {/* Pinned Section */}
//         {sortedPositions.pinned.map((pos) => {
//           const s = getPositionStyle(pos.positionStatus);
//           return (
//             <div key={pos.id} style={{ padding: '12px', backgroundColor: s.bg, border: `2px solid #4f46e5`, borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', boxShadow: '0 2px 4px rgba(79, 70, 229, 0.1)' }}>
//               <div>
//                 <div style={{ fontSize: '16px', fontWeight: '800', color: '#111827' }}>{pos.currencyCode} <span style={{fontSize: '10px', color: '#4f46e5'}}>(ACTIVE)</span></div>
//                 <div style={{ fontSize: '10px', color: '#6b7280' }}>{new Date(pos.lastUpdated).toLocaleTimeString()}</div>
//               </div>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', backgroundColor: 'white', borderRadius: '20px', border: `1px solid ${s.border}`, fontSize: '12px', fontWeight: '700', color: s.color }}>
//                 {s.icon} {s.label}
//               </div>
//             </div>
//           );
//         })}

//         {/* Separator */}
//         {sortedPositions.pinned.length > 0 && sortedPositions.rest.length > 0 && (
//           <div style={{ margin: '20px 0', borderTop: '2px dashed #e2e8f0', position: 'relative' }}>
//              <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'white', padding: '0 10px', fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>
//                Other Positions
//              </span>
//           </div>
//         )}

//         {/* Rest of Currencies */}
//         {sortedPositions.rest.map((pos) => {
//           const s = getPositionStyle(pos.positionStatus);
//           return (
//             <div key={pos.id} style={{ padding: '12px', backgroundColor: s.bg, border: `2px solid ${s.border}`, borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
//               <div>
//                 <div style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>{pos.currencyCode}</div>
//                 <div style={{ fontSize: '10px', color: '#6b7280' }}>{new Date(pos.lastUpdated).toLocaleTimeString()}</div>
//               </div>
//               <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', backgroundColor: 'white', borderRadius: '20px', border: `1px solid ${s.border}`, fontSize: '12px', fontWeight: '700', color: s.color }}>
//                 {s.icon} {s.label}
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '2px solid #e5e7eb', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
//         {['LONG', 'SHORT'].map(status => (
//           <div key={status} style={{ textAlign: 'center' }}>
//             <div style={{ fontSize: '18px', fontWeight: '700', color: getPositionStyle(status).color }}>
//               {positions.filter(p => p.positionStatus.toUpperCase() === status).length}
//             </div>
//             <div style={{ fontSize: '9px', color: '#6b7280', fontWeight: '700' }}>{status}</div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// // ==================== RATE COMPARISON COMPONENT (UNCHANGED) ====================
// const RateWithComparison: React.FC<{
//   label: string; currentRate: number; difference: number | null; percentChange: number | null; hasHistory: boolean;
// }> = ({ label, currentRate, difference, percentChange, hasHistory }) => {
//   const isPositive = difference !== null && difference > 0;
//   const isNegative = difference !== null && difference < 0;
//   const color = isPositive ? '#059669' : isNegative ? '#dc2626' : '#6b7280';

//   return (
//     <div style={{ textAlign: 'center', padding: '8px 0' }}>
//       <div style={{ fontSize: '12px', fontWeight: '700', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{label}</div>
//       <div style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>{currentRate.toFixed(6)}</div>
//       {hasHistory && difference !== null && percentChange !== null ? (
//         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '11px', fontWeight: '600', color: color }}>
//             {isPositive ? <TrendingUp size={12} /> : isNegative ? <TrendingDown size={12} /> : <Minus size={12} />}
//             <span>{Math.abs(difference).toFixed(6)}</span>
//           </div>
//           <div style={{ fontSize: '11px', fontWeight: '700', backgroundColor: isPositive ? '#ecfdf5' : isNegative ? '#fef2f2' : '#f3f4f6', color: color, padding: '2px 6px', borderRadius: '4px', border: `1px solid ${isPositive ? '#10b981' : isNegative ? '#ef4444' : '#d1d5db'}` }}>
//             {isPositive ? '+' : ''}{percentChange.toFixed(2)}%
//           </div>
//         </div>
//       ) : <div style={{ fontSize: '10px', color: '#9ca3af', fontStyle: 'italic' }}>No history</div>}
//     </div>
//   );
// };

// // ==================== DROPDOWN COMPONENT (UNCHANGED) ====================
// const SearchableDropdown: React.FC<{
//   currencies: Currency[]; value: string; onChange: (code: string) => void; label: string; isBuySide: boolean;
// }> = ({ currencies, value, onChange, label, isBuySide }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState('');
//   const dropdownRef = useRef<HTMLDivElement>(null);
//   const selectedCurrency = currencies.find(c => c.code === value);
//   const filteredCurrencies = currencies.filter(c => c.code.toLowerCase().includes(searchTerm.toLowerCase()) || c.name.toLowerCase().includes(searchTerm.toLowerCase()));

//   useEffect(() => {
//     const handleClickOutside = (e: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false); };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   return (
//     <div style={{ flex: 1, position: 'relative' }} ref={dropdownRef}>
//       <label style={{ display: 'block', fontSize: '17px', fontWeight: '700', color: '#4f46e5', marginBottom: '8px', textAlign: 'center' }}>{label}</label>
//       <button onClick={() => setIsOpen(!isOpen)} style={{ width: '100%', padding: '10px 14px', fontSize: '14px', fontWeight: '600', color: '#111827', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//         <span style={{ flex: 1, textAlign: 'center' }}>{value}</span>
//         <ChevronDown style={{ width: '18px', height: '18px', color: '#6b7280', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }} />
//       </button>
//       {isOpen && (
//         <div style={{ position: 'absolute', width: '100%', marginTop: '4px', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', zIndex: 1000, maxHeight: '280px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
//           <div style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>
//             <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: '6px', padding: '8px 12px' }}>
//               <Search style={{ width: '16px', height: '16px', color: '#9ca3af', marginRight: '8px' }} />
//               <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 1, border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '13px', color: '#111827' }} autoFocus />
//             </div>
//           </div>
//           <div style={{ overflowY: 'auto', maxHeight: '200px' }}>
//             {filteredCurrencies.map(c => (
//               <div key={c.code} onClick={() => { onChange(c.code); setIsOpen(false); setSearchTerm(''); }} style={{ padding: '10px 16px', cursor: 'pointer', backgroundColor: c.code === value ? '#eef2ff' : 'white' }}>
//                 <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>{c.code}</div>
//                 <div style={{ fontSize: '11px', color: '#6b7280' }}>{c.name}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//       {selectedCurrency && (
//         <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
//           <RateWithComparison label="BNR Rate" currentRate={selectedCurrency.bnrrate} difference={selectedCurrency.bnrRateDifference} percentChange={selectedCurrency.bnrRateChangePercent} hasHistory={selectedCurrency.hasHistoricalData} />
//           <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '8px 0' }} />
//           <RateWithComparison label="T24 Rate" currentRate={isBuySide ? selectedCurrency.buyCustomerRate : selectedCurrency.sellCustomerRate} difference={isBuySide ? selectedCurrency.buyRateDifference : selectedCurrency.sellRateDifference} percentChange={isBuySide ? selectedCurrency.buyRateChangePercent : selectedCurrency.sellRateChangePercent} hasHistory={selectedCurrency.hasHistoricalData} />
//         </div>
//       )}
//     </div>
//   );
// };

// // ==================== MAIN DASHBOARD ====================
// const FXDashboard: React.FC = () => {
//   const [currencies, setCurrencies] = useState<Currency[]>([]);
//   const [amount, setAmount] = useState<string>('100');
//   const [buyCode, setBuyCode] = useState<string>(() => sessionStorage.getItem('fxBuyCode') || 'USD');
//   const [sellCode, setSellCode] = useState<string>(() => sessionStorage.getItem('fxSellCode') || 'EUR');
//   const [customerRate, setCustomerRate] = useState<string>('');
//   const [result, setResult] = useState<ConversionResponse | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const latestRequestRef = useRef(0);
//   const abortControllerRef = useRef<AbortController | null>(null);

//    useEffect(() => {
//     sessionStorage.setItem('fxBuyCode', buyCode);
//   }, [buyCode]);

//   useEffect(() => {
//     sessionStorage.setItem('fxSellCode', sellCode);
//   }, [sellCode]);


//   const fetchCurrencies = useCallback(async () => {
//     setIsRefreshing(true); setError(null);
//     try {
//       const res = await fetch(`${API_BASE}/api/currencies/list?v=${Date.now()}`);
//       if (!res.ok) throw new Error('Failed to load exchange rates');
//       setCurrencies(await res.json());
//     } catch (err) { setError("Unable to load exchange rates. Please refresh."); } finally { setIsRefreshing(false); }
//   }, []);

//   useEffect(() => { fetchCurrencies(); }, [fetchCurrencies]);

//   const performCalculation = useCallback(async (currentRequestId: number, isManualRate: boolean = false) => {
//     const numAmount = parseFloat(amount);
    
//     // 1. GUARD: Clear results if amount is invalid
//     if (isNaN(numAmount) || numAmount <= 0) {
//       setResult(null);
//       setIsLoading(false);
//       return;
//     }

//     // 2. SAME CURRENCY LOGIC (e.g., USD to USD)
//     if (buyCode === sellCode) {
//       // Determine what rate to use:
//       // If the user is typing manually, parse their input. Otherwise, default to 1.0
//       const manualInput = parseFloat(customerRate);
//       const activeRate = isManualRate && !isNaN(manualInput) ? manualInput : 1.0;
      
//       // Stop calculation if manual rate is 0 or invalid to prevent weird UI states
//       if (isManualRate && activeRate <= 0) {
//         setIsLoading(false);
//         return;
//       }

//       setResult({
//         buyCode,
//         sellCode,
//         inputAmount: numAmount,
//         conversionRate: 1.0,
//          tradingDate: new Date().toISOString().split('T')[0],
//         finalAmount: numAmount, // Apply the custom rate even for same currency
//         treasuryRate: 1.0,
//         customerRate: activeRate,
//         spread: activeRate - 1.0, // Shows profit/loss relative to 1:1
//         pnlStatus: activeRate > 1.0 ? 'PROFIT' : activeRate < 1.0 ? 'LOSS' : 'NEUTRAL'
//       });

//       // Only update the input box to "1.000000" if this WAS NOT a manual edit
//       // (e.g., the user just selected USD/USD for the first time)
//       if (!isManualRate) {
//         setCustomerRate("1.000000");
//       }
      
//       setIsLoading(false);
//       return;
//     }

//     // 3. EXTERNAL API CALCULATION (e.g., USD to EUR)
//     // Guard: Don't send invalid manual rates to the server
//     if (isManualRate && (parseFloat(customerRate) <= 0 || isNaN(parseFloat(customerRate)))) {
//       return;
//     }

//     if (abortControllerRef.current) abortControllerRef.current.abort();
//     abortControllerRef.current = new AbortController();
//     setIsLoading(true);

//     try {
//       const payload: any = { amount: numAmount, buyCode, sellCode };
//       if (isManualRate && customerRate) {
//         payload.customCustomerRate = parseFloat(customerRate);
//       }
      
//       const res = await fetch(`${API_BASE}/api/fx/calculate`, {
//         method: 'POST', 
//         headers: { 'Content-Type': 'application/json' }, 
//         body: JSON.stringify(payload),
//         signal: abortControllerRef.current.signal
//       });

//       if (!res.ok) throw new Error('Calculation failed');
//       const data = await res.json();

//       if (currentRequestId === latestRequestRef.current) {
//         setResult(data);
        
//         // CRITICAL LOOP PROTECTION: 
//         // Only update the input box if the API returned a new value 
//         // AND the user isn't currently typing in it.
//         if (!isManualRate && !customerRate) {
//   setCustomerRate(data.customerRate.toString());
// }
//       }
//     } catch (e: any) {
//       if (e.name !== 'AbortError') setError(e.message);
//     } finally {
//       if (currentRequestId === latestRequestRef.current) {
//         setIsLoading(false);
//       }
//     }
//   }, [amount, buyCode, sellCode, customerRate]);

//   // EFFECT 1: Automatic trigger (Code or Amount change)
//   useEffect(() => {
//     const reqId = ++latestRequestRef.current;
//     performCalculation(reqId, false);
//   }, [amount, buyCode, sellCode]);

//   // EFFECT 2: Manual trigger (Customer Rate typing)
//   useEffect(() => {
//     if (!customerRate) return;
//     const reqId = ++latestRequestRef.current;
//     const timer = setTimeout(() => performCalculation(reqId, true), 500);
//     return () => clearTimeout(timer);
//   }, [customerRate]);

//   const getPnlStyles = (status: string) => {
//     switch (status) {
//       case 'PROFIT': return { color: '#059669', bg: '#ecfdf5', border: '#10b981', icon: <TrendingUp size={16} /> };
//       case 'LOSS': return { color: '#dc2626', bg: '#fef2f2', border: '#ef4444', icon: <TrendingDown size={16} /> };
//       default: return { color: '#4b5563', bg: '#f9fafb', border: '#9ca3af', icon: <Minus size={16} /> };
//     }
//   };

//   const treasuryChange = (() => {
//     if (!result) return null;
//     const b = currencies.find(c => c.code === buyCode);
//     const s = currencies.find(c => c.code === sellCode);
//     if (!b?.hasHistoricalData || !s?.hasHistoricalData) return null;
//     const yesterday = s.previousBnrRate! > b.previousBnrRate! ? s.previousBnrRate! / b.previousBnrRate! : b.previousBnrRate! / s.previousBnrRate!;
//     return ((result.treasuryRate - yesterday) / yesterday) * 100;
//   })();

//   return (
//     <div style={{ minHeight: '98vh', fontFamily: "'Roboto', sans-serif", background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', gap: '30px' }}>
      
//       {/* LEFT: Exchange Calculator */}
//       <div style={{ width: '100%', maxWidth: '850px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', padding: '30px', position: 'relative' }}>
        
//      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
//   <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#111827', margin: 0 }}>Currency Exchange</h1>
  
//   <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
//     {result && (
//       <div style={{
//         padding: '8px 16px',
//         backgroundColor: '#f0fdf4',
//         borderRadius: '8px',
//         border: '1px solid #bbf7d0'
//       }}>
//         <div style={{ fontSize: '11px', color: '#15803d', fontWeight: '600' }}>
//           💰 TRADING RATES
//         </div>
//         <div style={{ fontSize: '14px', color: '#166534', fontWeight: '700' }}>
//           {new Date(result.tradingDate).toLocaleDateString('en-GB', { 
//             day: 'numeric', 
//             month: 'short', 
//             year: 'numeric' 
//           })}
//         </div>
//       </div>
//     )}
    
//     <button 
//       onClick={() => { latestRequestRef.current++; fetchCurrencies(); }} 
//       disabled={isRefreshing} 
//       aria-label="Refresh exchange rates"
//       style={{ 
//         padding: '8px', 
//         borderRadius: '50%', 
//         border: '1px solid #d1d5db', 
//         backgroundColor: 'white', 
//         cursor: isRefreshing ? 'not-allowed' : 'pointer', 
//         color: '#4f46e5',
//         transition: 'all 0.2s',
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'center'
//       }}
//     >
//       <RefreshCw size={16} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
//     </button>
//   </div>
// </div>

// {error && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', marginBottom: '20px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626' }}><AlertCircle size={18} /><span style={{ fontSize: '14px', fontWeight: '500' }}>{error}</span></div>}




//         <div style={{ marginBottom: '20px' }}>
//           <label style={{ display: 'block', fontSize: '16px', fontWeight: '700', color: '#4f46e5', marginBottom: '6px' }}>Transaction Amount</label>
//           <input type="number" value={amount} onChange={(e) => { setResult(null); setAmount(e.target.value); }} min="0" step="0.01" style={{ width: '100%', padding: '12px 14px', fontSize: '16px', fontWeight: '600', color: '#111827', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} />
//         </div>

//         <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', alignItems: 'flex-start' }}>
//           <SearchableDropdown currencies={currencies} value={buyCode} onChange={(c) => { setCustomerRate(''); setBuyCode(c); }} label="Buy Currency" isBuySide={true} />
//           <SearchableDropdown currencies={currencies} value={sellCode} onChange={(c) => { setCustomerRate(''); setSellCode(c); }} label="Sell Currency" isBuySide={false} />
//         </div>

//         {!result ? (
//           <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', border: '2px dashed #e2e8f0', borderRadius: '12px' }}>
//             <RefreshCw size={24} style={{ marginBottom: '10px', animation: 'spin 1s linear infinite' }} />
//             <p style={{ fontWeight: '600' }}>LOADING LIVE RATES...</p>
//           </div>
//         ) : (
//           <div style={{ opacity: isLoading ? 0.6 : 1 }}>
//             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px', padding: '16px', background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)', borderRadius: '12px', border: '2px solid #c7d2fe' }}>
//               <div style={{ textAlign: 'center' }}>
//                 <div style={{ fontSize: '13px', fontWeight: '700', color: '#4f46e5', textTransform: 'uppercase', marginBottom: '6px' }}>Treasury Rate</div>
//                 <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>{result.treasuryRate.toFixed(6)}</div>
//                 {treasuryChange !== null && <div style={{ fontSize: '12px', fontWeight: '700', backgroundColor: treasuryChange > 0 ? '#ecfdf5' : '#fef2f2', color: treasuryChange > 0 ? '#059669' : '#dc2626', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', border: `1px solid ${treasuryChange > 0 ? '#10b981' : '#ef4444'}` }}>{treasuryChange > 0 ? '+' : ''}{treasuryChange.toFixed(2)}%</div>}
//               </div>
//               <div style={{ textAlign: 'center' }}>
//                 <div style={{ fontSize: '13px', fontWeight: '700', color: '#4f46e5', textTransform: 'uppercase', marginBottom: '6px' }}>Customer Rate (Editable)</div>
//                 <input type="number" step="0.000001" value={customerRate} onChange={(e) => setCustomerRate(e.target.value)} style={{ width: '100%', fontSize: '20px', fontWeight: '700', color: '#111827', textAlign: 'center', backgroundColor: 'white', border: '2px solid #818cf8', borderRadius: '8px', padding: '6px', outline: 'none' }} />
//               </div>
//             </div>

//             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
//               <div style={{ textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
//                 <div style={{ fontSize: '13px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Margin Spread</div>
//                 <div style={{ fontSize: '17px', fontWeight: '700', color: getPnlStyles(result.pnlStatus).color }}>{result.spread.toFixed(6)}</div>
//               </div>
//               <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
//                 <div style={{ fontSize: '13px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '2px' }}>P&L Status</div>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 10px', borderRadius: '20px', fontSize: '15px', fontWeight: '800', color: getPnlStyles(result.pnlStatus).color, backgroundColor: getPnlStyles(result.pnlStatus).bg, border: `1px solid ${getPnlStyles(result.pnlStatus).border}` }}>{getPnlStyles(result.pnlStatus).icon} {result.pnlStatus}</div>
//               </div>
//             </div>

//             <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '18px' }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '0 16px' }}>
//                 <span style={{ fontSize: '16px', fontWeight: '700', color: '#4f46e5' }}>Conversion Rate</span>
//                 <span style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>{result.conversionRate.toFixed(4)}</span>
//               </div>
//               <div style={{ textAlign: 'center', background: 'linear-gradient(135deg, #577db1 0%, #6366f1 100%)', borderRadius: '7px', padding: '12px', color: 'white' }}>
//                 <div style={{ fontSize: '35px', fontWeight: '700' }}>{result.finalAmount.toFixed(3)} {result.sellCode}</div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* RIGHT: Position Panel with Manager's Sorting Logic */}
//       <PositionPanel activeBuy={buyCode} activeSell={sellCode} />

//       <style>{`
//         @keyframes spin { 
//           from { transform: rotate(0deg); } 
//           to { transform: rotate(360deg); } 
//         }
//       `}</style>
//     </div>
//   );
// };

// export default FXDashboard;


import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ChevronDown, Search, TrendingUp, TrendingDown, Minus, RefreshCw, AlertCircle } from 'lucide-react';

// const API_BASE = 'http://localhost:8080';


// To this:
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// ==================== INTERFACES ====================
interface Currency {
  code: string;
  name: string;
  bnrrate: number;
  buyCustomerRate: number;
  sellCustomerRate: number;
  previousBnrRate: number | null;
  bnrRateDifference: number | null;
  bnrRateChangePercent: number | null;
  previousBuyCustomerRate: number | null;
  buyRateDifference: number | null;
  buyRateChangePercent: number | null;
  previousSellCustomerRate: number | null;
  sellRateDifference: number | null;
  sellRateChangePercent: number | null;
  hasHistoricalData: boolean;
}

interface ConversionResponse {
  buyCode: string;
  sellCode: string;
  inputAmount: number;
  conversionRate: number;
  finalAmount: number;
  treasuryRate: number;
  customerRate: number;
  spread: number;
  pnlStatus: string;
  tradingDate: string; 
}

interface CurrencyPosition {
  id: number;
  currencyCode: string;
  positionStatus: string;
  lastUpdated: string;
}

// ==================== POSITION PANEL COMPONENT ====================
const PositionPanel: React.FC<{ activeBuy: string; activeSell: string }> = ({ activeBuy, activeSell }) => {
  const [positions, setPositions] = useState<CurrencyPosition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
 const [_error, setError] = useState<string | null>(null);

  const fetchPositions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/positions/list`);
      if (!res.ok) throw new Error('Failed to load positions');
      const data = await res.json();
      setPositions(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
    const interval = setInterval(fetchPositions, 30000);
    return () => clearInterval(interval);
  }, []);

  // Manager's Logic: Sort active currencies to the top
  const sortedPositions = useMemo(() => {
    const pinned = positions.filter(p => p.currencyCode === activeBuy || p.currencyCode === activeSell);
    const rest = positions.filter(p => p.currencyCode !== activeBuy && p.currencyCode !== activeSell);
    return { pinned, rest };
  }, [positions, activeBuy, activeSell]);

  const getPositionStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case 'LONG': return { bg: '#ecfdf5', color: '#059669', border: '#10b981', icon: '📈', label: 'LONG' };
      case 'SHORT': return { bg: '#fef2f2', color: '#dc2626', border: '#ef4444', icon: '📉', label: 'SHORT' };
      default: return { bg: '#f9fafb', color: '#4b5563', border: '#d1d5db', icon: '❓', label: status };
    }
  };

  return (
    <div style={{
      width: '100%', maxWidth: '450px', backgroundColor: 'white', borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)', padding: '30px', display: 'flex', 
      flexDirection: 'column', height: '850px'
    }}>
      <div style={{ marginBottom: '15px', paddingBottom: '12px', borderBottom: '2px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>Positions</h2>
          <button 
            onClick={fetchPositions} 
            aria-label="Refresh positions"
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#4f46e5' }}
          >
            <RefreshCw size={14} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
        {/* Pinned Section */}
        {sortedPositions.pinned.map((pos) => {
          const s = getPositionStyle(pos.positionStatus);
          return (
            <div key={pos.id} style={{ padding: '12px', backgroundColor: s.bg, border: `2px solid #4f46e5`, borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', boxShadow: '0 2px 4px rgba(79, 70, 229, 0.1)' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#111827' }}>{pos.currencyCode} <span style={{fontSize: '10px', color: '#4f46e5'}}>(ACTIVE)</span></div>
                <div style={{ fontSize: '10px', color: '#6b7280' }}>{new Date(pos.lastUpdated).toLocaleTimeString()}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', backgroundColor: 'white', borderRadius: '20px', border: `1px solid ${s.border}`, fontSize: '12px', fontWeight: '700', color: s.color }}>
                {s.icon} {s.label}
              </div>
            </div>
          );
        })}

        {/* Separator */}
        {sortedPositions.pinned.length > 0 && sortedPositions.rest.length > 0 && (
          <div style={{ margin: '20px 0', borderTop: '2px dashed #e2e8f0', position: 'relative' }}>
             <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'white', padding: '0 10px', fontSize: '10px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' }}>
               Other Positions
             </span>
          </div>
        )}

        {/* Rest of Currencies */}
        {sortedPositions.rest.map((pos) => {
          const s = getPositionStyle(pos.positionStatus);
          return (
            <div key={pos.id} style={{ padding: '12px', backgroundColor: s.bg, border: `2px solid ${s.border}`, borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>{pos.currencyCode}</div>
                <div style={{ fontSize: '10px', color: '#6b7280' }}>{new Date(pos.lastUpdated).toLocaleTimeString()}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 10px', backgroundColor: 'white', borderRadius: '20px', border: `1px solid ${s.border}`, fontSize: '12px', fontWeight: '700', color: s.color }}>
                {s.icon} {s.label}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '2px solid #e5e7eb', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
        {['LONG', 'SHORT'].map(status => (
          <div key={status} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: '700', color: getPositionStyle(status).color }}>
              {positions.filter(p => p.positionStatus.toUpperCase() === status).length}
            </div>
            <div style={{ fontSize: '9px', color: '#6b7280', fontWeight: '700' }}>{status}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==================== RATE COMPARISON COMPONENT ====================
const RateWithComparison: React.FC<{
  label: string; currentRate: number; difference: number | null; percentChange: number | null; hasHistory: boolean;
}> = ({ label, currentRate, difference, percentChange, hasHistory }) => {
  const isPositive = difference !== null && difference > 0;
  const isNegative = difference !== null && difference < 0;
  const color = isPositive ? '#059669' : isNegative ? '#dc2626' : '#6b7280';

  return (
    <div style={{ textAlign: 'center', padding: '8px 0' }}>
      <div style={{ fontSize: '12px', fontWeight: '700', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>{currentRate.toFixed(6)}</div>
      {hasHistory && difference !== null && percentChange !== null ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '11px', fontWeight: '600', color: color }}>
            {isPositive ? <TrendingUp size={12} /> : isNegative ? <TrendingDown size={12} /> : <Minus size={12} />}
            <span>{Math.abs(difference).toFixed(6)}</span>
          </div>
          <div style={{ fontSize: '11px', fontWeight: '700', backgroundColor: isPositive ? '#ecfdf5' : isNegative ? '#fef2f2' : '#f3f4f6', color: color, padding: '2px 6px', borderRadius: '4px', border: `1px solid ${isPositive ? '#10b981' : isNegative ? '#ef4444' : '#d1d5db'}` }}>
            {isPositive ? '+' : ''}{percentChange.toFixed(2)}%
          </div>
        </div>
      ) : <div style={{ fontSize: '10px', color: '#9ca3af', fontStyle: 'italic' }}>No history</div>}
    </div>
  );
};

// ==================== DROPDOWN COMPONENT ====================
const SearchableDropdown: React.FC<{
  currencies: Currency[]; value: string; onChange: (code: string) => void; label: string; isBuySide: boolean;
}> = ({ currencies, value, onChange, label, isBuySide }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedCurrency = currencies.find(c => c.code === value);
  const filteredCurrencies = currencies.filter(c => c.code.toLowerCase().includes(searchTerm.toLowerCase()) || c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false); };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ flex: 1, position: 'relative' }} ref={dropdownRef}>
      <label style={{ display: 'block', fontSize: '17px', fontWeight: '700', color: '#4f46e5', marginBottom: '8px', textAlign: 'center' }}>{label}</label>
      <button onClick={() => setIsOpen(!isOpen)} style={{ width: '100%', padding: '10px 14px', fontSize: '14px', fontWeight: '600', color: '#111827', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ flex: 1, textAlign: 'center' }}>{value}</span>
        <ChevronDown style={{ width: '18px', height: '18px', color: '#6b7280', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: '0.2s' }} />
      </button>
      {isOpen && (
        <div style={{ position: 'absolute', width: '100%', marginTop: '4px', backgroundColor: 'white', border: '1px solid #d1d5db', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', zIndex: 1000, maxHeight: '280px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '8px', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: '6px', padding: '8px 12px' }}>
              <Search style={{ width: '16px', height: '16px', color: '#9ca3af', marginRight: '8px' }} />
              <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 1, border: 'none', outline: 'none', backgroundColor: 'transparent', fontSize: '13px', color: '#111827' }} autoFocus />
            </div>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: '200px' }}>
            {filteredCurrencies.map(c => (
              <div key={c.code} onClick={() => { onChange(c.code); setIsOpen(false); setSearchTerm(''); }} style={{ padding: '10px 16px', cursor: 'pointer', backgroundColor: c.code === value ? '#eef2ff' : 'white' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827' }}>{c.code}</div>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>{c.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {selectedCurrency && (
        <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
          <RateWithComparison label="BNR Rate" currentRate={selectedCurrency.bnrrate} difference={selectedCurrency.bnrRateDifference} percentChange={selectedCurrency.bnrRateChangePercent} hasHistory={selectedCurrency.hasHistoricalData} />
          <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '8px 0' }} />
          <RateWithComparison label="T24 Rate" currentRate={isBuySide ? selectedCurrency.buyCustomerRate : selectedCurrency.sellCustomerRate} difference={isBuySide ? selectedCurrency.buyRateDifference : selectedCurrency.sellRateDifference} percentChange={isBuySide ? selectedCurrency.buyRateChangePercent : selectedCurrency.sellRateChangePercent} hasHistory={selectedCurrency.hasHistoricalData} />
        </div>
      )}
    </div>
  );
};

// ==================== MAIN DASHBOARD ====================
const FXDashboard: React.FC = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [amount, setAmount] = useState<string>('100');
  const [buyCode, setBuyCode] = useState<string>(() => sessionStorage.getItem('fxBuyCode') || 'USD');
  const [sellCode, setSellCode] = useState<string>(() => sessionStorage.getItem('fxSellCode') || 'EUR');
  const [customerRate, setCustomerRate] = useState<string>('');
  const [isUserEditing, setIsUserEditing] = useState(false); // ← NEW: Track if user is manually editing
  const [result, setResult] = useState<ConversionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const latestRequestRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    sessionStorage.setItem('fxBuyCode', buyCode);
  }, [buyCode]);

  useEffect(() => {
    sessionStorage.setItem('fxSellCode', sellCode);
  }, [sellCode]);

  const fetchCurrencies = useCallback(async () => {
    setIsRefreshing(true); setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/currencies/list?v=${Date.now()}`);
      if (!res.ok) throw new Error('Failed to load exchange rates');
      setCurrencies(await res.json());
    } catch (err) { setError("Unable to load exchange rates. Please refresh."); } finally { setIsRefreshing(false); }
  }, []);

  useEffect(() => { fetchCurrencies(); }, [fetchCurrencies]);

  const performCalculation = useCallback(async (currentRequestId: number, isManualRate: boolean = false) => {
    const numAmount = parseFloat(amount);
    
    // 1. GUARD: Clear results if amount is invalid
    if (isNaN(numAmount) || numAmount <= 0) {
      setResult(null);
      setIsLoading(false);
      return;
    }

    // 2. SAME CURRENCY LOGIC (e.g., USD to USD)
    if (buyCode === sellCode) {
      const manualInput = parseFloat(customerRate);
      const activeRate = isManualRate && !isNaN(manualInput) ? manualInput : 1.0;
      
      if (isManualRate && activeRate <= 0) {
        setIsLoading(false);
        return;
      }

      setResult({
        buyCode,
        sellCode,
        inputAmount: numAmount,
        conversionRate: 1.0,
        tradingDate: new Date().toISOString().split('T')[0],
        finalAmount: numAmount,
        treasuryRate: 1.0,
        customerRate: activeRate,
        spread: activeRate - 1.0,
        pnlStatus: activeRate > 1.0 ? 'PROFIT' : activeRate < 1.0 ? 'LOSS' : 'NEUTRAL'
      });

      if (!isManualRate) {
        setIsUserEditing(false); // ← UPDATED: Mark as API change
        setCustomerRate("1.000000");
      }
      
      setIsLoading(false);
      return;
    }

    // 3. EXTERNAL API CALCULATION (e.g., USD to EUR)
    if (isManualRate && (parseFloat(customerRate) <= 0 || isNaN(parseFloat(customerRate)))) {
      return;
    }

    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
    setIsLoading(true);

    try {
      const payload: any = { amount: numAmount, buyCode, sellCode };
      if (isManualRate && customerRate) {
        payload.customCustomerRate = parseFloat(customerRate);
      }
      
      const res = await fetch(`${API_BASE}/api/fx/calculate`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload),
        signal: abortControllerRef.current.signal
      });

      if (!res.ok) throw new Error('Calculation failed');
      const data = await res.json();

      if (currentRequestId === latestRequestRef.current) {
        setResult(data);
        
        // ← UPDATED: Only auto-fill if NOT a manual edit
        if (!isManualRate) {
          setIsUserEditing(false); // Mark as API change
          setCustomerRate(data.customerRate.toString());
        }
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') setError(e.message);
    } finally {
      if (currentRequestId === latestRequestRef.current) {
        setIsLoading(false);
      }
    }
  }, [amount, buyCode, sellCode, customerRate]);

  // EFFECT 1: Automatic trigger (Code or Amount change)
  useEffect(() => {
    const reqId = ++latestRequestRef.current;
    performCalculation(reqId, false);
  }, [amount, buyCode, sellCode]);

  // EFFECT 2: Manual trigger (Customer Rate typing)
  // ← UPDATED: Only trigger if user is manually editing
  useEffect(() => {
    if (!customerRate || !isUserEditing) return; // Check both conditions
    const reqId = ++latestRequestRef.current;
    const timer = setTimeout(() => performCalculation(reqId, true), 500);
    return () => clearTimeout(timer);
  }, [customerRate, isUserEditing]); // Watch both dependencies

  const getPnlStyles = (status: string) => {
    switch (status) {
      case 'PROFIT': return { color: '#059669', bg: '#ecfdf5', border: '#10b981', icon: <TrendingUp size={16} /> };
      case 'LOSS': return { color: '#dc2626', bg: '#fef2f2', border: '#ef4444', icon: <TrendingDown size={16} /> };
      default: return { color: '#4b5563', bg: '#f9fafb', border: '#9ca3af', icon: <Minus size={16} /> };
    }
  };

  const treasuryChange = (() => {
    if (!result) return null;
    const b = currencies.find(c => c.code === buyCode);
    const s = currencies.find(c => c.code === sellCode);
    if (!b?.hasHistoricalData || !s?.hasHistoricalData) return null;
    const yesterday = s.previousBnrRate! > b.previousBnrRate! ? s.previousBnrRate! / b.previousBnrRate! : b.previousBnrRate! / s.previousBnrRate!;
    return ((result.treasuryRate - yesterday) / yesterday) * 100;
  })();

  return (
    <div style={{ minHeight: '98vh', fontFamily: "'Roboto', sans-serif", background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', gap: '30px' }}>
      
      {/* LEFT: Exchange Calculator */}
      <div style={{ width: '100%', maxWidth: '850px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', padding: '30px', position: 'relative' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#111827', margin: 0 }}>Currency Exchange</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {result && (
              <div style={{
                padding: '8px 16px',
                backgroundColor: '#f0fdf4',
                borderRadius: '8px',
                border: '1px solid #bbf7d0'
              }}>
                <div style={{ fontSize: '11px', color: '#15803d', fontWeight: '600' }}>
                  💰 TRADING RATES
                </div>
                <div style={{ fontSize: '14px', color: '#166534', fontWeight: '700' }}>
                  {new Date(result.tradingDate).toLocaleDateString('en-GB', { 
                    day: 'numeric', 
                    month: 'short', 
                    year: 'numeric' 
                  })}
                </div>
              </div>
            )}
            
            <button 
              onClick={() => { latestRequestRef.current++; fetchCurrencies(); }} 
              disabled={isRefreshing} 
              aria-label="Refresh exchange rates"
              style={{ 
                padding: '8px', 
                borderRadius: '50%', 
                border: '1px solid #d1d5db', 
                backgroundColor: 'white', 
                cursor: isRefreshing ? 'not-allowed' : 'pointer', 
                color: '#4f46e5',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <RefreshCw size={16} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
            </button>
          </div>
        </div>

        {error && <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', marginBottom: '20px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626' }}><AlertCircle size={18} /><span style={{ fontSize: '14px', fontWeight: '500' }}>{error}</span></div>}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '16px', fontWeight: '700', color: '#4f46e5', marginBottom: '6px' }}>Transaction Amount</label>
          <input type="number" value={amount} onChange={(e) => { setResult(null); setAmount(e.target.value); }} min="0" step="0.01" style={{ width: '100%', padding: '12px 14px', fontSize: '16px', fontWeight: '600', color: '#111827', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} />
        </div>

        <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', alignItems: 'flex-start' }}>
          <SearchableDropdown 
            currencies={currencies} 
            value={buyCode} 
            onChange={(c) => { 
              setCustomerRate(''); 
              setIsUserEditing(false); // ← UPDATED: Reset flag on currency change
              setBuyCode(c); 
            }} 
            label="Buy Currency" 
            isBuySide={true} 
          />
          <SearchableDropdown 
            currencies={currencies} 
            value={sellCode} 
            onChange={(c) => { 
              setCustomerRate(''); 
              setIsUserEditing(false); // ← UPDATED: Reset flag on currency change
              setSellCode(c); 
            }} 
            label="Sell Currency" 
            isBuySide={false} 
          />
        </div>

        {!result ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', border: '2px dashed #e2e8f0', borderRadius: '12px' }}>
            <RefreshCw size={24} style={{ marginBottom: '10px', animation: 'spin 1s linear infinite' }} />
            <p style={{ fontWeight: '600' }}>LOADING LIVE RATES...</p>
          </div>
        ) : (
          <div style={{ opacity: isLoading ? 0.6 : 1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px', padding: '16px', background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)', borderRadius: '12px', border: '2px solid #c7d2fe' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#4f46e5', textTransform: 'uppercase', marginBottom: '6px' }}>Treasury Rate</div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>{result.treasuryRate.toFixed(6)}</div>
                {treasuryChange !== null && <div style={{ fontSize: '12px', fontWeight: '700', backgroundColor: treasuryChange > 0 ? '#ecfdf5' : '#fef2f2', color: treasuryChange > 0 ? '#059669' : '#dc2626', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', border: `1px solid ${treasuryChange > 0 ? '#10b981' : '#ef4444'}` }}>{treasuryChange > 0 ? '+' : ''}{treasuryChange.toFixed(2)}%</div>}
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#4f46e5', textTransform: 'uppercase', marginBottom: '6px' }}>Customer Rate (Editable)</div>
                <input 
                  type="number" 
                  step="0.000001" 
                  value={customerRate} 
                  onChange={(e) => {
                    setIsUserEditing(true); // ← UPDATED: Mark as user edit
                    setCustomerRate(e.target.value);
                  }} 
                  style={{ width: '100%', fontSize: '20px', fontWeight: '700', color: '#111827', textAlign: 'center', backgroundColor: 'white', border: '2px solid #818cf8', borderRadius: '8px', padding: '6px', outline: 'none' }} 
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
              <div style={{ textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Margin Spread</div>
                <div style={{ fontSize: '17px', fontWeight: '700', color: getPnlStyles(result.pnlStatus).color }}>{result.spread.toFixed(6)}</div>
              </div>
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '2px' }}>P&L Status</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 10px', borderRadius: '20px', fontSize: '15px', fontWeight: '800', color: getPnlStyles(result.pnlStatus).color, backgroundColor: getPnlStyles(result.pnlStatus).bg, border: `1px solid ${getPnlStyles(result.pnlStatus).border}` }}>{getPnlStyles(result.pnlStatus).icon} {result.pnlStatus}</div>
              </div>
            </div>

            <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '0 16px' }}>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#4f46e5' }}>Conversion Rate</span>
                <span style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>{result.conversionRate.toFixed(4)}</span>
              </div>
              <div style={{ textAlign: 'center', background: 'linear-gradient(135deg, #577db1 0%, #6366f1 100%)', borderRadius: '7px', padding: '12px', color: 'white' }}>
                <div style={{ fontSize: '35px', fontWeight: '700' }}>{result.finalAmount.toFixed(3)} {result.sellCode}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT: Position Panel */}
      <PositionPanel activeBuy={buyCode} activeSell={sellCode} />

      <style>{`
        @keyframes spin { 
          from { transform: rotate(0deg); } 
          to { transform: rotate(360deg); } 
        }
      `}</style>
    </div>
  );
};

export default FXDashboard;