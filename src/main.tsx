import React from "react";
import ReactDOM from "react-dom/client";
import { ToastProvider } from "@/components/ui/Toast";
import { StoreProvider } from "./store";
import { CookieBanner } from "./components/CookieBanner";
import { initTheme } from "./components/ThemeToggle";
import App from "./App";
import "./index.css";

// Aplica o tema antes de renderizar — evita flash branco
initTheme();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StoreProvider>
      <ToastProvider>
        <App />
        <CookieBanner />
      </ToastProvider>
    </StoreProvider>
  </React.StrictMode>
);