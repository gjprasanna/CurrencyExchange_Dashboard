

// // import React from 'react';
// // import { NavLink } from 'react-router-dom';
// // import { TrendingUp, Users, ShieldCheck } from 'lucide-react';

// // const Sidebar: React.FC = () => {
// //   return (
// //     <aside style={{
// //       //change
// //       width: '230px',
// //       backgroundColor: '#ffffff',
// //       borderRight: '1px solid #e2e8f0',
// //       display: 'flex',
// //       flexDirection: 'column',
// //       position: 'fixed',
// //       left: 0,
// //       top: 0,
// //       height: '100vh',
// //       zIndex: 1000,
// //       fontFamily: "'Inter', sans-serif"
// //     }}>
// //       {/* Branding Section */}
// //       <div style={{
// //         padding: '32px 24px',
// //         display: 'flex',
// //         alignItems: 'center',
// //         gap: '12px',
// //         marginBottom: '20px'
// //       }}>
// //         <div style={{
// //           width: '36px',
// //           height: '36px',
// //           background: '#4f46e5',
// //           borderRadius: '10px',
// //           display: 'flex',
// //           alignItems: 'center',
// //           justifyContent: 'center',
// //           color: 'white',
// //           boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)'
// //         }}>
// //           <ShieldCheck size={22} />
// //         </div>
// //         <span style={{ 
// //           fontWeight: '700', 
// //           fontSize: '19px', 
// //           color: '#0f172a',
// //           letterSpacing: '-0.5px'
// //         }}>
// //           FX Portal
// //         </span>
// //       </div>

// //       {/* Navigation */}
// //       <nav style={{ flex: 1, padding: '0 16px' }}>
// //         <NavLink
// //           to="/currency-exchange"
// //           style={({ isActive }) => ({
// //             display: 'flex',
// //             alignItems: 'center',
// //             gap: '12px',
// //             padding: '12px 16px',
// //             textDecoration: 'none',
// //             borderRadius: '8px',
// //             marginBottom: '6px',
// //             transition: 'all 0.2s ease',
// //             backgroundColor: isActive ? '#4f46e5' : 'transparent',
// //             color: isActive ? '#ffffff' : '#64748b',
// //           })}
// //         >
// //           {({ isActive }) => (
// //             <>
// //               <TrendingUp size={20} strokeWidth={isActive ? 2.5 : 2} />
// //               <span style={{ fontWeight: isActive ? '600' : '500', fontSize: '14px' }}>
// //                 Exchange Desk
// //               </span>
// //             </>
// //           )}
// //         </NavLink>

// //         <NavLink
// //           to="/customer-transactions"
// //           style={({ isActive }) => ({
// //             display: 'flex',
// //             alignItems: 'center',
// //             gap: '12px',
// //             padding: '12px 16px',
// //             textDecoration: 'none',
// //             borderRadius: '8px',
// //             marginBottom: '6px',
// //             transition: 'all 0.2s ease',
// //             backgroundColor: isActive ? '#4f46e5' : 'transparent',
// //             color: isActive ? '#ffffff' : '#64748b',
// //           })}
// //         >
// //           {({ isActive }) => (
// //             <>
// //               <Users size={20} strokeWidth={isActive ? 2.5 : 2} />
// //               <span style={{ fontWeight: isActive ? '600' : '500', fontSize: '14px' }}>
// //                 Transactions
// //               </span>
// //             </>
// //           )}
// //         </NavLink>
// //       </nav>

      
// //     </aside>
// //   );
// // };

// // export default Sidebar;

// // Updated Sidebar with enhanced styling and active state indicators

// import React from 'react';
// import { NavLink } from 'react-router-dom';
// import { TrendingUp, Users, BarChart3, Settings, HelpCircle, LogOut } from 'lucide-react';

