import { PageView } from "./interfaces";
import { createContext, ReactNode, useContext, useState, useRef } from "react";

const NavigationContext = createContext<{
  currentPage: PageView;
  navigate: (page: PageView) => void;
  history: PageView[];
} | null>(null);

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
  const [currentPage, setCurrentPage] = useState<PageView>({
    page: "Upload",
    data: null,
  });
  const historyRef = useRef<PageView[]>([]);

  const navigate = (page: PageView) => {
    setCurrentPage(page);
    historyRef.current.push(page);
  };

  return (
    <NavigationContext.Provider
      value={{ currentPage, navigate, history: historyRef.current }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export default NavigationProvider;
