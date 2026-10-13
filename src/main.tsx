import React from "react";
import ReactDOM from "react-dom/client";
import { ToastProvider } from "@/components/ui/Toast";
import { StoreProvider } from "./store";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StoreProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </StoreProvider>
  </React.StrictMode>
);