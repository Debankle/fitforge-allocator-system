import { useState } from "react";
import InputComponent from "./components/InputComponent";
import Toolbar from "./components/Toolbar";
import NavBar from "./components/NavBar";
import PairingDiv from "./components/Pairing";
import { useCoreService } from "./CoreServiceContext";
import ListView from "./components/views/ListView";
import SpreadsheetView from "./components/views/SpreadsheetView";

function App() {
  // NOTE: Rewrite this to be a function state so data can be passed as needed idk if thats needed
  const [activeComponent, setActiveComponent] = useState("Upload");
  const coreService = useCoreService();

  const renderComponent = () => {
    /* Pass setActiveComponent to each subcomponent so they can call it when needed
    <Component switchComponent={setActiveComponent} />
    function Component({switchComponent}) { ... }
    */
    switch (activeComponent) {
      case "Upload":
        return <InputComponent />;
      case "Algorithm":
        return <div>Algorithm view</div>;
      case "Spreadsheet":
        return <></>;
        // return <SpreadsheetView />;
      case "Allocations":
        return <ListView />;
      case "Pairing":
        return <PairingDiv team={2} project={2} />;
      default:
        return <div>Default view probably upload as well</div>;
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
