import { ChangeEvent, useEffect, useState } from "react";
import readXlsxFile, { readSheetNames } from "read-excel-file";
import { useCoreService } from "../CoreServiceContext";

interface SheetTags {
  [key: string]: string;
}

function InputComponent() {
  const [files, setFiles] = useState<File[]>([]);
  const [sheetNames, setSheetNames] = useState<{
    [fileName: string]: string[];
  }>({});
  const [sheetTags, setSheetTags] = useState<{ [fileName: string]: SheetTags }>(
    {}
  );
  const [processing, setProcessing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const coreService = useCoreService();

  useEffect(() => {
    setSheetNames({});
    setSheetTags({});
  }, [files]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
      setLoadError(null);
    }
  };

  const handleTagChange = (
    fileName: string,
    sheetName: string,
    tag: string
  ) => {
    setSheetTags({
      ...sheetTags,
      [fileName]: { ...sheetTags[fileName], [sheetName]: tag },
    });
  };

  return (
    <div className="bg-[#cdd1d8] min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl w-full">
        <div className="flex flex-col items-center mb-4">
          <input
            type="file"
            id="input"
            multiple
            onChange={handleFileChange}
            className="mb-4 border border-gray-300 rounded-md p-2 w-full"
            disabled={processing}
          />
        </div>

        {Object.keys(sheetNames).length > 0 && (
          <div className="mb-4">
            <h3 className="mb-4 text-xl font-semibold text-gray-800">
              Please select the sheet containing the Fit Data and the sheet
              containing the Preference Data:
            </h3>
            {Object.entries(sheetNames).map(([fileName, names]) => (
              <div key={fileName} className="mb-4">
                <h4 className="text-lg font-semibold text-gray-700">
                  {fileName}
                </h4>
                <ul>
                  {names.map((name, index) => (
                    <li key={index} className="mb-2 text-md text-gray-600">
                      {name}
                      <div className="inline-block ml-2">
                        <select
                          value={sheetTags[fileName][name]}
                          onChange={(e) =>
                            handleTagChange(fileName, name, e.target.value)
                          }
                          className="ml-2 p-2 border border-gray-300 rounded-md"
                          disabled={processing}
                        >
                          <option value="">Select Tag</option>
                          <option value="Fit">Fit</option>
                          <option value="Pref">Pref</option>
                        </select>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/*}
        <div className="flex justify-center space-x-4 mt-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
            onClick={loadSheetNames}
            disabled={processing || files.length === 0}
          >
            {processing ? "Loading..." : "Load Sheets"}
          </button>

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
            onClick={loadData}
            disabled={
              processing ||
              files.length === 0 ||
              Object.keys(sheetNames).length === 0
            }
          >
            {processing ? "Processing..." : "Process Data"}
          </button>
        </div>
        {*/}

        {loadError && (
          <p className="text-red-600 mt-4 text-center">{loadError}</p>
        )}
      </div>
    </div>
  );
}

export default InputComponent;
