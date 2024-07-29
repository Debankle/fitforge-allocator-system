import { ChangeEvent, useState, useEffect } from "react";
import readXlsxFile, { readSheetNames } from "read-excel-file";
import { useCoreService } from "../CoreServiceContext";

interface Setup {
  fit_vals: number[][];
  pref_vals: number[][];
  num_teams_to_project: number[];
  sheet_tags?: { [key: string]: string };
  multi_team_projects?: { [projectId: string]: boolean };
}

interface SheetTags {
  [key: string]: string;
}

function InputComponent() {
  const [files, setFiles] = useState<File[]>([]);
  const [sheetNames, setSheetNames] = useState<{ [fileName: string]: string[] }>({});
  const [sheetTags, setSheetTags] = useState<{ [fileName: string]: SheetTags }>({});
  const [projectOptions, setProjectOptions] = useState<string[]>([]);
  const [multiTeamProjects, setMultiTeamProjects] = useState<{ [projectId: string]: boolean }>({});
  const [processing, setProcessing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const coreService = useCoreService();

  useEffect(() => {
    setSheetNames({});
    setSheetTags({});
    setProjectOptions([]);
    setMultiTeamProjects({});
  }, [files]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
      setSheetNames({});
      setSheetTags({});
      setProjectOptions([]);
      setMultiTeamProjects({});
      setLoadError(null);
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
          console.error("Error loading sheet names:", error);
          setLoadError("Error loading sheet names. Please try again.");
        });
    }
  };

  const handleTagChange = (fileName: string, sheetName: string, tag: string) => {
    setSheetTags({
      ...sheetTags,
      [fileName]: { ...sheetTags[fileName], [sheetName]: tag },
    });
  };

  const handleMultiTeamChange = (projectId: string, canTakeMultipleTeams: boolean) => {
    setMultiTeamProjects({
      ...multiTeamProjects,
      [projectId]: canTakeMultipleTeams,
    });
  };

  const extractProjectsFromSheet = (data: number[][]): string[] => {
    if (data.length > 0) {
      return data[0].map((_, index) => `Project ${index + 1}`);
    }
    return [];
  };

  const loadData = () => {
    if (files.length !== 0) {
      setProcessing(true);
      const promises: Promise<{ data: number[][]; tag: string }>[] = [];
      const fit: number[][] = [];
      const pref: number[][] = [];
      const n: number[] = [];

      files.forEach((file) => {
        const fileName = file.name;
        const fileSheetNames = sheetNames[fileName];
        const fileSheetTags = sheetTags[fileName];

        fileSheetNames.forEach((sheetName) => {
          const tag = fileSheetTags[sheetName];
          if (tag === "Fit" || tag === "Pref") {
            promises.push(readFromExcelSheet(file, sheetName, tag));
          }
        });
      });

      Promise.all(promises)
        .then((results) => {
          const projects: string[] = [];
          results.forEach(({ data, tag }) => {
            if (tag === "Fit") {
              fit.push(...data);
              n.push(data.length);
              if (projects.length === 0) {
                projects.push(...extractProjectsFromSheet(data));
              }
            } else if (tag === "Pref") {
              pref.push(...data);
            }
          });

          setProjectOptions(projects);

          const setupParams: Setup = {
            fit_vals: fit,
            pref_vals: pref,
            num_teams_to_project: n,
            sheet_tags: Object.assign({}, ...Object.values(sheetTags)),
            multi_team_projects: multiTeamProjects,
          };

          coreService.initialise_values(setupParams);
          coreService.run_algorithm("ILP");
        })
        .catch((error) => {
          console.error("Error processing data:", error);
          setLoadError("Error processing data. Please try again.");
        })
        .finally(() => {
          setProcessing(false);
        });
    }
  };

  const readFromExcelSheet = (sheet: File, sheetName: string, tag: string): Promise<{ data: number[][]; tag: string }> => {
    return new Promise((resolve, reject) => {
      readXlsxFile(sheet, { sheet: sheetName })
        .then((rows) => {
          const dataArray: number[][] = [];
          for (let i = 1; i < rows.length; i++) {
            dataArray[i - 1] = [];
            for (let j = 1; j < rows[0].length; j++) {
              const cellValue = rows[i][j];
              if (typeof cellValue === "number") {
                dataArray[i - 1][j - 1] = cellValue;
              }
            }
          }
          resolve({ data: dataArray, tag });
        })
        .catch((error) => {
          console.error("Error reading sheet:", error);
          reject(error);
        });
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
              Please select the sheet containing the Fit Data and the sheet containing the Preference Data:
            </h3>
            {Object.entries(sheetNames).map(([fileName, names]) => (
              <div key={fileName} className="mb-4">
                <h4 className="text-lg font-semibold text-gray-700">{fileName}</h4>
                <ul>
                  {names.map((name, index) => (
                    <li key={index} className="mb-2 text-md text-gray-600">
                      {name}
                      <div className="inline-block ml-2">
                        <select
                          value={sheetTags[fileName][name]}
                          onChange={(e) => handleTagChange(fileName, name, e.target.value)}
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

        {projectOptions.length > 0 && (
          <div className="mb-4">
            <h3 className="mb-4 text-xl font-semibold text-gray-800">
              Select the projects that can handle multiple teams:
            </h3>
            <ul>
              {projectOptions.map((project, index) => (
                <li key={index} className="mb-2 text-md text-gray-600">
                  {project}
                  <input
                    type="checkbox"
                    checked={multiTeamProjects[project] || false}
                    onChange={(e) => handleMultiTeamChange(project, e.target.checked)}
                    className="ml-2"
                    disabled={processing}
                  />
                  <label className="ml-2">Can Take Multiple Teams</label>
                </li>
              ))}
            </ul>
          </div>
        )}

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
            disabled={processing || files.length === 0 || Object.keys(sheetNames).length === 0}
          >
            {processing ? "Processing..." : "Process Data"}
          </button>
        </div>

        {loadError && <p className="text-red-600 mt-4 text-center">{loadError}</p>}
      </div>
    </div>
  );
}

export default InputComponent;
