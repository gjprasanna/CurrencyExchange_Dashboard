
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
  marginValue: number;
}

interface CurrencyPosition {
  id: number;
  currencyCode: string;
  positionStatus: string;
  bnrRate: number | null;
  amount: number | null;
  lastUpdated: string;
}

// ==================== POSITION PANEL COMPONENT ====================
const PositionPanel: React.FC<{ 
  activeBuy: string; 
  activeSell: string;
  currencies: Currency[];
}> = ({ activeBuy, activeSell, currencies }) => {
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

  // Sort active currencies to the top
  const sortedPositions = useMemo(() => {
    const pinned = positions.filter(p => p.currencyCode === activeBuy || p.currencyCode === activeSell);
    const rest = positions.filter(p => p.currencyCode !== activeBuy && p.currencyCode !== activeSell);
    return { pinned, rest };
  }, [positions, activeBuy, activeSell]);

  const getPositionStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case 'LONG': return { bg: '#ecfdf5', color: '#059669', border: '#10b981', label: 'LONG' };
      case 'SHORT': return { bg: '#fef2f2', color: '#dc2626', border: '#ef4444', label: 'SHORT' };
      default: return { bg: '#f9fafb', color: '#4b5563', border: '#d1d5db', label: 'NEUTRAL' };
    }
  };

  const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return 'N/A';
    return num.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 6 
    });
  };

  // Get currency data for BNR comparison
  const getCurrencyData = (currencyCode: string): Currency | undefined => {
    return currencies.find(c => c.code === currencyCode);
  };

  const renderPositionCard = (pos: CurrencyPosition, isActive: boolean = false) => {
    const s = getPositionStyle(pos.positionStatus);
    const currencyData = getCurrencyData(pos.currencyCode);
    
    const bnrDiff = currencyData?.bnrRateDifference ?? null;
    const bnrPct = currencyData?.bnrRateChangePercent ?? null;
    const hasHistory = currencyData?.hasHistoricalData || false;
    
    const isPositive = bnrDiff !== null && bnrDiff > 0;
    const isNegative = bnrDiff !== null && bnrDiff < 0;
    const changeColor = isPositive ? '#059669' : isNegative ? '#dc2626' : '#6b7280';
    
    return (
      <div 
        key={pos.id} 
        style={{ 
          padding: '16px 20px',
          backgroundColor: s.bg,
          border: isActive ? `2px solid #4f46e5` : `1px solid ${s.border}`,
          borderRadius: '8px',
          marginBottom: '12px',
          transition: 'all 0.2s'
        }}
      >
        {/* Single Row Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '80px 140px 110px 150px 90px',
          gap: '16px',
          alignItems: 'center'
        }}>
          
          {/* Currency Code */}
          <div>
            <div style={{
              fontSize: '20px',
              fontWeight: '800',
              color: '#111827',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              {pos.currencyCode}
              {isActive && (
                <span style={{
                  fontSize: '8px',
                  color: '#4f46e5',
                  backgroundColor: 'white',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontWeight: '700',
                  border: '1px solid #4f46e5',
                  whiteSpace: 'nowrap'
                }}>
                  ACTIVE
                </span>
              )}
            </div>
          </div>

          {/* BNR Rate Column */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '10px',
              fontWeight: '700',
              color: '#6b7280',
              textTransform: 'uppercase',
              marginBottom: '4px'
            }}>
              BNR Rate
            </div>
            <div style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#111827'
            }}>
              {formatNumber(pos.bnrRate)}
            </div>
          </div>

          {/* Difference Column */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '10px',
              fontWeight: '700',
              color: '#6b7280',
              textTransform: 'uppercase',
              marginBottom: '4px'
            }}>
              Change
            </div>
            {hasHistory && bnrDiff !== null && bnrPct !== null ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: changeColor
                }}>
                  {isPositive ? <TrendingUp size={14} /> : isNegative ? <TrendingDown size={14} /> : <Minus size={14} />}
                  <span>{isPositive ? '+' : ''}{bnrPct.toFixed(2)}%</span>
                </div>
              </div>
            ) : (
              <div style={{
                fontSize: '11px',
                color: '#9ca3af',
                fontStyle: 'italic'
              }}>
                No data
              </div>
            )}
          </div>

          {/* Amount Column */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '10px',
              fontWeight: '700',
              color: '#6b7280',
              textTransform: 'uppercase',
              marginBottom: '4px'
            }}>
              Amount
            </div>
            <div style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#111827'
            }}>
              {formatNumber(pos.amount)}
            </div>
          </div>

          {/* Position Status Badge */}
          <div style={{
            padding: '6px 14px',
            backgroundColor: 'white',
            borderRadius: '20px',
            border: `1.5px solid ${s.border}`,
            fontSize: '13px',
            fontWeight: '700',
            color: s.color,
            textAlign: 'center',
            whiteSpace: 'nowrap'
          }}>
            {s.label}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      width: '100%', 
      maxWidth: '550px', 
      backgroundColor: 'white', 
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)', 
      padding: '30px', 
      display: 'flex', 
      flexDirection: 'column', 
      height: '850px'
    }} className="position-panel">
      
      {/* Header */}
      <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '2px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#111827', margin: 0 }}>Positions</h2>
          <button 
            onClick={fetchPositions} 
            aria-label="Refresh positions"
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#4f46e5' }}
          >
            <RefreshCw size={16} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>
      </div>

      {/* Positions List */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '6px' }}>
        {/* Active Positions */}
        {sortedPositions.pinned.map((pos) => renderPositionCard(pos, true))}

        {/* Separator */}
        {sortedPositions.pinned.length > 0 && sortedPositions.rest.length > 0 && (
          <div style={{ 
            margin: '20px 0', 
            borderTop: '1px dashed #cbd5e1', 
            position: 'relative' 
          }}>
            <span style={{
              position: 'absolute',
              top: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'white',
              padding: '0 12px',
              fontSize: '10px',
              fontWeight: '700',
              color: '#94a3b8',
              textTransform: 'uppercase'
            }}>
              Other Positions
            </span>
          </div>
        )}

        {/* Other Positions */}
        {sortedPositions.rest.map((pos) => renderPositionCard(pos, false))}
      </div>

      {/* Summary Footer */}
      <div style={{
        marginTop: 'auto',
        paddingTop: '16px',
        borderTop: '2px solid #e5e7eb',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '12px'
      }}>
        {['LONG', 'SHORT', 'NEUTRAL'].map(status => {
          const style = getPositionStyle(status);
          return (
            <div key={status} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '20px',
                fontWeight: '700',
                color: style.color
              }}>
                {positions.filter(p => p.positionStatus.toUpperCase() === status).length}
              </div>
              <div style={{
                fontSize: '10px',
                color: '#6b7280',
                fontWeight: '700',
                textTransform: 'uppercase'
              }}>
                {status}
              </div>
            </div>
          );
        })}
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
  const [isUserEditing, setIsUserEditing] = useState(false);
  const [result, setResult] = useState<ConversionResponse | null>(null);
  const [_isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [apiTradingDate, setApiTradingDate] = useState<string | null>(null);
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
      const data = await res.json();
      setCurrencies(data);
      
      if (data && data.length > 0 && data[0].tradingDate) {
        setApiTradingDate(data[0].tradingDate);
      }
    } catch (err) { setError("Unable to load exchange rates. Please refresh."); } finally { setIsRefreshing(false); }
  }, []);

  useEffect(() => { fetchCurrencies(); }, [fetchCurrencies]);

  const performCalculation = useCallback(async (currentRequestId: number, isManualRate: boolean = false) => {
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      setResult(null);
      setIsLoading(false);
      return;
    }

    if (buyCode === sellCode) {
      const manualInput = parseFloat(customerRate);
      const activeRate = isManualRate && !isNaN(manualInput) ? manualInput : 1.0;
      
      if (isManualRate && activeRate <= 0) {
        setIsLoading(false);
        return;
      }

      const spread = activeRate - 1.0;
      const marginValue = numAmount * spread;

      setResult({
        buyCode,
        sellCode,
        inputAmount: numAmount,
        conversionRate: 1.0,
        tradingDate: apiTradingDate || new Date().toISOString().split('T')[0],
        finalAmount: numAmount,
        treasuryRate: 1.0,
        customerRate: activeRate,
        spread: spread,
        pnlStatus: activeRate > 1.0 ? 'PROFIT' : activeRate < 1.0 ? 'LOSS' : 'NEUTRAL',
        marginValue: marginValue
      });

      if (!isManualRate) {
        setIsUserEditing(false);
        setCustomerRate("1.000000");
      }
      
      setIsLoading(false);
      return;
    }

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
        
        if (data.tradingDate) {
          setApiTradingDate(data.tradingDate);
        }
        
        if (!isManualRate) {
          setIsUserEditing(false);
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
  }, [amount, buyCode, sellCode, customerRate, apiTradingDate]);

  useEffect(() => {
    const reqId = ++latestRequestRef.current;
    performCalculation(reqId, false);
  }, [amount, buyCode, sellCode]);

  useEffect(() => {
    if (!customerRate || !isUserEditing) return;
    const reqId = ++latestRequestRef.current;
    const timer = setTimeout(() => performCalculation(reqId, true), 500);
    return () => clearTimeout(timer);
  }, [customerRate, isUserEditing]);

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
    <div className="dashboard-container" style={{ minHeight: '98vh', fontFamily: "'Roboto', sans-serif", background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', gap: '30px' }}>
      
      {/* LEFT: Exchange Calculator */}
      <div className="exchange-panel" style={{ width: '100%', maxWidth: '850px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', padding: '30px', position: 'relative' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }} className="header-section">
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

        <div className="dropdowns-container" style={{ display: 'flex', gap: '24px', marginBottom: '24px', alignItems: 'flex-start' }}>
          <SearchableDropdown 
            currencies={currencies} 
            value={buyCode} 
            onChange={(c) => { 
              setCustomerRate(''); 
              setIsUserEditing(false);
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
              setIsUserEditing(false);
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
          <div style={{ opacity: 1 }}>  
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px', padding: '16px', background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)', borderRadius: '12px', border: '2px solid #c7d2fe' }} className="rates-grid">
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
                    setIsUserEditing(true);
                    setCustomerRate(e.target.value);
                  }} 
                  style={{ width: '100%', fontSize: '20px', fontWeight: '700', color: '#111827', textAlign: 'center', backgroundColor: 'white', border: '2px solid #818cf8', borderRadius: '8px', padding: '6px', outline: 'none' }} 
                />
              </div>
            </div>

            <div className="pnl-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '18px', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
              <div style={{ textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Margin Spread</div>
                <div style={{ fontSize: '17px', fontWeight: '700', color: getPnlStyles(result.pnlStatus).color }}>{result.spread.toFixed(6)}</div>
              </div>
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', marginBottom: '2px' }}>P&L Status</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '2px 10px', borderRadius: '20px', fontSize: '15px', fontWeight: '800', color: getPnlStyles(result.pnlStatus).color, backgroundColor: getPnlStyles(result.pnlStatus).bg, border: `1px solid ${getPnlStyles(result.pnlStatus).border}` }}>{getPnlStyles(result.pnlStatus).icon} {result.pnlStatus}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>Value</div>
                <div style={{ 
                  fontSize: '17px', 
                  fontWeight: '700', 
                  color: result.marginValue >= 0 ? '#059669' : '#dc2626' 
                }}>
                  {result.marginValue >= 0 ? '+' : ''}{result.marginValue.toFixed(4)}
                </div>
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

      {/* RIGHT: Position Panel with Currency Data */}
      <PositionPanel 
        activeBuy={buyCode} 
        activeSell={sellCode}
        currencies={currencies}
      />

      <style>{`
        @keyframes spin { 
          from { transform: rotate(0deg); } 
          to { transform: rotate(360deg); } 
        }

        /* Mobile Responsive Styles */
        @media (max-width: 1200px) {
          .dashboard-container {
            flex-direction: column !important;
            padding: 15px !important;
            gap: 20px !important;
          }

          .exchange-panel {
            max-width: 100% !important;
            padding: 20px !important;
          }

          .position-panel {
            max-width: 100% !important;
            height: auto !important;
            min-height: 500px !important;
            max-height: 700px !important;
          }

          .header-section {
            flex-direction: row !important;
            flex-wrap: wrap !important;
            align-items: center !important;
            gap: 10px !important;
          }

          .header-section h1 {
            font-size: 20px !important;
            flex: 1 1 100% !important;
          }

          .dropdowns-container {
            flex-direction: column !important;
            gap: 20px !important;
          }

          .rates-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
            padding: 12px !important;
          }

          .rates-grid > div {
            padding: 8px 0;
          }

          .pnl-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
            padding: 12px !important;
          }

          .pnl-grid > div {
            border-right: none !important;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 12px !important;
            padding-top: 8px !important;
          }

          .pnl-grid > div:last-child {
            border-bottom: none !important;
            padding-bottom: 0 !important;
          }
        }

        @media (max-width: 768px) {
          /* Make position cards stack vertically on mobile */
          .position-panel > div:nth-child(2) > div > div > div {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
            padding: 12px 16px !important;
          }

          .position-panel > div:nth-child(2) > div > div > div > div {
            text-align: center !important;
            border-bottom: 1px solid #f3f4f6;
            padding: 8px 0 !important;
          }

          .position-panel > div:nth-child(2) > div > div > div > div:first-child {
            border-bottom: none !important;
            padding-bottom: 4px !important;
          }

          .position-panel > div:nth-child(2) > div > div > div > div:last-child {
            border-bottom: none !important;
            margin-top: 4px;
          }
        }

        @media (max-width: 480px) {
          .dashboard-container {
            padding: 10px !important;
          }

          .exchange-panel {
            padding: 15px !important;
            border-radius: 12px !important;
          }

          .header-section h1 {
            font-size: 18px !important;
          }

          .position-panel {
            padding: 20px !important;
            border-radius: 12px !important;
            min-height: 400px !important;
          }

          input[type="number"] {
            font-size: 14px !important;
            padding: 10px !important;
          }
        }

        /* Smooth scrolling for position panel */
        .position-panel > div:nth-child(2) {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 #f1f5f9;
        }

        .position-panel > div:nth-child(2)::-webkit-scrollbar {
          width: 6px;
        }

        .position-panel > div:nth-child(2)::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }

        .position-panel > div:nth-child(2)::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }

        .position-panel > div:nth-child(2)::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default FXDashboard;