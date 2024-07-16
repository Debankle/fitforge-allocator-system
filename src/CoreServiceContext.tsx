import { createContext, useContext, useState, ReactNode } from "react";
import CoreService from "./CoreService";

const CoreServiceContext = createContext<CoreService | null>(null);

export const useCoreService = (): CoreService => {
  const context = useContext(CoreServiceContext);
  if (!context) {
    throw new Error("useCoreService must be used within a CoreServiceProvider");
  }
  return context;
};

const CoreServiceProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const coreService = new CoreService();

  return (
    <CoreServiceContext.Provider value={coreService}>
      {children}
    </CoreServiceContext.Provider>
  );
};

export default CoreServiceProvider;
