import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Upload, RefreshCw, CheckCircle, XCircle, Download, AlertTriangle, Database, Clock, FileText, FileSpreadsheet } from 'lucide-react';

// const API_BASE =  'http://localhost:8080';
const API_BASE = import.meta.env.VITE_API_BASE_URL;

// ==================== INTERFACES ====================
interface CurrencyRate {
  code: string;
  name: string;
  bnrrate: number;
  buyrate: number;
  sellrate: number;
  buyspreadrate: number;
  sellspreadrate: number;
}

interface PreviewRate extends CurrencyRate {
  status: 'valid' | 'error';
  errors: string[];
}

interface UploadResponse {
  success: boolean;
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  succeeded: string[];
  failed: string[];
  message?: string;
}

interface CurrentRate {
  code: string;
  bnrrate: number;
  buyrate: number;
  buyspreadrate: number;
  sellrate: number;
  sellspreadrate: number;
  rateDate?: string;
  version?: number;
}

// ==================== VALIDATION ====================
const validateRow = (row: any): PreviewRate => {
  const errors: string[] = [];
  const code = row.code?.toString().trim().toUpperCase() || '';
  const name = row.name?.toString().trim() || '';
  const bnrrate  = parseFloat(row.bnrrate);
  const buyrate  = parseFloat(row.buyrate);
  const sellrate = parseFloat(row.sellrate);
  const buyspreadrate  = parseFloat(row.buyspreadrate  ?? 0);
  const sellspreadrate = parseFloat(row.sellspreadrate ?? 0);

  if (!code || code.length !== 3)          errors.push('Code must be 3 characters');
  if (code.length === 3 && !/^[A-Z]{3}$/.test(code)) errors.push('Code must be letters only');
  if (!name)                               errors.push('Name required');
  if (isNaN(bnrrate)  || bnrrate  <= 0)   errors.push('BNR rate must be > 0');
  if (isNaN(buyrate)  || buyrate  < 0)    errors.push('Buy rate must be ≥ 0');
  if (isNaN(sellrate) || sellrate < 0)    errors.push('Sell rate must be ≥ 0');
  if (isNaN(buyspreadrate)  || buyspreadrate  < 0) errors.push('Buy spread must be ≥ 0');
  if (isNaN(sellspreadrate) || sellspreadrate < 0) errors.push('Sell spread must be ≥ 0');

  return {
    code, name,
    bnrrate:       isNaN(bnrrate)       ? 0 : bnrrate,
    buyrate:       isNaN(buyrate)       ? 0 : buyrate,
    sellrate:      isNaN(sellrate)      ? 0 : sellrate,
    buyspreadrate: isNaN(buyspreadrate) ? 0 : buyspreadrate,
    sellspreadrate:isNaN(sellspreadrate)? 0 : sellspreadrate,
    status: errors.length === 0 ? 'valid' : 'error',
    errors,
  };
};

// ==================== HELPERS ====================
const fmt = (v?: number) =>
  v == null ? '—' : v.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 });

const fmtDate = (d?: string) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const isToday = (d?: string) => !!d && new Date(d).toDateString() === new Date().toDateString();

// ==================== SHARED STYLES ====================
const card: React.CSSProperties = {
  backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0',
  boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '20px',
};
const cardHeader: React.CSSProperties = {
  padding: '14px 20px', borderBottom: '1px solid #e2e8f0',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  backgroundColor: '#f8fafc',
};

const Th: React.FC<{ children: React.ReactNode; align?: 'left' | 'right' | 'center' }> = ({ children, align = 'left' }) => (
  <th style={{
    padding: '9px 14px', textAlign: align, fontSize: '11px', fontWeight: '700',
    color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.5px',
    borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' as const, backgroundColor: '#f8fafc',
  }}>
    {children}
  </th>
);

