// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import * as XLSX from 'xlsx';
// import Papa from 'papaparse';
// import { Upload, RefreshCw, CheckCircle, XCircle, Download, AlertTriangle, Database, Clock, FileText, FileSpreadsheet } from 'lucide-react';



//  //const API_BASE =  'http://localhost:8080';
// const API_BASE = import.meta.env.VITE_API_BASE_URL;

// // ==================== INTERFACES ====================
// interface PositionRow {
//   currencyCode: string;
//   positionStatus: string;
//   amount: number;
// }

// interface PreviewPosition extends PositionRow {
//   status: 'valid' | 'error';
//   errors: string[];
// }

// interface UploadResponse {
//   success?: boolean;
//   message?: string;
//   [key: string]: any;
// }

// interface CurrentPosition {
//   id: number;
//   currencyCode: string;
//   positionStatus: string;
//   amount: number;
//   lastUpdated?: string;
//   bnrRate?: number;
// }

// // ==================== VALIDATION ====================
// const VALID_STATUSES = ['LONG', 'SHORT', 'NEUTRAL'];

// const validateRow = (row: any): PreviewPosition => {
//   const errors: string[] = [];
//   const currencyCode = row.currencyCode?.toString().trim().toUpperCase() || '';
//   const positionStatus = row.positionStatus?.toString().trim().toUpperCase() || '';
//   const amount = parseFloat(row.amount);

//   if (!currencyCode || currencyCode.length !== 3)      errors.push('Code must be 3 characters');
//   if (currencyCode.length === 3 && !/^[A-Z]{3}$/.test(currencyCode)) errors.push('Code must be letters only');
//   if (!positionStatus || !VALID_STATUSES.includes(positionStatus)) errors.push('Status must be LONG, SHORT or NEUTRAL');
//   if (isNaN(amount))                                   errors.push('Amount must be a number');

//   return {
//     currencyCode,
//     positionStatus,
//     amount: isNaN(amount) ? 0 : amount,
//     status: errors.length === 0 ? 'valid' : 'error',
//     errors,
//   };
// };

// // ==================== HELPERS ====================
// const fmtAmount = (v?: number) =>
//   v == null ? '—' : v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// const fmtDateTime = (d?: string) => {
//   if (!d) return '—';
//   return new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
// };

// const statusStyle = (s: string): React.CSSProperties => {
//   if (s === 'LONG')    return { backgroundColor: '#dcfce7', color: '#16a34a' };
//   if (s === 'SHORT')   return { backgroundColor: '#fee2e2', color: '#dc2626' };
//   return { backgroundColor: '#f1f5f9', color: '#475569' };
// };

// // ==================== SHARED STYLES ====================
// const card: React.CSSProperties = {
//   backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0',
//   boxShadow: '0 1px 4px rgba(0,0,0,0.05)', overflow: 'hidden', marginBottom: '20px',
// };
// const cardHeader: React.CSSProperties = {
//   padding: '14px 20px', borderBottom: '1px solid #e2e8f0',
//   display: 'flex', justifyContent: 'space-between', alignItems: 'center',
//   backgroundColor: '#f8fafc',
// };

// const Th: React.FC<{ children: React.ReactNode; align?: 'left' | 'right' | 'center' }> = ({ children, align = 'left' }) => (
//   <th style={{
//     padding: '9px 14px', textAlign: align, fontSize: '11px', fontWeight: '700',
//     color: '#64748b', textTransform: 'uppercase' as const, letterSpacing: '0.5px',
//     borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' as const, backgroundColor: '#f8fafc',
//   }}>
//     {children}
//   </th>
// );

