import React from 'react';
import { createRoot } from 'react-dom/client';
import ShipIntro from './game/ShipIntro';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ShipIntro />
  </React.StrictMode>,
);
