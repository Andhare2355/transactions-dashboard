import React, { useState } from 'react';
import TransactionsTable from './components/TransactionsTable';

function App() {
  const [month, setMonth] = useState(3); // Default to March
  return (
    <TransactionsTable month={month} setMonth={setMonth} />
  );
}

export default App;