

// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import DashboardLayout from './components/layout/DashboardLayout';
// import CurrencyExchange from './pages/CurrencyExchange';
// import CustomerTransactions from './pages/CustomerTransactions';

// /**
//  * Main App Component with Routing
//  * Backend is SOURCE OF TRUTH - No frontend calculations
//  */
// const App: React.FC = () => {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<DashboardLayout />}>
//           {/* Default route - redirect to currency exchange */}
//           <Route index element={<Navigate to="/currency-exchange" replace />} />
          
//           {/* Currency Exchange Page - Your existing calculator */}
//           <Route path="currency-exchange" element={<CurrencyExchange />} />
          
//           {/* Customer Transactions Page - Uses backend APIs */}
//           <Route path="customer-transactions" element={<CustomerTransactions />} />
          
//           {/* 404 - Redirect to currency exchange */}
//           <Route path="*" element={<Navigate to="/currency-exchange" replace />} />
//         </Route>
//       </Routes>
//     </Router>
//   );
// };

// export default App;


import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import CurrencyExchange from './pages/CurrencyExchange';
import CustomerTransactions from './pages/CustomerTransactions';
import RateManagement from './pages/RateManagement';

const App: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/currency-exchange" replace />} />
        <Route path="currency-exchange"     element={<CurrencyExchange />} />
        <Route path="customer-transactions" element={<CustomerTransactions />} />
        <Route path="rate-management"       element={<RateManagement />} />
        <Route path="*" element={<Navigate to="/currency-exchange" replace />} />
      </Route>
    </Routes>
  </Router>
);

export default App;