import React from 'react';
import FXDashboard from './Dashboard/FXDashboard'; // Adjust path if folder name is different
import './App.css';

function App() {
  return (
    <div className="App">
      {/* This renders your new Banking Dashboard */}
      <FXDashboard />
    </div>
  );
}

export default App;