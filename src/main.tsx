import React from "react";
import ReactDOM from "react-dom/client";
import CoreService from "./CoreService";
import CoreServiceContext from "./CoreServiceContext";
import App from "./App.tsx";
import "./index.css";

const coreService = new CoreService();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <CoreServiceContext.Provider value={coreService}>
      <App />
    </CoreServiceContext.Provider>
  </React.StrictMode>
);
