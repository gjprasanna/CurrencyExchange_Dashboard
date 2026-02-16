

import React, { useState, useEffect } from 'react';
import { Search, Filter, TrendingUp, TrendingDown, Minus, RefreshCw, X } from 'lucide-react';

const API_BASE = 'http://localhost:8080';

// ==================== INTERFACES ====================
interface FXTransaction {
  id: number;
  transactionDate: string;
  customerName: string;
  buyCode: string;
  buyAmount: number;
  sellCode: string;
  sellAmount: number;
  treasuryRate: number;
  customerRate: number;
  pnlAmount: number;
  spread: number;
  marginValue: number;
  pnlStatus: string;
  currencyPair: string;
  referenceNumber: string;
}

interface TransactionListResponse {
  transactions: FXTransaction[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  totalPnl: number;
  totalVolume: number;
}

// ==================== STYLE CONSTANTS ====================
const tableHeaderStyle: React.CSSProperties = {
  padding: '14px 18px',
  textAlign: 'left',
  fontSize: '12px',
  fontWeight: '700',
  color: '#4f46e5',
  backgroundColor: '#f9fafb',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  borderRight: '1px solid #e5e7eb'
};

const tableCellStyle: React.CSSProperties = {
  padding: '16px 18px',
  borderRight: '1px solid #f1f5f9',
  fontSize: '13px',
  color: '#1f2937'
};

const filterInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  fontSize: '13px',
  fontWeight: '500',
  color: '#111827',
  backgroundColor: '#ffffff',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  fontFamily: "'Inter', 'Roboto', sans-serif",
  outline: 'none',
  transition: 'all 0.2s'
};

// ==================== HELPER COMPONENTS ====================
interface FilterControlProps {
  label: string;
  children: React.ReactNode;
}

const FilterControl: React.FC<FilterControlProps> = ({ label, children }) => (
  <div>
    <label style={{
      display: 'block',
      fontSize: '11px',
      fontWeight: '700',
      color: '#6b7280',
      marginBottom: '6px',
      textTransform: 'uppercase',
      letterSpacing: '0.3px'
    }}>
      {label}
    </label>
    {children}
  </div>
);

// ✅ SIMPLIFIED METRIC CARD - Banking Style (Clean & Professional)
interface MetricCardProps {
  label: string;
  value: number;
  trend?: number;
  subText?: string;
  isTopCustomer?: boolean;
}

