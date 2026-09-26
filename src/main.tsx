import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { DAppKitProvider } from '@mysten/dapp-kit-react';
import '@fontsource/baloo-2/600.css';
import '@fontsource/baloo-2/800.css';
import '@fontsource-variable/nunito';
import '@fontsource/jetbrains-mono/500.css';
import './styles.css';
import { dAppKit } from './dapp-kit';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DAppKitProvider dAppKit={dAppKit}>
      <App />
    </DAppKitProvider>
  </StrictMode>,
);
