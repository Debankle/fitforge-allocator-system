import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import CoreService from "./CoreService";

/**
 * Context to provide and consume the CoreService instance.
 * Initialized with `null` and should be properly initialized by the `CoreServiceProvider`.
 */
const CoreServiceContext = createContext<CoreService | null>(null);

/**
 * Hook to use the CoreService instance.
 * Must be used within a `CoreServiceProvider`.
 *
 * @throws {Error} If used outside of `CoreServiceProvider`.
 * @returns {CoreService} The CoreService instance.
 */
export const useCoreService = (): CoreService => {
  const context = useContext(CoreServiceContext);
  if (!context) {
    throw new Error("useCoreService must be used within a CoreServiceProvider");
  }
  return context;
};

/**
 * Props for the `CoreServiceProvider` component.
 *
 * @typedef {Object} CoreServiceProviderProps
 * @property {ReactNode} children - The child components to be rendered within the provider.
 */
type CoreServiceProviderProps = {
  children: ReactNode;
};

/**
 * A provider component that initializes and provides a CoreService instance
 * to its children via React Context.
 *
 * @param {CoreServiceProviderProps} props - The props for the CoreServiceProvider.
 * @returns {JSX.Element} The CoreServiceContext provider component.
 */
const CoreServiceProvider: React.FC<CoreServiceProviderProps> = ({
  children,
}) => {
  const coreServiceRef = useRef(new CoreService());
  const coreService = coreServiceRef.current;
  const [_, setState] = useState(0);

  useEffect(() => {
    const listener = () => setState((prev) => prev + 1);
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
