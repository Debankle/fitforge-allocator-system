import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
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
  const coreServiceRef = useRef(new CoreService());
  const coreService = coreServiceRef.current;
  const [_,setState] = useState(0);

  useEffect(() => {
    const listener = () => setState(prev => prev + 1);
    coreService.addListener(listener);
    return () => coreService.removeListener(listener);
  }, [coreService]);

  return (
    <CoreServiceContext.Provider value={coreService}>
      {children}
    </CoreServiceContext.Provider>
  );
};

export default CoreServiceProvider;
