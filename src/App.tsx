import { useState } from "react";
import InputComponent from "./components/InputComponent";
import Toolbar from "./components/Toolbar";

function App() {
  // NOTE: Rewrite this to be a function state so data can be passed as needed idk if thats needed
  const [activeComponent, setActiveComponent] = useState("Upload");

  const renderComponent = () => {
    /* Pass setActiveComponent to each subcomponent so they can call it when needed
    <Component switchComponent={setActiveComponent} />
    function Component({switchComponent}) { ... }
    */
    switch (activeComponent) {
      case "Upload":
        return <div>Upload view</div>;
      default:
        return <div>Default view probably upload as well</div>;
    }
  };
  return (
    <>
        <Toolbar />

      <h1 className="text-blue-500 text-center">Testing</h1>

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

      <InputComponent />

      {renderComponent()}
    </>
  );
}

export default App;
