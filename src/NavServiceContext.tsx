import { PageView } from "./interfaces";
import { createContext, ReactNode, useContext, useState, useRef } from "react";

interface NavigationContextType {
  currentPage: PageView;
  navigate: (page: PageView) => void;
  goBack: () => void;
  goForward: () => void;
  history: PageView[];
  currentIndex: number;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
};

const NavigationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [history, setHistory] = useState<PageView[]>([
    {
      page: "Upload",
      data: null,
    },
  ]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  const navigate = (page: PageView) => {
    const newHistory = [...history.slice(0, currentIndex + 1), page];
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  };

  const goBack = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - 1, 0));
  };

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
