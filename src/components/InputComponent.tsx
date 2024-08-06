import { ChangeEvent, useEffect, useState } from "react";
import readXlsxFile, { readSheetNames } from "read-excel-file";
import { useCoreService } from "../CoreServiceContext";
import { Setup } from "../interfaces";
import { useNavigation } from "../NavServiceContext";

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
  const [phase, setPhase] = useState<"Upload" | "Set" | "Load">("Upload");
  const coreService = useCoreService();
  const { navigate } = useNavigation();

  useEffect(() => {
    setSheetNames({});
    setSheetTags({});
  }, [files]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
      setLoadError(null);
      setPhase("Set");
    }
  };

  const loadSheetNames = () => {
    if (files.length !== 0) {
      const promises = files.map((file) =>
        readSheetNames(file).then((sheetNamesArray) => ({
          file,
          sheetNamesArray,
        }))
      );

      Promise.all(promises)
        .then((results) => {
          const newSheetNames: { [fileName: string]: string[] } = {};
          const newSheetTags: { [fileName: string]: SheetTags } = {};

          results.forEach(({ file, sheetNamesArray }) => {
            const fileName = file.name;
            newSheetNames[fileName] = sheetNamesArray;
            newSheetTags[fileName] = {};

            sheetNamesArray.forEach((name) => {
              newSheetTags[fileName][name] = "";
            });
          });
          setSheetNames(newSheetNames);
          setSheetTags(newSheetTags);
        })
        .catch((error) => {
          console.log("error loading sheet names: ", error);
          setLoadError("Error loading sheet names. Please try again.");
        });
    }
  };

  const loadData = () => {
    if (files.length !== 0) {
      setProcessing(true);
      const promises: Promise<{ data: number[][]; tag: string }>[] = [];
      let impact: number[][] = [];
      let capability: number[][] = [];
      let preference: number[][] = [];

      files.forEach((file) => {
        const fileName = file.name;
        const fileSheetNames = sheetNames[fileName];
        const fileSheetTags = sheetTags[fileName];

        fileSheetNames.forEach((sheetName) => {
          const tag = fileSheetTags[sheetName];
          if (tag == "Impact" || tag == "Capability" || tag == "Preference") {
            promises.push(readFromExcelSheet(file, sheetName, tag));
          }
        });
      });

      Promise.all(promises).then((results) => {
        results.forEach(({ data, tag }) => {
          if (tag === "Impact") {
            impact.push(...data);
          } else if (tag === "Capability") {
            capability.push(...data);
          } else if (tag === "Preference") {
            preference.push(...data);
          }
        });

        const setupParams: Setup = {
          impact_vals: impact,
          capability_vals: capability,
          preference_vals: preference,
        };

        coreService.initialise_values(setupParams);
        coreService.dataStage = "Stage2";
        navigate({ page: "TeamsToProjects", data: null });
      });
    }
  };

  const readFromExcelSheet = (
    sheet: File,
    sheetName: string,
    tag: string
  ): Promise<{ data: number[][]; tag: string }> => {
    return new Promise((resolve, reject) => {
      readXlsxFile(sheet, { sheet: sheetName })
        .then((rows) => {
          const dataArray: number[][] = [];
          // const colIndex = tag === "Impact" ? 2 : 1;
          const colIndex = 2;
          for (let i = 1; i < rows.length; i++) {
            dataArray[i - 1] = [];
            for (let j = colIndex; j < rows[0].length; j++) {
              const cellValue = rows[i][j];
              if (typeof cellValue == "number") {
                dataArray[i - 1][j - colIndex] = cellValue;
              }
            }
          }
          resolve({ data: dataArray, tag });
        })
        .catch((error) => {
          console.error("Error reading sheet: ", error);
          reject(error);
        });
    });
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

  const readBtnClick = () => {
    loadSheetNames();
    setPhase("Load");
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

        {/*  Load sheet titles to identify them  */}
        {phase == "Set" && (
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
            onClick={readBtnClick}
          >
            Read Sheets
          </button>
        )}

        {/*  Loads data to coreService and switches to num teams to project */}
        {phase == "Load" && (
          <div>
            {Object.keys(sheetNames).length > 0 && (
              <div className="mb-4">
                <h3 className="mb-4 text-xl font-semibold text-gray-800">
                  Please select the correct sheets for the Impact, Capability
                  and Preference Data:
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
                              <option value="Impact">Impact</option>
                              <option value="Capability">Capability</option>
                              <option value="Preference">Preference</option>
                            </select>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
              onClick={loadData}
              disabled={processing}
            >
              Load Data
            </button>
          </div>
        )}

        {loadError && (
          <p className="text-red-600 mt-4 text-center">{loadError}</p>
        )}
      </div>
    </div>
  );
}

export default InputComponent;