// // ==================== MAIN COMPONENT ====================
// const PositionManagement: React.FC = () => {
//   const [dragActive, setDragActive]     = useState(false);
//   const [selectedFile, setSelectedFile] = useState<File | null>(null);
//   const [previewData, setPreviewData]   = useState<PreviewPosition[]>([]);
//   const [currentPositions, setCurrentPositions] = useState<CurrentPosition[]>([]);
//   const [isUploading, setIsUploading]   = useState(false);
//   const [isLoading, setIsLoading]       = useState(true);
//   const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
//   const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => { fetchCurrentPositions(); }, []);

//   // ==================== API ====================
//   const fetchCurrentPositions = async () => {
//     setIsLoading(true);
//     try {
//       const res = await fetch(`${API_BASE}/api/positions/list`);
//       if (!res.ok) throw new Error('Failed');
//       setCurrentPositions(await res.json());
//       setLastRefreshed(new Date());
//     } catch (e) {
//       console.error('Fetch positions error:', e);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const uploadPositions = async (positions: PositionRow[]): Promise<UploadResponse> => {
//     const res = await fetch(`${API_BASE}/api/positions/batch/upsert`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(positions),
//     });
//     const data = await res.json();
//     if (!res.ok) {
//       return { success: false, message: data.message ?? data.error ?? 'Server rejected the upload' };
//     }
//     return { success: true, message: `${positions.length} positions updated successfully`, data };
//   };

//   // ==================== FILE PARSING ====================
//   const processRows = (rows: any[]) => {
//     setPreviewData(rows.map(validateRow));
//     setUploadResult(null);
//   };

//   const handleFile = useCallback((file: File) => {
//     const name = file.name.toLowerCase();
//     if (!name.endsWith('.csv') && !name.endsWith('.xlsx') && !name.endsWith('.xls')) {
//       alert('Please upload a .csv, .xlsx, or .xls file');
//       return;
//     }
//     setSelectedFile(file);
//     setPreviewData([]);
//     setUploadResult(null);

//     if (name.endsWith('.csv')) {
//       Papa.parse(file, {
//         header: true, skipEmptyLines: true,
//         complete: (r) => processRows(r.data as any[]),
//         error: () => alert('Could not parse CSV. Check headers match the template.'),
//       });
//     } else {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         try {
//           const wb = XLSX.read(e.target?.result, { type: 'binary' });
//           processRows(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' }));
//         } catch { alert('Could not parse Excel file.'); }
//       };
//       reader.readAsBinaryString(file);
//     }
//   }, []);

//   const handleDrag = (e: React.DragEvent) => {
//     e.preventDefault(); e.stopPropagation();
//     setDragActive(e.type === 'dragenter' || e.type === 'dragover');
//   };
//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault(); e.stopPropagation();
//     setDragActive(false);
//     if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
//   };

