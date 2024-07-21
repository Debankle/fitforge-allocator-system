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

function App() {
  // NOTE: Rewrite this to be a function state so data can be passed as needed idk if thats needed
  const [activeComponent, setActiveComponent] = useState("Upload");
  const coreService = useCoreService();
  const [isDataLoaded, setIsDataLoaded] = useState(coreService.isDataLoaded);

  useEffect(() => {
    setIsDataLoaded(coreService.isDataLoaded);
  }, [activeComponent]);

  const renderComponent = () => {
    if (!isDataLoaded) return <InputComponent />;
    switch (activeComponent) {
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
        return <PairingDiv team={2} project={2} />;
      case "ProjectList":
        return <ProjectList team={1} />;
      case "TeamList":
        return <TeamList project={1} />;
      default:
        return <InputComponent />;
    }
  };
  return (
    <>
      <Toolbar />
      <NavBar setActiveView={setActiveComponent} />

      {/* Plans for this section
        Toolbar for testing features
        - reset
        - upload when data is already uploaded
        - save current state
        - etc
        
        menu bar for switching between views
        - List view
        - Spreadsheet
        - others
        - etc

        view for subcomponent
        render the current layout in use
        be able to switch between them
        */}

      {renderComponent()}
    </>
  );
}

export default App;
