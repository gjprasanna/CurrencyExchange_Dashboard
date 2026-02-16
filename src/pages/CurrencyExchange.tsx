import React from 'react';
import FXDashboard from '../Dashboard/FXDashboard'; // Adjust path if folder name is different

/**
 * Currency Exchange Page
 * Wrapper for FXDashboard component
 */
const CurrencyExchange: React.FC = () => {
  return (
    <div style={{ width: '100%' }}> 
      <FXDashboard />
    </div>
  );
};

export default CurrencyExchange;