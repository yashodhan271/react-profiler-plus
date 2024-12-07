import React, { useState, useMemo } from 'react';
import { RPOWrapper } from './index';
import { PerformanceVisualizer } from './visualization';
import type { PerformanceReport } from './index';

// Example component with intentional performance issues
const ExpensiveComponent: React.FC<{ value: number }> = ({ value }) => {
  // Expensive calculation that should be memoized
  const expensiveResult = Array(value)
    .fill(0)
    .reduce((acc) => acc + Math.random(), 0);

  return (
    <div style={{ padding: '1rem', border: '1px solid #ddd' }}>
      <h3>Expensive Component</h3>
      <p>Result: {expensiveResult}</p>
    </div>
  );
};

// Example component with frequent updates
const FrequentUpdater: React.FC = () => {
  const [count, setCount] = useState(0);

  // Frequent updates that might cause unnecessary renders
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => c + 1);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ padding: '1rem', border: '1px solid #ddd' }}>
      <h3>Frequent Updater</h3>
      <p>Count: {count}</p>
    </div>
  );
};

// Optimized version of ExpensiveComponent
const OptimizedExpensiveComponent: React.FC<{ value: number }> = React.memo(({ value }) => {
  // Memoized expensive calculation
  const expensiveResult = useMemo(() => {
    return Array(value)
      .fill(0)
      .reduce((acc) => acc + Math.random(), 0);
  }, [value]);

  return (
    <div style={{ padding: '1rem', border: '1px solid #ddd' }}>
      <h3>Optimized Expensive Component</h3>
      <p>Result: {expensiveResult}</p>
    </div>
  );
});

export const ExampleApp: React.FC = () => {
  const [reports, setReports] = useState<PerformanceReport[]>([]);
  const [showOptimized, setShowOptimized] = useState(false);

  const handleReport = (newReports: PerformanceReport[]) => {
    setReports(newReports);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1>React Performance Optimizer Demo</h1>
      
      <button
        onClick={() => setShowOptimized(prev => !prev)}
        style={{
          padding: '0.5rem 1rem',
          margin: '1rem 0',
          backgroundColor: '#228be6',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        {showOptimized ? 'Show Unoptimized' : 'Show Optimized'}
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <RPOWrapper onReport={handleReport}>
            {showOptimized ? (
              <OptimizedExpensiveComponent value={1000000} />
            ) : (
              <ExpensiveComponent value={1000000} />
            )}
            <FrequentUpdater />
          </RPOWrapper>
        </div>

        <div>
          <PerformanceVisualizer reports={reports} />
        </div>
      </div>
    </div>
  );
};
