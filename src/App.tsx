import { useEffect, useState } from "react";
import InputComponent from "./components/InputComponent";
import Toolbar from "./components/Toolbar";
import NavBar from "./components/NavBar";
import { useCoreService } from "./CoreServiceContext";
import SpreadsheetView from "./components/views/SpreadsheetView";
import Allocations from "./components/views/Allocations";
import Algorithm from "./components/views/Algorithm";
import Rejections from "./components/views/Rejections";
import ProjectList from "./components/views/ProjectList";
import TeamList from "./components/views/TeamList";
import { useNavigation } from "./NavServiceContext";
import './App.css'; // Import your CSS file

function App() {
  const coreService = useCoreService();
  const { currentPage } = useNavigation();
  const [isDataLoaded, setIsDataLoaded] = useState(coreService.isDataLoaded);

  useEffect(() => {
    setIsDataLoaded(coreService.isDataLoaded);
  }, [currentPage]);

  const renderComponent = () => {
    if (!isDataLoaded) return <InputComponent />;
    switch (currentPage.page) {
      case "Upload":
        return <InputComponent />;
      case "Algorithm":
        return <Algorithm />;
      case "Spreadsheet":
        return <SpreadsheetView />;
      case "Allocations":
        return <Allocations />;
      case "Rejections":
        return <Rejections />;
      case "ProjectList":
        return <ProjectList team={currentPage.data.team} />;
      case "TeamList":
        return <TeamList project={currentPage.data.project} />;
      default:
        return <InputComponent />;
    }
  };

  return (
    <div className="app-container">

      <div className="sticky top-0">
        <Toolbar />
        <NavBar />
      </div>
      <div className="flex justify-center items-center mt-2">
        {renderComponent()}
      </div>
    </div>

  );
}

export default App;
