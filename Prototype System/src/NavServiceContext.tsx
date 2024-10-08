import { PageView } from "./interfaces";
import { createContext, ReactNode, useContext, useState } from "react";

/**
 * Interface defining the structure of the navigation context.
 *
 * @typedef {Object} NavigationContextType
 * @property {PageView} currentPage - The current page being viewed.
 * @property {(page: PageView) => void} navigate - Function to navigate to a new page.
 * @property {() => void} goBack - Function to navigate to the previous page in the history.
 * @property {() => void} goForward - Function to navigate to the next page in the history.
 * @property {PageView[]} history - Array representing the history of navigated pages.
 * @property {number} currentIndex - The current index in the navigation history.
 */
interface NavigationContextType {
  currentPage: PageView;
  navigate: (page: PageView) => void;
  goBack: () => void;
  goForward: () => void;
  history: PageView[];
  currentIndex: number;
}

/**
 * Context to provide and consume the navigation state and functions.
 * Initialized with `null` and should be properly initialized by the `NavigationProvider`.
 */
const NavigationContext = createContext<NavigationContextType | null>(null);

/**
 * Hook to use the navigation context.
 * Must be used within a `NavigationProvider`.
 *
 * @throws {Error} If used outside of `NavigationProvider`.
 * @returns {NavigationContextType} The navigation context value.
 */
export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
};

/**
 * Props for the `NavigationProvider` component.
 *
 * @typedef {Object} NavigationProviderProps
 * @property {ReactNode} children - The child components to be rendered within the provider.
 */
type NavigationProviderProps = {
  children: ReactNode;
};

/**
 * A provider component that manages the navigation state and provides
 * navigation functions to its children via React Context.
 *
 * @param {NavigationProviderProps} props - The props for the NavigationProvider.
 * @returns {JSX.Element} The NavigationContext provider component.
 */
const NavigationProvider: React.FC<NavigationProviderProps> = ({
  children,
}) => {
  const [history, setHistory] = useState<PageView[]>([
    {
      page: "Upload",
      data: null,
    },
  ]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  /**
   * Navigates to a new page and updates the navigation history.
   *
   * @param {PageView} page - The page to navigate to.
   */
  const navigate = (page: PageView) => {
    const newHistory = [...history.slice(0, currentIndex + 1), page];
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  };

  /**
   * Navigates to the previous page in the history if possible.
   */
  const goBack = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

  /**
   * Navigates to the next page in the history if possible.
   */
  const goForward = () => {
    setCurrentIndex((prevIndex) => Math.min(prevIndex + 1, history.length - 1));
  };

  const currentPage = history[currentIndex];

  return (
    <NavigationContext.Provider
      value={{
        currentPage,
        navigate,
        goBack,
        goForward,
        history,
        currentIndex,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export default NavigationProvider;
