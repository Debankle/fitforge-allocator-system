import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useCoreService } from "../CoreServiceContext";

function Toolbar() {
  const [fitScale, setFitScale] = useState<number>(1);
  const [prefScale, setPrefScale] = useState<number>(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coreService = useCoreService();

  useEffect(() => {
    setFitScale(coreService.get_fit_scalar());
    setPrefScale(coreService.get_pref_scalar());
  }, [coreService]);

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
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        coreService.loadState(file);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleSaveBtn = () => {
    coreService.saveState("saveState.ffas");
  };

  return (
    <div className="bg-green-300 p-4 flex justify-between items-center">
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
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
          onClick={() => {
            coreService.log_dump();
          }}
        >
          Dump CoreService
        </button>

        <button
          className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-700"
          onClick={() => {
            coreService.soft_reset();
          }}
        >
          Reset Data
        </button>

        <button
          className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-700"
          onClick={() => {
            coreService.hard_reset();
          }}
        >
          Clear All
        </button>
      </div>
    </div>
  );
}

export default Toolbar;