// const Sidebar: React.FC = () => {
//   return (
//     <aside style={{
//       width: '230px',
//       background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
//       display: 'flex',
//       flexDirection: 'column',
//       position: 'fixed',
//       left: 0,
//       top: 0,
//       height: '100vh',
//       zIndex: 1000,
//       fontFamily: "'Inter', sans-serif",
//       boxShadow: '4px 0 24px rgba(0, 0, 0, 0.12)'
//     }}>
//       {/* Branding Section */}
//       <div style={{
//         padding: '28px 20px',
//         borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
//       }}>
//         <div style={{
//           display: 'flex',
//           alignItems: 'center',
//           gap: '12px'
//         }}>
//           <div style={{
//             width: '42px',
//             height: '42px',
//             background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
//             borderRadius: '12px',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             color: 'white',
//             boxShadow: '0 8px 16px rgba(99, 102, 241, 0.3)'
//           }}>
//             <BarChart3 size={24} strokeWidth={2.5} />
//           </div>
//           <div>
//             <div style={{ 
//               fontWeight: '700', 
//               fontSize: '18px', 
//               color: '#ffffff',
//               letterSpacing: '-0.3px',
//               lineHeight: '1.2'
//             }}>
//               FX Portal
//             </div>
//             <div style={{
//               fontSize: '11px',
//               color: '#94a3b8',
//               fontWeight: '500',
//               marginTop: '2px'
//             }}>
//               Trading Platform
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Navigation Section */}
//       <nav style={{ 
//         flex: 1, 
//         padding: '24px 16px',
//         display: 'flex',
//         flexDirection: 'column',
//         gap: '4px',
//         overflowY: 'auto'
//       }}>
//         {/* Main Navigation Label */}
//         <div style={{
//           fontSize: '10px',
//           fontWeight: '700',
//           color: '#64748b',
//           textTransform: 'uppercase',
//           letterSpacing: '0.8px',
//           padding: '0 12px 12px 12px'
//         }}>
//           Main Menu
//         </div>

//         <NavLink
//           to="/currency-exchange"
//           style={({ isActive }) => ({
//             display: 'flex',
//             alignItems: 'center',
//             gap: '14px',
//             padding: '14px 16px',
//             textDecoration: 'none',
//             borderRadius: '10px',
//             transition: 'all 0.2s ease',
//             backgroundColor: isActive ? '#4f46e5' : 'transparent',
//             color: isActive ? '#ffffff' : '#cbd5e1',
//             position: 'relative',
//             boxShadow: isActive ? '0 4px 12px rgba(79, 70, 229, 0.4)' : 'none',
//             transform: isActive ? 'translateX(2px)' : 'none'
//           })}
//           onMouseEnter={(e) => {
//             if (!e.currentTarget.getAttribute('aria-current')) {
//               e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
//               e.currentTarget.style.transform = 'translateX(2px)';
//             }
//           }}
//           onMouseLeave={(e) => {
//             if (!e.currentTarget.getAttribute('aria-current')) {
//               e.currentTarget.style.backgroundColor = 'transparent';
//               e.currentTarget.style.transform = 'none';
//             }
//           }}
//         >
//           {({ isActive }) => (
//             <>
//               <TrendingUp size={20} strokeWidth={isActive ? 2.5 : 2} />
//               <div style={{ flex: 1 }}>
//                 <div style={{ 
//                   fontWeight: isActive ? '700' : '600', 
//                   fontSize: '14px',
//                   lineHeight: '1.3'
//                 }}>
//                   Exchange Desk
//                 </div>
//                 <div style={{
//                   fontSize: '11px',
//                   opacity: 0.7,
//                   marginTop: '2px'
//                 }}>
//                   FX Calculator
//                 </div>
//               </div>
//               {isActive && (
//                 <div style={{
//                   position: 'absolute',
//                   left: 0,
//                   top: '50%',
//                   transform: 'translateY(-50%)',
//                   width: '3px',
//                   height: '60%',
//                   backgroundColor: '#a5b4fc',
//                   borderRadius: '0 4px 4px 0'
//                 }} />
//               )}
//             </>
//           )}
//         </NavLink>

//         <NavLink
//           to="/customer-transactions"
//           style={({ isActive }) => ({
//             display: 'flex',
//             alignItems: 'center',
//             gap: '14px',
//             padding: '14px 16px',
//             textDecoration: 'none',
//             borderRadius: '10px',
//             transition: 'all 0.2s ease',
//             backgroundColor: isActive ? '#4f46e5' : 'transparent',
//             color: isActive ? '#ffffff' : '#cbd5e1',
//             position: 'relative',
//             boxShadow: isActive ? '0 4px 12px rgba(79, 70, 229, 0.4)' : 'none',
//             transform: isActive ? 'translateX(2px)' : 'none'
//           })}
//           onMouseEnter={(e) => {
//             if (!e.currentTarget.getAttribute('aria-current')) {
//               e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.1)';
//               e.currentTarget.style.transform = 'translateX(2px)';
//             }
//           }}
//           onMouseLeave={(e) => {
//             if (!e.currentTarget.getAttribute('aria-current')) {
//               e.currentTarget.style.backgroundColor = 'transparent';
//               e.currentTarget.style.transform = 'none';
//             }
//           }}
//         >
//           {({ isActive }) => (
//             <>
//               <Users size={20} strokeWidth={isActive ? 2.5 : 2} />
//               <div style={{ flex: 1 }}>
//                 <div style={{ 
//                   fontWeight: isActive ? '700' : '600', 
//                   fontSize: '14px',
//                   lineHeight: '1.3'
//                 }}>
//                   Transactions
//                 </div>
//                 <div style={{
//                   fontSize: '11px',
//                   opacity: 0.7,
//                   marginTop: '2px'
//                 }}>
//                   History & Reports
//                 </div>
//               </div>
//               {isActive && (
//                 <div style={{
//                   position: 'absolute',
//                   left: 0,
//                   top: '50%',
//                   transform: 'translateY(-50%)',
//                   width: '3px',
//                   height: '60%',
//                   backgroundColor: '#a5b4fc',
//                   borderRadius: '0 4px 4px 0'
//                 }} />
//               )}
//             </>
//           )}
//         </NavLink>
//       </nav>

