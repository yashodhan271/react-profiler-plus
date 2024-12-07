import React from 'react';
import type { PerformanceReport } from './index';

interface PerformanceVisualizerProps {
  reports: PerformanceReport[];
  threshold?: number;
}

export const PerformanceVisualizer: React.FC<PerformanceVisualizerProps> = ({
  reports,
  threshold = 16
}) => {
  const maxRenderTime = Math.max(...reports.map(r => r.averageRenderTime));

  return (
    <div className="rpo-visualizer" style={{ 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '1rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      maxWidth: '800px',
      margin: '1rem'
    }}>
      <h2 style={{ marginTop: 0, color: '#343a40' }}>Performance Report</h2>
      {reports.map((report) => (
        <div
          key={report.componentId}
          style={{
            marginBottom: '1rem',
            padding: '1rem',
            backgroundColor: 'white',
            borderRadius: '4px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem'
          }}>
            <h3 style={{ margin: 0, color: '#495057' }}>{report.componentId}</h3>
            <span style={{
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              fontSize: '0.875rem',
              backgroundColor: report.averageRenderTime > threshold ? '#ffe3e3' : '#e6f8e6',
              color: report.averageRenderTime > threshold ? '#e03131' : '#2b8a3e'
            }}>
              {report.averageRenderTime.toFixed(2)}ms
            </span>
          </div>

          {/* Render time visualization bar */}
          <div style={{ 
            width: '100%', 
            height: '8px',
            backgroundColor: '#e9ecef',
            borderRadius: '4px',
            overflow: 'hidden',
            marginBottom: '0.5rem'
          }}>
            <div
              style={{
                width: `${(report.averageRenderTime / maxRenderTime) * 100}%`,
                height: '100%',
                backgroundColor: report.averageRenderTime > threshold ? '#ff6b6b' : '#51cf66',
                transition: 'width 0.3s ease'
              }}
            />
          </div>

          <div style={{ fontSize: '0.875rem', color: '#868e96' }}>
            Render count: {report.renderCount}
          </div>

          {report.suggestions.length > 0 && (
            <div style={{ marginTop: '0.5rem' }}>
              <h4 style={{ 
                margin: '0.5rem 0',
                fontSize: '0.875rem',
                color: '#495057'
              }}>
                Suggestions:
              </h4>
              <ul style={{ 
                margin: 0,
                paddingLeft: '1.25rem',
                fontSize: '0.875rem',
                color: '#495057'
              }}>
                {report.suggestions.map((suggestion, index) => (
                  <li key={index} style={{ marginBottom: '0.25rem' }}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