//   // ==================== UPLOAD ====================
//   const handleUpload = async () => {
//     const valid = previewData.filter(r => r.status === 'valid');
//     if (!valid.length) return;
//     setIsUploading(true);
//     try {
//       const result = await uploadPositions(valid);
//       setUploadResult(result);
//       if (result.success) {
//         await fetchCurrentPositions();
//         setTimeout(() => { setPreviewData([]); setSelectedFile(null); setUploadResult(null); }, 5000);
//       }
//     } catch {
//       setUploadResult({ success: false, message: 'Network error — please try again' });
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const handleClear = () => {
//     setSelectedFile(null); setPreviewData([]); setUploadResult(null);
//     if (fileInputRef.current) fileInputRef.current.value = '';
//   };

//   const downloadTemplate = () => {
//     const csv = `currencyCode,positionStatus,amount\nUSD,SHORT,11056279.07\nEUR,LONG,-28691.19\nGBP,LONG,-1467.08\nKES,SHORT,26179270.79\nCAD,LONG,-229.44\nCHF,LONG,-12901.22\nJPY,LONG,0.00\nZAR,LONG,-74195.35\nINR,SHORT,550400.00`;
//     const a = document.createElement('a');
//     a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
//     a.download = 'positions_template.csv';
//     a.click();
//   };

//   // ==================== DERIVED ====================
//   const validCount = previewData.filter(r => r.status === 'valid').length;
//   const errorCount = previewData.filter(r => r.status === 'error').length;
//   const canUpload  = previewData.length > 0 && errorCount === 0 && !isUploading;

//   const iconBtn: React.CSSProperties = {
//     padding: '7px 13px', fontSize: '12px', fontWeight: '600', color: '#4f46e5',
//     backgroundColor: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '7px',
//     cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
//   };

//   // ==================== RENDER ====================
//   return (
//     <div style={{ width: '100%', fontFamily: "'Inter', 'Helvetica Neue', sans-serif", paddingBottom: '40px' }}>

//       {/* HEADER */}
//       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
//         <div>
//           <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.4px' }}>
//             Position Management
//           </h1>
//           <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
//             Upload currency positions via CSV or Excel 
//           </p>
//         </div>
//         <button onClick={downloadTemplate} style={{ ...iconBtn, padding: '9px 16px', fontSize: '13px' }}>
//           <Download size={14} /> Download Template
//         </button>
//       </div>

//       {/* ── STEP 1: DROP ZONE ── */}
//       <div style={card}>
//         <div style={cardHeader}>
//           <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '7px' }}>
//             <Upload size={15} color="#4f46e5" /> Step 1 — Upload File
//           </span>
//           {selectedFile && (
//             <span style={{ fontSize: '12px', color: '#059669', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
//               {selectedFile.name.endsWith('.csv') ? <FileText size={13} /> : <FileSpreadsheet size={13} />}
//               {selectedFile.name} &nbsp;({(selectedFile.size / 1024).toFixed(1)} KB)
//             </span>
//           )}
//         </div>
//         <div style={{ padding: '20px' }}>
//           <div
//             onDragEnter={handleDrag} onDragLeave={handleDrag}
//             onDragOver={handleDrag} onDrop={handleDrop}
//             onClick={() => fileInputRef.current?.click()}
//             style={{
//               border: `2px dashed ${dragActive ? '#4f46e5' : '#cbd5e1'}`,
//               borderRadius: '10px', padding: '44px 20px', textAlign: 'center',
//               backgroundColor: dragActive ? '#eef2ff' : '#f8fafc',
//               cursor: 'pointer', transition: 'all 0.2s',
//             }}
//           >
//             <Upload size={32} color={dragActive ? '#4f46e5' : '#94a3b8'} style={{ marginBottom: '10px' }} />
//             <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
//               {dragActive ? 'Drop it here' : 'Drag & drop or click to browse'}
//             </div>
//             <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>Accepts .csv · .xlsx · .xls</div>
//             <div style={{ fontSize: '11px', color: '#64748b', backgroundColor: '#f1f5f9', display: 'inline-block', padding: '4px 10px', borderRadius: '6px', fontFamily: 'monospace' }}>
//               currencyCode · positionStatus · amount
//             </div>
//           </div>
//           <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls"
//             onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
//             style={{ display: 'none' }} />
//         </div>
//       </div>

//       {/* ── STEP 2: PREVIEW ── */}
//       {previewData.length > 0 && (
//         <div style={card}>
//           <div style={cardHeader}>
//             <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '7px' }}>
//               <Database size={15} color="#4f46e5" />
//               Step 2 — Preview
//               <span style={{ fontSize: '13px', fontWeight: '500', color: '#64748b' }}>({previewData.length} rows)</span>
//             </span>
//             <div style={{ display: 'flex', gap: '8px' }}>
//               <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', backgroundColor: '#dcfce7', color: '#16a34a' }}>
//                 ✓ {validCount} Valid
//               </span>
//               {errorCount > 0 && (
//                 <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', backgroundColor: '#fee2e2', color: '#dc2626' }}>
//                   ✗ {errorCount} Errors
//                 </span>
//               )}
//             </div>
//           </div>

//           {errorCount > 0 && (
//             <div style={{ margin: '12px 20px 0', padding: '10px 14px', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '7px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
//               <AlertTriangle size={14} color="#ea580c" style={{ marginTop: '1px', flexShrink: 0 }} />
//               <span style={{ fontSize: '12px', color: '#9a3412', lineHeight: '1.5' }}>
//                 <strong>{errorCount} row{errorCount > 1 ? 's have' : ' has'} errors.</strong> Fix in your file and re-upload. Upload is blocked until all rows are valid.
//               </span>
//             </div>
//           )}

//           <div style={{ overflowX: 'auto', maxHeight: '380px', overflowY: 'auto' }}>
//             <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//               <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
//                 <tr>
//                   <Th> </Th>
//                   <Th>Currency</Th>
//                   <Th>Status</Th>
//                   <Th align="right">Amount</Th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {previewData.map((row, i) => {
//                   const isErr = row.status === 'error';
//                   return (
//                     <tr key={i} style={{
//                       backgroundColor: isErr ? '#fff5f5' : i % 2 === 0 ? '#fff' : '#fafafa',
//                       borderLeft: `3px solid ${isErr ? '#ef4444' : 'transparent'}`,
//                     }}>
//                       <td style={{ padding: '9px 14px' }}>
//                         {isErr
//                           ? <span title={row.errors.join('\n')} style={{ cursor: 'help' }}><XCircle size={15} color="#ef4444" /></span>
//                           : <CheckCircle size={15} color="#22c55e" />}
//                       </td>
//                       <td style={{ padding: '9px 14px', fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>
//                         {row.currencyCode || <span style={{ color: '#ef4444' }}>—</span>}
//                         {isErr && (
//                           <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: '600', marginTop: '2px' }}>
//                             {row.errors.join(' · ')}
//                           </div>
//                         )}
//                       </td>
//                       <td style={{ padding: '9px 14px' }}>
//                         {row.positionStatus ? (
//                           <span style={{
//                             ...statusStyle(row.positionStatus),
//                             padding: '3px 10px', borderRadius: '20px',
//                             fontSize: '11px', fontWeight: '700',
//                           }}>
//                             {row.positionStatus}
//                           </span>
//                         ) : <span style={{ color: '#ef4444', fontSize: '12px' }}>—</span>}
//                       </td>
//                       <td style={{ padding: '9px 14px', textAlign: 'right', fontFamily: 'monospace', fontSize: '13px', fontWeight: '600', color: row.amount < 0 ? '#dc2626' : '#0f172a' }}>
//                         {fmtAmount(row.amount)}
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>

//           {/* Upload result */}
//           {uploadResult && (
//             <div style={{
//               margin: '12px 20px', padding: '14px 18px',
//               backgroundColor: uploadResult.success ? '#f0fdf4' : '#fef2f2',
//               border: `1px solid ${uploadResult.success ? '#bbf7d0' : '#fecaca'}`,
//               borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px',
//             }}>
//               {uploadResult.success
//                 ? <CheckCircle size={18} color="#16a34a" />
//                 : <XCircle size={18} color="#dc2626" />}
//               <span style={{ fontWeight: '700', fontSize: '13px', color: uploadResult.success ? '#16a34a' : '#dc2626' }}>
//                 {uploadResult.message}
//               </span>
//             </div>
//           )}

//           {/* Buttons */}
//           <div style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px', backgroundColor: '#f8fafc' }}>
//             <button onClick={handleClear} style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '600', color: '#64748b', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '7px', cursor: 'pointer' }}>
//               Clear
//             </button>
//             <button onClick={handleUpload} disabled={!canUpload} style={{
//               padding: '8px 20px', fontSize: '13px', fontWeight: '700', color: 'white',
//               backgroundColor: canUpload ? '#4f46e5' : '#94a3b8',
//               border: 'none', borderRadius: '7px', cursor: canUpload ? 'pointer' : 'not-allowed',
//               display: 'flex', alignItems: 'center', gap: '7px',
//             }}>
//               {isUploading
//                 ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Uploading...</>
//                 : errorCount > 0
//                   ? <><AlertTriangle size={13} /> Fix {errorCount} Error{errorCount > 1 ? 's' : ''} First</>
//                   : <><Upload size={13} /> Upload {validCount} Positions</>}
//             </button>
//           </div>
//         </div>
//       )}

//       {/* ── STEP 4: CURRENT POSITIONS IN DB ── */}
//       <div style={card}>
//         <div style={cardHeader}>
//           <div>
//             <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '7px' }}>
//               <Database size={15} color="#4f46e5" />
//                 Today's Positions - {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
//               <span style={{ padding: '2px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', backgroundColor: '#f1f5f9', color: '#475569' }}>
//                 {currentPositions.length}
//               </span>
//             </span>
//             <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
//               <Clock size={11} />
//               Last refreshed {lastRefreshed.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
//             </div>
//           </div>
//           <button onClick={fetchCurrentPositions} disabled={isLoading} style={iconBtn}>
//             <RefreshCw size={12} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
//           </button>
//         </div>

//         {currentPositions.length === 0 && !isLoading ? (
//           <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
//             <Database size={32} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.25 }} />
//             <div style={{ fontWeight: '600', fontSize: '13px' }}>No positions found</div>
//             <div style={{ fontSize: '12px', marginTop: '3px' }}>Upload a file above to add positions</div>
//           </div>
//         ) : (
//           <div style={{ overflowX: 'auto', maxHeight: '480px', overflowY: 'auto' }}>
//             <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//               <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
//                 <tr>
//                   <Th>Currency</Th>
//                   <Th>Status</Th>
//                   <Th align="right">Amount</Th>
//                   <Th>Last Updated</Th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {currentPositions.map((pos, i) => (
//                   <tr key={pos.currencyCode} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa' }}>
//                     <td style={{ padding: '11px 14px', fontWeight: '800', fontSize: '13px', color: '#0f172a', letterSpacing: '0.3px' }}>
//                       {pos.currencyCode}
//                     </td>
//                     <td style={{ padding: '11px 14px' }}>
//                       <span style={{
//                         ...statusStyle(pos.positionStatus),
//                         padding: '3px 10px', borderRadius: '20px',
//                         fontSize: '11px', fontWeight: '700',
//                       }}>
//                         {pos.positionStatus}
//                       </span>
//                     </td>
//                     <td style={{ padding: '11px 14px', textAlign: 'right', fontFamily: 'monospace', fontSize: '13px', fontWeight: '700', color: pos.amount < 0 ? '#dc2626' : pos.amount > 0 ? '#16a34a' : '#64748b' }}>
//                       {fmtAmount(pos.amount)}
//                     </td>
//                     <td style={{ padding: '11px 14px', fontSize: '12px', color: '#64748b' }}>
//                       {fmtDateTime(pos.lastUpdated)}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       <style>{`
//         @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
//         table tbody tr:hover { background-color: #eef2ff !important; }
//       `}</style>
//     </div>
//   );
// };

// export default PositionManagement;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Upload, RefreshCw, CheckCircle, XCircle, Download, AlertTriangle, Database, Clock, FileText, FileSpreadsheet } from 'lucide-react';



 //const API_BASE =  'http://localhost:8080';
const API_BASE = import.meta.env.VITE_API_BASE_URL;

// ==================== INTERFACES ====================
interface PositionRow {
  currencyCode: string;
  positionStatus: string;
  amount: number;
}

interface PreviewPosition extends PositionRow {
  status: 'valid' | 'error';
  errors: string[];
}

interface UploadResponse {
  success?: boolean;
  message?: string;
  [key: string]: any;
}

interface CurrentPosition {
  id: number;
  currencyCode: string;
  positionStatus: string;
  amount: number;
  lastUpdated?: string;
  bnrRate?: number;
}

interface CurrencyRate {
  code: string;
  bnrrate: number;
  ratedate?: string;
}

// ==================== VALIDATION ====================
const VALID_STATUSES = ['LONG', 'SHORT', 'NEUTRAL'];

const validateRow = (row: any): PreviewPosition => {
  const errors: string[] = [];
  const currencyCode = row.currencyCode?.toString().trim().toUpperCase() || '';
  const positionStatus = row.positionStatus?.toString().trim().toUpperCase() || '';
  const amount = parseFloat(row.amount);

  if (!currencyCode || currencyCode.length !== 3)      errors.push('Code must be 3 characters');
  if (currencyCode.length === 3 && !/^[A-Z]{3}$/.test(currencyCode)) errors.push('Code must be letters only');
  if (!positionStatus || !VALID_STATUSES.includes(positionStatus)) errors.push('Status must be LONG, SHORT or NEUTRAL');
  if (isNaN(amount))                                   errors.push('Amount must be a number');

  return {
    currencyCode,
    positionStatus,
    amount: isNaN(amount) ? 0 : amount,
    status: errors.length === 0 ? 'valid' : 'error',
    errors,
  };
};

// ==================== HELPERS ====================
const fmtAmount = (v?: number) =>
  v == null ? '—' : v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDateTime = (d?: string) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const statusStyle = (s: string): React.CSSProperties => {
  if (s === 'LONG')    return { backgroundColor: '#dcfce7', color: '#16a34a' };
  if (s === 'SHORT')   return { backgroundColor: '#fee2e2', color: '#dc2626' };
  return { backgroundColor: '#f1f5f9', color: '#475569' };
};

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
const PositionManagement: React.FC = () => {
  const [dragActive, setDragActive]     = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData]   = useState<PreviewPosition[]>([]);
  const [currentPositions, setCurrentPositions] = useState<CurrentPosition[]>([]);
  const [currencyRates, setCurrencyRates] = useState<CurrencyRate[]>([]);
  const [ratesMap, setRatesMap] = useState<Map<string, number>>(new Map());
  const [isUploading, setIsUploading]   = useState(false);
  const [isLoading, setIsLoading]       = useState(true);
  const [uploadResult, setUploadResult] = useState<UploadResponse | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { 
    fetchCurrentPositions();
    fetchCurrencyRates();
  }, []);

  // ==================== API ====================
  const fetchCurrentPositions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/positions/list`);
      if (!res.ok) throw new Error('Failed');
      setCurrentPositions(await res.json());
      setLastRefreshed(new Date());
    } catch (e) {
      console.error('Fetch positions error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCurrencyRates = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/currencies/rates-table`);
      if (!res.ok) throw new Error('Failed to fetch rates');
      const rates: CurrencyRate[] = await res.json();
      setCurrencyRates(rates);
      
      // Create lookup Map for O(1) access
      const map = new Map<string, number>();
      rates.forEach(rate => {
        map.set(rate.code, rate.bnrrate);
      });
      setRatesMap(map);
    } catch (e) {
      console.error('Fetch rates error:', e);
    }
  };

  const uploadPositions = async (positions: PositionRow[]): Promise<UploadResponse> => {
    const res = await fetch(`${API_BASE}/api/positions/batch/upsert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(positions),
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, message: data.message ?? data.error ?? 'Server rejected the upload' };
    }
    return { success: true, message: `${positions.length} positions updated successfully`, data };
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
      const result = await uploadPositions(valid);
      setUploadResult(result);
      if (result.success) {
        await fetchCurrentPositions();
        setTimeout(() => { setPreviewData([]); setSelectedFile(null); setUploadResult(null); }, 5000);
      }
    } catch {
      setUploadResult({ success: false, message: 'Network error — please try again' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null); setPreviewData([]); setUploadResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadTemplate = () => {
    const csv = `currencyCode,positionStatus,amount\nUSD,SHORT,11056279.07\nEUR,LONG,-28691.19\nGBP,LONG,-1467.08\nKES,SHORT,26179270.79\nCAD,LONG,-229.44\nCHF,LONG,-12901.22\nJPY,LONG,0.00\nZAR,LONG,-74195.35\nINR,SHORT,550400.00`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'positions_template.csv';
    a.click();
  };

  // ==================== DERIVED ====================
  const validCount = previewData.filter(r => r.status === 'valid').length;
  const errorCount = previewData.filter(r => r.status === 'error').length;
  const canUpload  = previewData.length > 0 && errorCount === 0 && !isUploading;

  const iconBtn: React.CSSProperties = {
    padding: '7px 13px', fontSize: '12px', fontWeight: '600', color: '#4f46e5',
    backgroundColor: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '7px',
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
  };

  // ==================== RENDER ====================
  return (
    <div style={{ width: '100%', fontFamily: "'Inter', 'Helvetica Neue', sans-serif", paddingBottom: '40px' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0', letterSpacing: '-0.4px' }}>
            Position Management
          </h1>
          <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
            Upload currency positions via CSV or Excel 
          </p>
        </div>
        <button onClick={downloadTemplate} style={{ ...iconBtn, padding: '9px 16px', fontSize: '13px' }}>
          <Download size={14} /> Download Template
        </button>
      </div>

      {/* ── STEP 1: DROP ZONE ── */}
      <div style={card}>
        <div style={cardHeader}>
          <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '7px' }}>
            <Upload size={15} color="#4f46e5" /> Step 1 — Upload File
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
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>Accepts .csv · .xlsx · .xls</div>
            <div style={{ fontSize: '11px', color: '#64748b', backgroundColor: '#f1f5f9', display: 'inline-block', padding: '4px 10px', borderRadius: '6px', fontFamily: 'monospace' }}>
              currencyCode · positionStatus · amount
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
            style={{ display: 'none' }} />
        </div>
      </div>

      {/* ── STEP 2: PREVIEW ── */}
      {previewData.length > 0 && (
        <div style={card}>
          <div style={cardHeader}>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Database size={15} color="#4f46e5" />
              Step 2 — Preview
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

          {errorCount > 0 && (
            <div style={{ margin: '12px 20px 0', padding: '10px 14px', backgroundColor: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '7px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <AlertTriangle size={14} color="#ea580c" style={{ marginTop: '1px', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', color: '#9a3412', lineHeight: '1.5' }}>
                <strong>{errorCount} row{errorCount > 1 ? 's have' : ' has'} errors.</strong> Fix in your file and re-upload. Upload is blocked until all rows are valid.
              </span>
            </div>
          )}

          <div style={{ overflowX: 'auto', maxHeight: '380px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                <tr>
                  <Th> </Th>
                  <Th>Currency</Th>
                  <Th>Status</Th>
                  <Th align="right">Amount</Th>
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, i) => {
                  const isErr = row.status === 'error';
                  return (
                    <tr key={i} style={{
                      backgroundColor: isErr ? '#fff5f5' : i % 2 === 0 ? '#fff' : '#fafafa',
                      borderLeft: `3px solid ${isErr ? '#ef4444' : 'transparent'}`,
                    }}>
                      <td style={{ padding: '9px 14px' }}>
                        {isErr
                          ? <span title={row.errors.join('\n')} style={{ cursor: 'help' }}><XCircle size={15} color="#ef4444" /></span>
                          : <CheckCircle size={15} color="#22c55e" />}
                      </td>
                      <td style={{ padding: '9px 14px', fontWeight: '700', fontSize: '13px', color: '#0f172a' }}>
                        {row.currencyCode || <span style={{ color: '#ef4444' }}>—</span>}
                        {isErr && (
                          <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: '600', marginTop: '2px' }}>
                            {row.errors.join(' · ')}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '9px 14px' }}>
                        {row.positionStatus ? (
                          <span style={{
                            ...statusStyle(row.positionStatus),
                            padding: '3px 10px', borderRadius: '20px',
                            fontSize: '11px', fontWeight: '700',
                          }}>
                            {row.positionStatus}
                          </span>
                        ) : <span style={{ color: '#ef4444', fontSize: '12px' }}>—</span>}
                      </td>
                      <td style={{ padding: '9px 14px', textAlign: 'right', fontFamily: 'monospace', fontSize: '13px', fontWeight: '600', color: row.amount < 0 ? '#dc2626' : '#0f172a' }}>
                        {fmtAmount(row.amount)}
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
              borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              {uploadResult.success
                ? <CheckCircle size={18} color="#16a34a" />
                : <XCircle size={18} color="#dc2626" />}
              <span style={{ fontWeight: '700', fontSize: '13px', color: uploadResult.success ? '#16a34a' : '#dc2626' }}>
                {uploadResult.message}
              </span>
            </div>
          )}

          {/* Buttons */}
          <div style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px', backgroundColor: '#f8fafc' }}>
            <button onClick={handleClear} style={{ padding: '8px 16px', fontSize: '13px', fontWeight: '600', color: '#64748b', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '7px', cursor: 'pointer' }}>
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
                  : <><Upload size={13} /> Upload {validCount} Positions</>}
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 4: CURRENT POSITIONS IN DB ── */}
      <div style={card}>
        <div style={cardHeader}>
          <div>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <Database size={15} color="#4f46e5" />
                Today's Positions - {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              <span style={{ padding: '2px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', backgroundColor: '#f1f5f9', color: '#475569' }}>
                {currentPositions.length}
              </span>
            </span>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={11} />
              Last refreshed {lastRefreshed.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
          <button onClick={fetchCurrentPositions} disabled={isLoading} style={iconBtn}>
            <RefreshCw size={12} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} /> Refresh
          </button>
        </div>

        {currentPositions.length === 0 && !isLoading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
            <Database size={32} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.25 }} />
            <div style={{ fontWeight: '600', fontSize: '13px' }}>No positions found</div>
            <div style={{ fontSize: '12px', marginTop: '3px' }}>Upload a file above to add positions</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', maxHeight: '480px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                <tr>
                  <Th>Currency</Th>
                  <Th>Status</Th>
                  <Th align="right">Amount</Th>
                  <Th align="right">BNR Rate</Th>
                  <Th>Last Updated</Th>
                </tr>
              </thead>
              <tbody>
                {currentPositions.map((pos, i) => (
                  <tr key={pos.currencyCode} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={{ padding: '11px 14px', fontWeight: '800', fontSize: '13px', color: '#0f172a', letterSpacing: '0.3px' }}>
                      {pos.currencyCode}
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{
                        ...statusStyle(pos.positionStatus),
                        padding: '3px 10px', borderRadius: '20px',
                        fontSize: '11px', fontWeight: '700',
                      }}>
                        {pos.positionStatus}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px', textAlign: 'right', fontFamily: 'monospace', fontSize: '13px', fontWeight: '700', color: pos.amount < 0 ? '#dc2626' : pos.amount > 0 ? '#16a34a' : '#64748b' }}>
                      {fmtAmount(pos.amount)}
                    </td>
                    <td style={{ padding: '11px 14px', textAlign: 'right', fontFamily: 'monospace', fontSize: '13px', fontWeight: '600', color: '#4f46e5' }}>
                      {ratesMap.has(pos.currencyCode) ? fmtAmount(ratesMap.get(pos.currencyCode)) : '—'}
                    </td>
                    <td style={{ padding: '11px 14px', fontSize: '12px', color: '#64748b' }}>
                      {fmtDateTime(pos.lastUpdated)}
                    </td>
                  </tr>
                ))}
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

export default PositionManagement;