const MetricCardComponent: React.FC<MetricCardProps> = ({
  label,
  value,
  trend,
  subText,
  isTopCustomer
}) => {
  const isPositive = !isTopCustomer ? (value >= 0) : true;
  const textColor = isPositive ? '#059669' : '#dc2626';

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      padding: '18px 20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      minHeight: '100px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between'
    }}>
      {/* Label */}
      <div style={{
        fontSize: '11px',
        fontWeight: '600',
        color: '#6b7280',
        marginBottom: '10px',
        textTransform: 'uppercase',
        letterSpacing: '0.3px'
      }}>
        {label}
      </div>

      {/* Main Value */}
      <div style={{
        fontSize: isTopCustomer ? '16px' : '26px',
        fontWeight: '700',
        color: isTopCustomer ? '#111827' : textColor,
        marginBottom: '6px'
      }}>
        {isTopCustomer ? subText : `${value >= 0 ? '+' : ''}${value.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`}
      </div>

      {/* Subtext or Trend */}
      {isTopCustomer ? (
        <div style={{
          fontSize: '12px',
          fontWeight: '500',
          color: '#6b7280'
        }}>
          Total: <span style={{ color: '#4f46e5', fontWeight: '700' }}>{value.toLocaleString()}</span>
        </div>
      ) : (
        trend !== undefined && (
          <div style={{
            fontSize: '11px',
            fontWeight: '600',
            color: trend >= 0 ? '#059669' : '#dc2626'
          }}>
            {trend >= 0 ? '↗' : '↘'} {Math.abs(trend || 0).toFixed(1)}% vs last period
          </div>
        )
      )}
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
const CustomerTransactions: React.FC = () => {
  // --- State Management ---
  const [transactions, setTransactions] = useState<FXTransaction[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(25);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ✅ SEPARATE FILTER STATES: Temporary (for editing) vs Applied (for API)
  const [tempFilters, setTempFilters] = useState({
    searchQuery: '',
    customerName: '',
    currency: '',
    pnlStatus: '',
    startDate: '',
    endDate: ''
  });

  const [appliedFilters, setAppliedFilters] = useState({
    searchQuery: '',
    customerName: '',
    currency: '',
    pnlStatus: '',
    startDate: '',
    endDate: ''
  });

  const [showFilters, setShowFilters] = useState(false);

  // --- Helper Functions ---
  // ✅ FIX: Safe number formatter for rates
  const safeToFixed = (value: number | null | undefined, decimals: number = 6): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0.' + '0'.repeat(decimals);
    }
    return value.toFixed(decimals);
  };

  // ✅ FIX: Updated formatCurrency to handle null/undefined
  const formatCurrency = (value: number | null | undefined): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0.00';
    }
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPnlIcon = (status: string) => {
    if (status === 'PROFIT') return <TrendingUp size={14} />;
    if (status === 'LOSS') return <TrendingDown size={14} />;
    return <Minus size={14} />;
  };

  const getPnlStyle = (status: string) => {
    if (status === 'PROFIT') return {
      bg: '#f0fdf4',
      color: '#059669',
      border: '#bbf7d0'
    };
    if (status === 'LOSS') return {
      bg: '#fef2f2',
      color: '#dc2626',
      border: '#fecaca'
    };
    return {
      bg: '#f9fafb',
      color: '#6b7280',
      border: '#d1d5db'
    };
  };

  // ✅ APPLY FILTERS - Only triggers API call
  const applyFilters = () => {
    setAppliedFilters({ ...tempFilters });
    setCurrentPage(0); // Reset to first page when filters change
  };

  // ✅ CLEAR FILTERS
  const clearFilters = () => {
    const emptyFilters = {
      searchQuery: '',
      customerName: '',
      currency: '',
      pnlStatus: '',
      startDate: '',
      endDate: ''
    };
    setTempFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setCurrentPage(0);
  };

  // ✅ Check if any filters are active
  const hasActiveFilters = () => {
    return appliedFilters.searchQuery || appliedFilters.customerName || 
           appliedFilters.currency || appliedFilters.pnlStatus || 
           appliedFilters.startDate || appliedFilters.endDate;
  };

  // --- API: Fetch Transactions (uses appliedFilters) ---
  const fetchTransactions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let url = `${API_BASE}/api/fx-transactions/list?page=${currentPage}&size=${pageSize}&sortBy=transactionDate&sortDir=DESC`;

      // If search query exists, use search endpoint
      if (appliedFilters.searchQuery.trim()) {
        url = `${API_BASE}/api/fx-transactions/search?query=${encodeURIComponent(appliedFilters.searchQuery)}&page=${currentPage}&size=${pageSize}`;
      }
      // If other filters exist, use filter endpoint
      else if (appliedFilters.customerName || appliedFilters.currency || appliedFilters.pnlStatus || appliedFilters.startDate || appliedFilters.endDate) {
        url = `${API_BASE}/api/fx-transactions/filter-advanced?page=${currentPage}&size=${pageSize}&sortBy=transactionDate&sortDir=DESC`;
        
        if (appliedFilters.customerName) url += `&customerName=${encodeURIComponent(appliedFilters.customerName)}`;
        if (appliedFilters.currency) url += `&currency=${encodeURIComponent(appliedFilters.currency)}`;
        if (appliedFilters.pnlStatus) url += `&pnlStatus=${encodeURIComponent(appliedFilters.pnlStatus)}`;
        if (appliedFilters.startDate) url += `&startDate=${appliedFilters.startDate}T00:00:00`;
        if (appliedFilters.endDate) url += `&endDate=${appliedFilters.endDate}T23:59:59`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch transactions');

      const data: TransactionListResponse = await response.json();
      setTransactions(data.transactions);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- API: Fetch Metrics ---
  const fetchMetrics = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/fx-transactions/analytics/all-cards`);
      if (!response.ok) throw new Error('Failed to fetch metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      console.error('Error fetching metrics:', err);
    }
  };

  // --- Manual Refresh ---
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchTransactions(), fetchMetrics()]);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // --- Effects ---
  useEffect(() => {
    fetchTransactions();
  }, [currentPage, appliedFilters]); // ✅ Only refetch when appliedFilters change

  useEffect(() => {
    fetchMetrics();
  }, []);

  // ==================== RENDER ====================
  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      fontFamily: "'Inter', 'Roboto', sans-serif",
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ 
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        padding: '20px'
      }}>
        {/* HEADER */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '28px',
          paddingBottom: '20px',
          borderBottom: '2px solid #e5e7eb'
        }}>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '800',
              color: '#111827',
              margin: '0 0 6px 0',
              letterSpacing: '-0.5px'
            }}>
              Customer Transactions
            </h1>
            <p style={{
              fontSize: '13px',
              color: '#6b7280',
              margin: 0,
              fontWeight: '500'
            }}>
              View and analyze FX transaction history
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            style={{
              padding: '11px 20px',
              fontSize: '13px',
              fontWeight: '600',
              color: '#4f46e5',
              backgroundColor: 'white',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (!isRefreshing) {
                e.currentTarget.style.backgroundColor = '#eef2ff';
                e.currentTarget.style.borderColor = '#4f46e5';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
          >
            <RefreshCw size={16} style={{
              animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
            }} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* METRIC CARDS - Banking Style, Simple & Clean */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          marginBottom: '24px'
        }}>
          {metrics.today && (
            <MetricCardComponent
              label="Today's P&L"
              value={metrics.today.value || 0}
              trend={metrics.today.trend}
            />
          )}
          {metrics.monthly && (
            <MetricCardComponent
              label="Monthly P&L"
              value={metrics.monthly.value || 0}
              trend={metrics.monthly.trend}
            />
          )}
          {metrics.yearly && (
            <MetricCardComponent
              label="Yearly P&L"
              value={metrics.yearly.value || 0}
              trend={metrics.yearly.trend}
            />
          )}
          {metrics.topCustomer && (
            <MetricCardComponent
              label="Top Customer"
              value={metrics.topCustomer.value || 0}
              subText={metrics.topCustomer.label || 'N/A'}
              isTopCustomer={true}
            />
          )}
        </div>

        {/* ✅ IMPROVED: NON-OVERLAPPING SEARCH & FILTER SECTION */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          padding: '18px 20px',
          marginBottom: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {/* ✅ FIXED: Search Bar + Toggle with proper responsive spacing */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            {/* Search Input - Takes full width on left */}
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9ca3af',
                pointerEvents: 'none'
              }} />
              <input
                type="text"
                placeholder="Search by customer name or reference..."
                value={tempFilters.searchQuery}
                onChange={(e) => setTempFilters({ ...tempFilters, searchQuery: e.target.value })}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') applyFilters();
                }}
                style={{
                  width: '100%',
                  padding: '11px 14px 11px 42px',
                  fontSize: '13px',
                  fontWeight: '500',
                  color: '#111827',
                  backgroundColor: '#ffffff',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontFamily: "'Inter', 'Roboto', sans-serif",
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Filter Toggle Button - Fixed width */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                padding: '11px 16px',
                fontSize: '12px',
                fontWeight: '600',
                color: showFilters ? '#ffffff' : '#4f46e5',
                backgroundColor: showFilters ? '#4f46e5' : 'white',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                minWidth: 'auto'
              }}
            >
              <Filter size={15} />
              Filters
            </button>
          </div>

          {/* ✅ IMPROVED: EXPANDABLE FILTER PANEL */}
          {showFilters && (
            <div style={{
              paddingTop: '18px',
              marginTop: '12px',
              borderTop: '1px solid #e5e7eb'
            }}>
              {/* Filter Fields Grid - Responsive */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '14px',
                marginBottom: '16px'
              }}>
                {/* Customer Name */}
                <FilterControl label="Customer">
                  <input
                    type="text"
                    placeholder="Enter customer name"
                    value={tempFilters.customerName}
                    onChange={(e) => setTempFilters({ ...tempFilters, customerName: e.target.value })}
                    style={{...filterInputStyle, width: '100%', boxSizing: 'border-box'}}
                  />
                </FilterControl>

                {/* Currency */}
                <FilterControl label="Currency">
                  <input
                    type="text"
                    placeholder="e.g., USD, EUR"
                    value={tempFilters.currency}
                    onChange={(e) => setTempFilters({ ...tempFilters, currency: e.target.value })}
                    style={{...filterInputStyle, width: '100%', boxSizing: 'border-box'}}
                  />
                </FilterControl>

                {/* P&L Status */}
                <FilterControl label="P&L Status">
                  <select
                    value={tempFilters.pnlStatus}
                    onChange={(e) => setTempFilters({ ...tempFilters, pnlStatus: e.target.value })}
                    style={{
                      ...filterInputStyle,
                      cursor: 'pointer',
                      width: '100%',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option value="">All</option>
                    <option value="PROFIT">Profit</option>
                    <option value="LOSS">Loss</option>
                    <option value="BREAKEVEN">Breakeven</option>
                  </select>
                </FilterControl>

                {/* ✅ START DATE */}
                <FilterControl label="Start Date">
                  <input
                    type="date"
                    value={tempFilters.startDate}
                    onChange={(e) => setTempFilters({ ...tempFilters, startDate: e.target.value })}
                    style={{...filterInputStyle, width: '100%', boxSizing: 'border-box'}}
                  />
                </FilterControl>

                {/* ✅ END DATE */}
                <FilterControl label="End Date">
                  <input
                    type="date"
                    value={tempFilters.endDate}
                    onChange={(e) => setTempFilters({ ...tempFilters, endDate: e.target.value })}
                    style={{...filterInputStyle, width: '100%', boxSizing: 'border-box'}}
                  />
                </FilterControl>
              </div>

              {/* ✅ ACTION BUTTONS - Responsive */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '10px',
                paddingTop: '8px'
              }}>
                <button
                  onClick={clearFilters}
                  style={{
                    padding: '9px 14px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#6b7280',
                    backgroundColor: 'white',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <X size={14} />
                  Clear
                </button>
                <button
                  onClick={applyFilters}
                  style={{
                    padding: '9px 14px',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'white',
                    backgroundColor: '#4f46e5',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.2s',
                    boxShadow: '0 1px 3px rgba(79, 70, 229, 0.3)',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#4338ca';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#4f46e5';
                  }}
                >
                  <Filter size={14} />
                  Apply
                </button>
              </div>

              {/* Active Filters Indicator */}
              {hasActiveFilters() && (
                <div style={{
                  marginTop: '14px',
                  padding: '8px 12px',
                  backgroundColor: '#eef2ff',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#4f46e5',
                  fontWeight: '600'
                }}>
                  ✓ Active filters applied
                </div>
              )}
            </div>
          )}
        </div>

        {/* TRANSACTIONS TABLE */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          minHeight: '500px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1
        }}>
          {/* ERROR STATE */}
          {error && (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: '#dc2626',
              fontSize: '14px',
              fontWeight: '600',
              minHeight: '400px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.4 }}>⚠️</div>
              <div>Error: {error}</div>
            </div>
          )}

          {/* LOADING STATE */}
          {isLoading && !error && (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              minHeight: '400px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1
            }}>
              <div style={{
                display: 'inline-block',
                width: '40px',
                height: '40px',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #4f46e5',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }} />
              <div style={{
                marginTop: '16px',
                fontSize: '13px',
                color: '#6b7280',
                fontWeight: '600'
              }}>
                Loading transactions...
              </div>
            </div>
          )}

          {/* ✅ EMPTY STATE - Maintains layout */}
          {!isLoading && !error && transactions.length === 0 && (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              minHeight: '400px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '16px',
                opacity: 0.3
              }}>
                📊
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '8px'
              }}>
                No transactions found
              </div>
              <div style={{
                fontSize: '13px',
                color: '#6b7280',
                maxWidth: '400px'
              }}>
                {hasActiveFilters() 
                  ? 'Try adjusting your filters or search query'
                  : 'No transaction data available yet'}
              </div>
            </div>
          )}

          {/* TABLE */}
          {!isLoading && !error && transactions.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                minWidth: '1200px'
              }}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>Date & Time</th>
                    <th style={tableHeaderStyle}>Customer</th>
                    <th style={tableHeaderStyle}>Pair</th>
                    <th style={tableHeaderStyle}>Buy Amount</th>
                    <th style={tableHeaderStyle}>Sell Amount</th>
                    <th style={tableHeaderStyle}>Customer Rate</th>
                    <th style={tableHeaderStyle}>Treasury Rate</th>
                    <th style={tableHeaderStyle}>Spread</th>
                    <th style={tableHeaderStyle}>P&L Amount</th>
                    <th style={{ ...tableHeaderStyle, borderRight: 'none' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, index) => {
                    const pnlStyle = getPnlStyle(tx.pnlStatus);
                    return (
                      <tr key={tx.id} style={{
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f0f4f8';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
                      }}>
                        {/* Date */}
                        <td style={tableCellStyle}>
                          <div style={{
                            fontSize: '12px',
                            fontWeight: '700',
                            color: '#111827'
                          }}>
                            {formatDate(tx.transactionDate)}
                          </div>
                          <div style={{
                            fontSize: '10px',
                            color: '#94a3b8',
                            fontWeight: '500',
                            marginTop: '3px'
                          }}>
                            Ref: {tx.referenceNumber}
                          </div>
                        </td>

                        {/* Customer */}
                        <td style={tableCellStyle}>
                          <div style={{
                            fontSize: '13px',
                            fontWeight: '700',
                            color: '#111827'
                          }}>
                            {tx.customerName}
                          </div>
                        </td>

                        {/* Pair */}
                        <td style={tableCellStyle}>
                          <div style={{
                            fontSize: '12px',
                            fontWeight: '700',
                            color: '#ffffff',
                            backgroundColor: '#4f46e5',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            display: 'inline-block'
                          }}>
                            {tx.currencyPair}
                          </div>
                        </td>

                        {/* Buy Amount */}
                        <td style={tableCellStyle}>
                          <div style={{
                            fontSize: '13px',
                            fontWeight: '700',
                            color: '#111827'
                          }}>
                            {formatCurrency(tx.buyAmount)}
                          </div>
                          <div style={{
                            fontSize: '10px',
                            color: '#6b7280',
                            marginTop: '2px'
                          }}>
                            {tx.buyCode}
                          </div>
                        </td>

                        {/* Sell Amount */}
                        <td style={tableCellStyle}>
                          <div style={{
                            fontSize: '13px',
                            fontWeight: '700',
                            color: '#111827'
                          }}>
                            {formatCurrency(tx.sellAmount)}
                          </div>
                          <div style={{
                            fontSize: '10px',
                            color: '#6b7280',
                            marginTop: '2px'
                          }}>
                            {tx.sellCode}
                          </div>
                        </td>

                        {/* Customer Rate - ✅ FIXED */}
                        <td style={{
                          ...tableCellStyle,
                          fontFamily: "'Courier New', monospace",
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#4f46e5'
                        }}>
                          {safeToFixed(tx.customerRate)}
                        </td>

                        {/* Treasury Rate - ✅ FIXED */}
                        <td style={{
                          ...tableCellStyle,
                          fontFamily: "'Courier New', monospace",
                          fontSize: '12px',
                          fontWeight: '600',
                          color: '#6b7280'
                        }}>
                          {safeToFixed(tx.treasuryRate)}
                        </td>

                        {/* Spread - ✅ FIXED */}
                        <td style={{
                          ...tableCellStyle,
                          fontFamily: "'Courier New', monospace",
                          fontSize: '12px',
                          fontWeight: '700',
                          color: '#f59e0b'
                        }}>
                          {safeToFixed(tx.spread)}
                        </td>

                        {/* P&L Amount - ✅ FIXED */}
                        <td style={{
                          ...tableCellStyle,
                          fontWeight: '700',
                          fontSize: '13px',
                          color: pnlStyle.color
                        }}>
                          {(tx.pnlAmount ?? 0) >= 0 ? '✓ ' : '✗ '}{formatCurrency(Math.abs(tx.pnlAmount ?? 0))}
                        </td>

                        {/* Status Badge */}
                        <td style={tableCellStyle}>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: '700',
                            backgroundColor: pnlStyle.bg,
                            color: pnlStyle.color,
                            border: `1.5px solid ${pnlStyle.border}`
                          }}>
                            {getPnlIcon(tx.pnlStatus)}
                            {tx.pnlStatus}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* PAGINATION FOOTER */}
          {!isLoading && totalPages > 1 && (
            <div style={{
              padding: '18px 24px',
              borderTop: '2px solid #f0f4f8',
              backgroundColor: '#f9fafb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{
                fontSize: '13px',
                color: '#6b7280',
                fontWeight: '600'
              }}>
                Showing <span style={{ color: '#4f46e5', fontWeight: '700' }}>{transactions.length}</span> of <span style={{ color: '#4f46e5', fontWeight: '700' }}>{totalElements}</span> records
              </div>
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                <button
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: currentPage === 0 ? '#d1d5db' : '#4f46e5',
                    backgroundColor: currentPage === 0 ? '#f9fafb' : 'white',
                    border: `1px solid ${currentPage === 0 ? '#e5e7eb' : '#d1d5db'}`,
                    borderRadius: '6px',
                    cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage > 0) {
                      e.currentTarget.style.backgroundColor = '#eef2ff';
                      e.currentTarget.style.borderColor = '#4f46e5';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage > 0) {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }
                  }}
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage >= totalPages - 1}
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: currentPage >= totalPages - 1 ? '#d1d5db' : '#4f46e5',
                    backgroundColor: currentPage >= totalPages - 1 ? '#f9fafb' : 'white',
                    border: `1px solid ${currentPage >= totalPages - 1 ? '#e5e7eb' : '#d1d5db'}`,
                    borderRadius: '6px',
                    cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage < totalPages - 1) {
                      e.currentTarget.style.backgroundColor = '#eef2ff';
                      e.currentTarget.style.borderColor = '#4f46e5';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage < totalPages - 1) {
                      e.currentTarget.style.backgroundColor = 'white';
                      e.currentTarget.style.borderColor = '#d1d5db';
                    }
                  }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* STYLES */}
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          ::-webkit-scrollbar {
            height: 6px;
          }
          ::-webkit-scrollbar-track {
            background: #f1f5f9;
          }
          ::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 3px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }

          /* ✅ RESPONSIVE MEDIA QUERIES */
          @media (max-width: 1024px) {
            div[style*="gridTemplateColumns"] {
              grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)) !important;
            }
          }

          @media (max-width: 768px) {
            div[style*="gridTemplateColumns"] {
              grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)) !important;
              gap: 10px !important;
            }
            
            input, select {
              font-size: 14px !important;
              padding: 9px 12px !important;
            }
          }

          @media (max-width: 480px) {
            div[style*="gridTemplateColumns"] {
              grid-template-columns: 1fr !important;
            }
            
            input, select {
              width: 100% !important;
            }
          }

          /* ✅ ZOOM COMPATIBILITY */
          html {
            -webkit-text-size-adjust: 100%;
            -moz-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
            text-size-adjust: 100%;
          }

          /* Prevent horizontal scroll on zoom */
          * {
            -webkit-box-sizing: border-box;
            -moz-box-sizing: border-box;
            box-sizing: border-box;
          }

          body {
            overflow-x: hidden;
          }
        `}</style>
      </div>
    </div>
  );
};

export default CustomerTransactions;