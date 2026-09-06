import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "katex/dist/katex.min.css";
import App from "./App";
import { AuthProvider } from "./shared/AuthProvider";
import { ProgressSync } from "./shared/ProgressSync";
import "./styles.css";

const queryClient = new QueryClient();

// biome-ignore lint/style/noNonNullAssertion: root element is defined in index.html
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ProgressSync />
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
