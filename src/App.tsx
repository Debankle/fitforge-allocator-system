import { useState } from "react";
import InputComponent from "./components/InputComponent";
import ToolbarB from "./components/Toolbar_Combine";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Rest from "./pages/Rest";
import Save from "./pages/Save"
import Select from "./pages/Select"
import FitScalar from "./pages/FitScalar"
import PreferenceScalar from "./pages/PreferenceScalar"
import Upload from "./pages/Upload"
import List from "./pages/ListView"
import SpreadSheet from "./pages/SpreadSheet"
import Allocations from "./pages/Allocations"
import Rejections from "./pages/Rejections"


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
      {
      
      /* Plans for this section
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
      
      {Toolbar()}
      <InputComponent />
      
      {renderComponent()}
    </>
  );

  


  function Toolbar() {
    return <Router>
      <ToolbarB />
      <Routes>
        <Route path='/Rest' element={<Rest />} />
        <Route path='/Save' element={<Save />} />
        <Route path='/Select' element={<Select />} />
        <Route path='/FitScalar' element={<FitScalar />} />
        <Route path='/PreferenceScalar' element={<PreferenceScalar />} />
        <Route path='/Upload' element={<Upload />} />
        <Route path='/List' element={<List />} />
        <Route path='/SpreadSheet' element={<SpreadSheet />} />
        <Route path='/Allocations' element={<Allocations />} />
        <Route path='/Rejections' element={<Rejections />} />
      </Routes>
    </Router>;
  }
}

export default App;
