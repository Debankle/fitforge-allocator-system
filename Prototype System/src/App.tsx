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
import TeamsToProjects from "./components/views/TeamsToProjects";
import PairingDiv from "./components/Pairing";
import { useNavigation } from "./NavServiceContext";
import "./App.css";
import FullList from "./components/views/FullList";

/**
 * `App` renders the main view of the webapp, switching the child element rendered in the
 * body of the display with renderComponentr by taking updates from NavigationContext
 *
 * @returns {JSX.Element}
 */
function App() {
  const coreService = useCoreService();
  const { currentPage } = useNavigation();
  const [dataStage, setDataStage] = useState(coreService.dataStage);
  document.title = "FitForge Allocator";

  useEffect(() => {
    setDataStage(coreService.dataStage);
  }, [currentPage]);

  const renderComponent = () => {
    try {
      if (dataStage == "Stage1") return <InputComponent />;
      switch (currentPage.page) {
        case "Upload":
          return <InputComponent />;
        case "TeamsToProjects":
          return <TeamsToProjects />;
        case "Algorithm":
          return <Algorithm />;
        case "Spreadsheet":
          return (
            <SpreadsheetView
              team={currentPage.data.team}
              project={currentPage.data.project}
            />
          );
        case "Allocations":
          return <Allocations />;
        case "Rejections":
          return <Rejections />;
        case "ProjectList":
          return <ProjectList team={currentPage.data.team} />;
        case "TeamList":
          return <TeamList project={currentPage.data.project} />;
        case "FullList":
          return <FullList />;
        case "PairingTest":
          return (
            <PairingDiv
              team={currentPage.data.team}
              project={currentPage.data.project}
              onToggle={() => {}}
            />
          );
        default:
          return <InputComponent />;
      }
    } catch (e) {
      coreService.saveState();
      return (
        <h1>
          Something went wrong. Progress was saved, please reload the page
        </h1>
      );
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