//       {/* Footer Section */}
//       <div style={{
//         padding: '16px',
//         borderTop: '1px solid rgba(255, 255, 255, 0.08)'
//       }}>
//         <div style={{
//           padding: '12px 16px',
//           backgroundColor: 'rgba(99, 102, 241, 0.1)',
//           borderRadius: '8px',
//           border: '1px solid rgba(99, 102, 241, 0.2)'
//         }}>
//           <div style={{
//             fontSize: '11px',
//             fontWeight: '600',
//             color: '#a5b4fc',
//             marginBottom: '4px'
//           }}>
//             System Status
//           </div>
//           <div style={{
//             fontSize: '10px',
//             color: '#94a3b8',
//             display: 'flex',
//             alignItems: 'center',
//             gap: '6px'
//           }}>
//             <div style={{
//               width: '6px',
//               height: '6px',
//               borderRadius: '50%',
//               backgroundColor: '#10b981',
//               boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)'
//             }} />
//             All systems operational
//           </div>
//         </div>
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;



// Updated DashboardLayout to remove maxWidth constraint and ensure full width usage
import React from 'react';
import { NavLink } from 'react-router-dom';
import { TrendingUp, Users, BarChart3, Upload } from 'lucide-react';

const NAV = [
  { to: '/currency-exchange',     icon: TrendingUp, label: 'Exchange Desk',    sub: 'FX Calculator' },
  { to: '/customer-transactions', icon: Users,       label: 'Transactions',     sub: 'History & Reports' },
  { to: '/rate-management',       icon: Upload,      label: 'Rate Management',  sub: 'Upload Daily Rates' },
];

const Sidebar: React.FC = () => (
  <aside style={{
    width: '230px',
    background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
    display: 'flex', flexDirection: 'column',
    position: 'fixed', left: 0, top: 0, height: '100vh',
    zIndex: 1000, fontFamily: "'Inter', sans-serif",
    boxShadow: '4px 0 24px rgba(0,0,0,0.12)',
  }}>
    {/* Brand */}
    <div style={{ padding: '28px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '42px', height: '42px',
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', boxShadow: '0 8px 16px rgba(99,102,241,0.3)',
        }}>
          <BarChart3 size={24} strokeWidth={2.5} />
        </div>
        <div>
          <div style={{ fontWeight: '700', fontSize: '18px', color: '#fff', letterSpacing: '-0.3px', lineHeight: '1.2' }}>FX Portal</div>
          <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500', marginTop: '2px' }}>Trading Platform</div>
        </div>
      </div>
    </div>

    {/* Nav */}
    <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
      <div style={{ fontSize: '10px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.8px', padding: '0 12px 12px' }}>
        Main Menu
      </div>
      {NAV.map(({ to, icon: Icon, label, sub }) => (
        <NavLink key={to} to={to} style={({ isActive }) => ({
          display: 'flex', alignItems: 'center', gap: '14px',
          padding: '13px 16px', textDecoration: 'none', borderRadius: '10px',
          transition: 'all 0.2s ease',
          backgroundColor: isActive ? '#4f46e5' : 'transparent',
          color: isActive ? '#fff' : '#cbd5e1',
          position: 'relative',
          boxShadow: isActive ? '0 4px 12px rgba(79,70,229,0.4)' : 'none',
          transform: isActive ? 'translateX(2px)' : 'none',
        })}>
          {({ isActive }) => (
            <>
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: isActive ? '700' : '600', fontSize: '14px', lineHeight: '1.3' }}>{label}</div>
                <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '2px' }}>{sub}</div>
              </div>
              {isActive && (
                <div style={{
                  position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                  width: '3px', height: '60%', backgroundColor: '#a5b4fc', borderRadius: '0 4px 4px 0',
                }} />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>

    {/* Footer */}
    <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ padding: '12px 16px', backgroundColor: 'rgba(99,102,241,0.1)', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div style={{ fontSize: '11px', fontWeight: '600', color: '#a5b4fc', marginBottom: '4px' }}>System Status</div>
        <div style={{ fontSize: '10px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px rgba(16,185,129,0.6)' }} />
          All systems operational
        </div>
      </div>
    </div>
  </aside>
);

export default Sidebar;