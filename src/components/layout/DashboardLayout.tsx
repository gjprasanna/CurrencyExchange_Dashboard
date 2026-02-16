

// import React from 'react';
// import { Outlet } from 'react-router-dom';
// import Sidebar from './Sidebar';

// const DashboardLayout: React.FC = () => {
//   return (
//     <div style={{
//       display: 'flex',
//       minHeight: '100vh',
//       backgroundColor: '#f8fafc',
//     }}>
//       <Sidebar />
      
//       <main style={{
//         flex: 1,
//         minWidth: 0,
//         marginLeft: '200px',
//         padding: '40px',
//         width: '100%',
//         boxSizing: 'border-box'
//       }}>
//         {/* ✅ REMOVED maxWidth constraint */}
//         <div style={{ 
//           width: '100%',
//           display: 'flex',
//           flexDirection: 'column',
//           gap: '24px'
//         }}>
//           <Outlet />
//         </div>
//       </main>
//     </div>
//   );
// };

// export default DashboardLayout;

import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const DashboardLayout: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      width: '100vw',
      overflow: 'hidden'
    }}>
      <Sidebar />
      
      <main style={{
        flex: 1,
        padding: '40px',
        boxSizing: 'border-box',
        width: 'calc(100vw - 230px)',
        marginLeft: '200px',
        overflowX: 'auto'
      }}>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;