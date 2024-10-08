import React from "react";
import ReactDOM from "react-dom/client";
import CoreServiceProvider from "./CoreServiceContext";
import NavigationProvider from "./NavServiceContext.tsx";
import App from "./App.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <CoreServiceProvider>
      <NavigationProvider>
          <App />
      </NavigationProvider>
    </CoreServiceProvider>
  </React.StrictMode>
);
