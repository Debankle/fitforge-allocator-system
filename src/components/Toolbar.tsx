import { ChangeEvent, useState } from "react";
import { useCoreService } from "../CoreServiceContext";

function Toolbar() {
  const [fitScale, setFitScale] = useState<number>(1);
  const [prefScale, setPrefScale] = useState<number>(1);
  const coreService = useCoreService();

  const handleFitScaleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFitScale(parseFloat(e.target.value));
    const value = Math.max(0, parseFloat(e.target.value) || 0);
    coreService.set_fit_scalar(value);
  };

  const handlePrefScaleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPrefScale(parseFloat(e.target.value));
    const value = Math.max(0, parseFloat(e.target.value) || 0);
    coreService.set_pref_scalar(value);
  };

  const handleLoadBtn = () => {
    // call coreservice load when implemented
    console.log("Loading not implemented yet!");
  };

  const handleSaveBtn = () => {
    // call coreservice save when implemented
    console.log("Saving not implemented yet!");
  };

  const outputLog = () => {
    coreService.log_dump();
  };

  const softClear = () => {
    coreService.soft_reset();
  };

  const hardClear = () => {
    coreService.hard_reset();
  };

  return (
    <div className="bg-green-300 p-4 flex justify-between items-center">
      <div className="flex space-x-4">
        <button
          className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-700"
          onClick={handleSaveBtn}
        >
          Save
        </button>
        <button
          className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-700"
          onClick={handleLoadBtn}
        >
          Load
        </button>
        <label className="text-white" htmlFor="input1">
          Fit Scale:
        </label>
        <input
          id="input1"
          type="number"
          value={fitScale}
          onChange={handleFitScaleChange}
          min="0"
          step="0.001"
          className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></input>

        <label className="text-white" htmlFor="input2">
          Preference Scale:
        </label>
        <input
          id="input2"
          type="number"
          value={prefScale}
          onChange={handlePrefScaleChange}
          min="0"
          step="0.001"
          className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></input>

        <button
          className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-700"
          onClick={outputLog}
        >
          Dump CoreService
        </button>

        <button
          className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-700"
          onClick={softClear}
        >
          Reset Data
        </button>

        <button
          className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-700"
          onClick={hardClear}
        >
          Clear All
        </button>
      </div>
    </div>
  );
}

export default Toolbar;