// ==================== MAIN COMPONENT ====================
const DailyRatesUpload: React.FC = () => {
  const [dragActive, setDragActive]     = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData]   = useState<PreviewRate[]>([]);
  const [currentRates, setCurrentRates] = useState<CurrentRate[]>([]);
  const [isUploading, setIsUploading]   = useState(false);
  const [isLoading, setIsLoading]       = useState(true);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchCurrentRates(); }, []);

  // ==================== API ====================
  const fetchCurrentRates = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/currencies/rates-table`);
      if (!res.ok) throw new Error('Failed');
      setCurrentRates(await res.json());
      setLastRefreshed(new Date());
    } catch (e) {
      console.error('Fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadRates = async (rates: CurrencyRate[]): Promise<UploadResponse> => {
    const res = await fetch(`${API_BASE}/api/currencies/daily-upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rates),
    });
    const data = await res.json();
    if (!res.ok) {
      return {
        success: false, totalProcessed: rates.length, successCount: 0,
        failureCount: rates.length, succeeded: [],
        failed: data.failed ?? [data.message ?? 'Server rejected the upload'],
        message: data.message,
      };
    }
    return data;
  };

  // ==================== FILE PARSING ====================
  const processRows = (rows: any[]) => {
    setPreviewData(rows.map(validateRow));
    setUploadResult(null);
  };

  const handleFile = useCallback((file: File) => {
    const name = file.name.toLowerCase();
    if (!name.endsWith('.csv') && !name.endsWith('.xlsx') && !name.endsWith('.xls')) {
      alert('Please upload a .csv, .xlsx, or .xls file');
      return;
    }
    setSelectedFile(file);
    setPreviewData([]);
    setUploadResult(null);

    if (name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true, skipEmptyLines: true,
        complete: (r) => processRows(r.data as any[]),
        error: () => alert('Could not parse CSV. Check headers match the template.'),
      });
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target?.result, { type: 'binary' });
          processRows(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' }));
        } catch { alert('Could not parse Excel file.'); }
      };
      reader.readAsBinaryString(file);
    }
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  // ==================== UPLOAD ====================
  const handleUpload = async () => {
    const valid = previewData.filter(r => r.status === 'valid');
    if (!valid.length) return;
    setIsUploading(true);
    try {
      const result = await uploadRates(valid);
      setUploadResult(result);
      if (result.success) {
        await fetchCurrentRates();
        setTimeout(() => { setPreviewData([]); setSelectedFile(null); setUploadResult(null); }, 5000);
      }
    } catch {
      setUploadResult({ success: false, totalProcessed: valid.length, successCount: 0, failureCount: valid.length, succeeded: [], failed: ['Network error — please try again'] });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null); setPreviewData([]); setUploadResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadTemplate = () => {
    const csv = `code,name,bnrrate,buyrate,sellrate,buyspreadrate,sellspreadrate\nUSD,US Dollar,1465.5000,1460.8500,1470.1500,4.6500,4.6500\nEUR,Euro,1702.7500,1693.1000,1712.4000,9.6500,9.6500\nGBP,British Pound Sterling,1978.1000,1968.5000,1987.7000,9.6000,9.6000`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'daily_rates_template.csv';
    a.click();
  };

  // ==================== DERIVED ====================
  const validCount = previewData.filter(r => r.status === 'valid').length;
  const errorCount = previewData.filter(r => r.status === 'error').length;
  const canUpload  = previewData.length > 0 && errorCount === 0 && !isUploading;

  // ==================== RENDER ====================
  return (
    <div style={{ width: '100%', fontFamily: "'Inter', 'Helvetica Neue', sans-serif", paddingBottom: '40px' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.4px' }}>
            Rate Management
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Upload daily exchange rates · CSV or Excel · 
          </p>
        </div>
        <button onClick={downloadTemplate} style={{
          padding: '8px 14px', fontSize: '12px', fontWeight: '600', color: '#4f46e5',
          backgroundColor: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '7px',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <Download size={13} /> Download Template
        </button>
      </div>

      {/* ── STEP 1: DROP ZONE ── */}
      <div style={card}>
        <div style={cardHeader}>
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '7px' }}>
            <Upload size={15} color="#4f46e5" />  Upload File
          </span>
          {selectedFile && (
            <span style={{ fontSize: '12px', color: '#059669', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
              {selectedFile.name.endsWith('.csv') ? <FileText size={13} /> : <FileSpreadsheet size={13} />}
              {selectedFile.name} &nbsp;({(selectedFile.size / 1024).toFixed(1)} KB)
            </span>
          )}
        </div>
        <div style={{ padding: '20px' }}>
          <div
            onDragEnter={handleDrag} onDragLeave={handleDrag}
            onDragOver={handleDrag} onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragActive ? '#4f46e5' : '#cbd5e1'}`,
              borderRadius: '10px', padding: '44px 20px', textAlign: 'center',
              backgroundColor: dragActive ? '#eef2ff' : '#f8fafc',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            <Upload size={32} color={dragActive ? '#4f46e5' : '#94a3b8'} style={{ marginBottom: '10px' }} />
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
              {dragActive ? 'Drop it here' : 'Drag & drop or click to browse'}
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Accepts .csv · .xlsx · .xls</div>
          </div>
          <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
            style={{ display: 'none' }} />
        </div>
      </div>

      {/* ── STEP 2: PREVIEW TABLE ── */}
      {previewData.length > 0 && (
        <div style={card}>
          <div style={cardHeader}>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Database size={15} color="#4f46e5" />
               Preview &nbsp;
              <span style={{ fontSize: '13px', fontWeight: '500', color: '#64748b' }}>({previewData.length} rows)</span>
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', backgroundColor: '#dcfce7', color: '#16a34a' }}>
                ✓ {validCount} Valid
              </span>
              {errorCount > 0 && (
                <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', backgroundColor: '#fee2e2', color: '#dc2626' }}>
                  ✗ {errorCount} Errors
                </span>
              )}
            </div>
          </div>

          {/* Error banner */}
          {errorCount > 0 && (
            <div style={{
              margin: '12px 20px 0', padding: '10px 14px',
              backgroundColor: '#fff7ed', border: '1px solid #fed7aa',
              borderRadius: '7px', display: 'flex', gap: '8px', alignItems: 'flex-start',
            }}>
              <AlertTriangle size={14} color="#ea580c" style={{ marginTop: '1px', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: '#9a3412', lineHeight: '1.5' }}>
                <strong>{errorCount} row{errorCount > 1 ? 's have' : ' has'} errors.</strong> Fix in your file and re-upload. Upload is blocked until all rows are valid.
              </span>
            </div>
          )}

          {/* Table — shows exactly what's in the CSV, no calculations */}
          <div style={{ overflowX: 'auto', maxHeight: '380px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                <tr>
                  <Th>Status</Th>
                  <Th>Code</Th>
                  <Th>Name</Th>
                  <Th align="right">BNR Rate</Th>
                  <Th align="right">Buy Rate</Th>
                  <Th align="right">Sell Rate</Th>
                  <Th align="right">Buy Spread</Th>
                  <Th align="right">Sell Spread</Th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((rate, i) => {
                  const isErr = rate.status === 'error';
                  return (
                    <tr key={i} style={{
                      backgroundColor: isErr ? '#fff5f5' : i % 2 === 0 ? '#fff' : '#fafafa',
                      borderLeft: `3px solid ${isErr ? '#ef4444' : 'transparent'}`,
                    }}>
                      <td style={{ padding: '9px 14px' }}>
                        {isErr
                          ? <span title={rate.errors.join('\n')} style={{ cursor: 'help' }}><XCircle size={15} color="#ef4444" /></span>
                          : <CheckCircle size={15} color="#22c55e" />}
                      </td>
                      <td style={{ padding: '9px 14px', fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>
                        {rate.code || <span style={{ color: '#ef4444' }}>—</span>}
                      </td>
                      <td style={{ padding: '9px 14px', fontSize: '13px', color: '#334155' }}>
                        {rate.name || <span style={{ color: '#ef4444' }}>—</span>}
                        {isErr && (
                          <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: '600', marginTop: '2px' }}>
                            {rate.errors.join(' · ')}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '9px 14px', textAlign: 'right', fontWeight: '700', color: '#4f46e5', fontFamily: 'monospace', fontSize: '13px' }}>
                        {fmt(rate.bnrrate)}
                      </td>
                      <td style={{ padding: '9px 14px', textAlign: 'right', color: '#334155', fontFamily: 'monospace', fontSize: '13px' }}>
                        {fmt(rate.buyrate)}
                      </td>
                      <td style={{ padding: '9px 14px', textAlign: 'right', color: '#334155', fontFamily: 'monospace', fontSize: '13px' }}>
                        {fmt(rate.sellrate)}
                      </td>
                      <td style={{ padding: '9px 14px', textAlign: 'right', color: '#64748b', fontFamily: 'monospace', fontSize: '13px' }}>
                        {fmt(rate.buyspreadrate)}
                      </td>
                      <td style={{ padding: '9px 14px', textAlign: 'right', color: '#64748b', fontFamily: 'monospace', fontSize: '13px' }}>
                        {fmt(rate.sellspreadrate)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Upload result */}
          {uploadResult && (
            <div style={{
              margin: '12px 20px', padding: '14px 18px',
              backgroundColor: uploadResult.success ? '#f0fdf4' : '#fef2f2',
              border: `1px solid ${uploadResult.success ? '#bbf7d0' : '#fecaca'}`,
              borderRadius: '8px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                {uploadResult.success ? <CheckCircle size={18} color="#16a34a" /> : <XCircle size={18} color="#dc2626" />}
                <span style={{ fontWeight: '700', fontSize: '13px', color: uploadResult.success ? '#16a34a' : '#dc2626' }}>
                  {uploadResult.success
                    ? `All ${uploadResult.successCount} currencies uploaded successfully`
                    : (uploadResult.message || 'Upload failed')}
                </span>
              </div>
              {uploadResult.failed?.length > 0 && (
                <div style={{ fontSize: '12px', color: '#dc2626', backgroundColor: '#fee2e2', padding: '8px 12px', borderRadius: '6px', marginTop: '8px' }}>
                  <strong>Failed:</strong>
                  <ul style={{ margin: '4px 0 0', paddingLeft: '16px', lineHeight: '1.8' }}>
                    {uploadResult.failed.map((f, i) => <li key={i}>{f}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Buttons */}
          <div style={{
            padding: '14px 20px', borderTop: '1px solid #e2e8f0',
            display: 'flex', justifyContent: 'flex-end', gap: '10px', backgroundColor: '#f8fafc',
          }}>
            <button onClick={handleClear} style={{
              padding: '8px 16px', fontSize: '13px', fontWeight: '600', color: '#64748b',
              backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '7px', cursor: 'pointer',
            }}>
              Clear
            </button>
            <button onClick={handleUpload} disabled={!canUpload} style={{
              padding: '8px 20px', fontSize: '13px', fontWeight: '700', color: 'white',
              backgroundColor: canUpload ? '#4f46e5' : '#94a3b8',
              border: 'none', borderRadius: '7px', cursor: canUpload ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', gap: '7px',
            }}>
              {isUploading
                ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Uploading...</>
                : errorCount > 0
                  ? <><AlertTriangle size={13} /> Fix {errorCount} Error{errorCount > 1 ? 's' : ''} First</>
                  : <><Upload size={13} /> Upload {validCount} Rates</>}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3 (STEP 4): CURRENT RATES IN DB ── */}
      <div style={card}>
        <div style={cardHeader}>
          <div>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Database size={15} color="#4f46e5" />
              Rates for Today {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              <span style={{ padding: '2px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', backgroundColor: '#f1f5f9', color: '#475569' }}>
                {currentRates.length}
              </span>
            </span>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={11} />
              Last refreshed {lastRefreshed.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <button onClick={fetchCurrentRates} disabled={isLoading} style={{
            padding: '7px 13px', fontSize: '12px', fontWeight: '600', color: '#4f46e5',
            backgroundColor: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '7px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
          }}>
            <RefreshCw size={12} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
          </button>
        </div>

        {currentRates.length === 0 && !isLoading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
            <Database size={32} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.25 }} />
            <div style={{ fontWeight: '600', fontSize: '13px' }}>No rates in database yet</div>
            <div style={{ fontSize: '12px', marginTop: '3px' }}>Upload a file above to get started</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', maxHeight: '480px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                <tr>
                  <Th>Code</Th>
                  <Th align="right">BNR Rate</Th>
                  <Th align="right">Buy Rate</Th>
                  <Th align="right">Buy Spread</Th>
                  <Th align="right">Sell Rate</Th>
                  <Th align="right">Sell Spread</Th>
                  <Th>Rate Date</Th>
                  <Th align="center">Version</Th>
                </tr>
              </thead>
              <tbody>
                {currentRates.map((rate, i) => {
                  const today = isToday(rate.rateDate);
                  return (
                    <tr key={rate.code} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ padding: '10px 14px', fontWeight: '800', fontSize: '13px', color: '#0f172a', letterSpacing: '0.3px' }}>
                        {rate.code}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '700', color: '#4f46e5', fontFamily: 'monospace', fontSize: '13px' }}>
                        {fmt(rate.bnrrate)}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', color: '#334155', fontFamily: 'monospace', fontSize: '13px' }}>
                        {fmt(rate.buyrate)}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', color: '#64748b', fontFamily: 'monospace', fontSize: '13px' }}>
                        {fmt(rate.buyspreadrate)}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', color: '#334155', fontFamily: 'monospace', fontSize: '13px' }}>
                        {fmt(rate.sellrate)}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', color: '#64748b', fontFamily: 'monospace', fontSize: '13px' }}>
                        {fmt(rate.sellspreadrate)}
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {today && (
                            <span style={{
                              width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0,
                              backgroundColor: '#22c55e', display: 'inline-block',
                              boxShadow: '0 0 5px rgba(34,197,94,0.6)',
                            }} />
                          )}
                          <span style={{ fontWeight: '600', color: today ? '#16a34a' : '#475569' }}>
                            {fmtDate(rate.rateDate)}
                          </span>
                          {today && <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: '700' }}>TODAY</span>}
                        </div>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>
                        {rate.version ?? '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        table tbody tr:hover { background-color: #eef2ff !important; }
      `}</style>
    </div>
  );
};

export default DailyRatesUpload;