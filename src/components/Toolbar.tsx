import { ChangeEvent, useState } from "react";
import { useCoreService } from "../CoreServiceContext";

function Toolbar() {
  const [fitScale, setFitScale] = useState<number>(1);
  const [prefScale, setPrefScale] = useState<number>(1);
  const coreService = useCoreService();

  const handleFitScaleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, parseFloat(e.target.value) || 0);
    setFitScale(value);
    coreService.set_fit_scalar(fitScale);
  };

  const handlePrefScaleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, parseFloat(e.target.value) || 0);
    setPrefScale(value);
    coreService.set_pref_scalar(prefScale);
  };

  const handleLoadBtn = () => {
    // call coreservice load when implemented
    console.log("Loading not implemented yet!");
  };

  const handleSaveBtn = () => {
    // call coreservice save when implemented
    console.log("Saving not implemented yet!");
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
      </div>
    </div>
  );
}

export default Toolbar;
