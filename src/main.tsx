import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthProvider";
import { WalletProvider } from "./context/WalletContext";
import { ThemeProvider } from "@mui/material/styles";
import muiTheme from "./theme/mui-theme";
// Import the inert polyfill
import { initInertPolyfill } from "./lib/inertPolyfill";
// Import dialog accessibility fix
import { fixDialogAccessibility } from "./utils/fixDialogAccessibility";

// Initialize inert polyfill for browsers that don't support it
initInertPolyfill();

// Fix dialog accessibility issues
fixDialogAccessibility();

// Polyfill Buffer for browser compatibility
import { Buffer as BufferPolyfill } from "buffer";
window.Buffer = window.Buffer || BufferPolyfill;

// Import the dev tools and initialize them
import { TempoDevtools } from "tempo-devtools";
TempoDevtools.init();

const basename = import.meta.env.BASE_URL;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <WalletProvider>
          <ThemeProvider theme={muiTheme}>
            <App />
          </ThemeProvider>
        </WalletProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
