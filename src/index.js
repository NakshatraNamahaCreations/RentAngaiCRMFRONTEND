import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { ContextProvider } from "./contexts/ContextProvider";
import "./index.css";

// Create root
const root = createRoot(document.getElementById("root"));

// Render whole app inside the root
root.render(
  <ContextProvider>
    <App />
  </ContextProvider>
);
