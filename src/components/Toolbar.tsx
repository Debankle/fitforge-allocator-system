import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useCoreService } from "../CoreServiceContext";

function Toolbar() {
  const [fitScale, setFitScale] = useState<number>(1);
  const [prefScale, setPrefScale] = useState<number>(1);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

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

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="bg-[#156ad2] p-4 flex justify-center items-center space-x-4 font-bold">
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <div className="relative">
        <button
          className="bg-white text-[#156ad2] px-4 py-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={toggleDropdown}
        >
          Save/Load
        </button>
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 bg-white border border-gray-300 rounded-md shadow-lg z-10">
            <button
              className="block px-4 py-2 text-[#156ad2] hover:bg-gray-100 w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={handleSaveBtn}
            >
              Save
            </button>
            <button
              className="block px-4 py-2 text-[#156ad2] hover:bg-gray-100 w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={handleLoadBtn}
            >
              Load
            </button>
          </div>
        )}
      </div>
      <label className="text-white font-bold" htmlFor="input1">
        Fit Scale:
      </label>
      <input
        id="input1"
        type="number"
        value={fitScale}
        onChange={handleFitScaleChange}
        min="0"
        step="0.001"
        className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      />
      <label className="text-white font-bold" htmlFor="input2">
        Preference Scale:
      </label>
      <input
        id="input2"
        type="number"
        value={prefScale}
        onChange={handlePrefScaleChange}
        min="0"
        step="0.001"
        className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      />
      <button
        className="bg-white text-[#156ad2] px-4 py-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => {
          coreService.log_dump();
        }}
      >
        Dump CoreService
      </button>
      <button
        className="bg-white text-[#156ad2] px-4 py-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => {
          coreService.soft_reset();
        }}
      >
        Reset Data
      </button>
      <button
        className="bg-white text-[#156ad2] px-4 py-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => {
          coreService.hard_reset();
        }}
      >
        Clear All
      </button>
    </div>
  );
}

export default Toolbar;
