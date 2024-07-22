import { useEffect, useState } from "react";
import InputComponent from "./components/InputComponent";
import Toolbar from "./components/Toolbar";
import NavBar from "./components/NavBar";
import PairingDiv from "./components/Pairing";
import { useCoreService } from "./CoreServiceContext";
import SpreadsheetView from "./components/views/SpreadsheetView";
import Allocations from "./components/views/Allocations";
import Algorithm from "./components/views/Algorithm";
import Rejections from "./components/views/Rejections";
import ProjectList from "./components/views/ProjectList";
import TeamList from "./components/views/TeamList";
import { useNavigation } from "./NavServiceContext";

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
      case "Pairing":
        return (
          <PairingDiv
            team={currentPage.data.team}
            project={currentPage.data.project}
          />
        );
      case "ProjectList":
        return <ProjectList team={currentPage.data.team} />;
      case "TeamList":
        return <TeamList project={currentPage.data.project} />;
      default:
        return <InputComponent />;
    }
  };
  return (
    <>
      <Toolbar />
      <NavBar />

      {renderComponent()}
    </>
  );
}

export default App;
