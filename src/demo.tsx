import React from 'react';
import { createRoot } from 'react-dom/client';
import { ExampleApp } from './example';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ExampleApp />
  </React.StrictMode>
);
