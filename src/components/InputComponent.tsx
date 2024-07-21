import { ChangeEvent, useState, useEffect } from "react";
import readXlsxFile, { readSheetNames } from "read-excel-file";
import { useCoreService } from "../CoreServiceContext";

interface Setup {
  fit_vals: number[][];
  pref_vals: number[][];
  num_teams_to_project: number[];
  sheet_tags?: { [key: string]: string };
}

interface SheetTags {
  [key: string]: string;
}

function InputComponent() {
  const [files, setFiles] = useState<File[]>([]);
  const [sheetNames, setSheetNames] = useState<{ [fileName: string]: string[] }>({});
  const [sheetTags, setSheetTags] = useState<{ [fileName: string]: SheetTags }>({});
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
      setSheetNames({});
      setSheetTags({});
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
          results.forEach(({ data, tag }) => {
            console.log(`Data for ${tag} sheet:`, data); 
            if (tag === "Fit") {
              fit.push(...data);
            } else if (tag === "Pref") {
              pref.push(...data);
            }
          });

          const setupParams: Setup = {
            fit_vals: fit,
            pref_vals: pref,
            num_teams_to_project: new Array(fit[0].length).fill(1),
            sheet_tags: Object.assign({}, ...Object.values(sheetTags)),
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

  const readFromExcelSheet = (
    sheet: File,
    sheetName: string,
    tag: string
  ): Promise<{ data: number[][]; tag: string }> => {
    return new Promise((resolve, reject) => {
      readXlsxFile(sheet, { sheet: sheetName })
        .then((rows) => {
          const dataArray: number[][] = [];
          for (let i = 1; i < rows.length; i++) {
            dataArray[i - 1] = [];
            for (let j = 1; j < rows[0].length; j++) {
              const cellValue = rows[i][j];
              if (typeof cellValue === "number") {
                dataArray[i - 1][j-1] = cellValue;
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
    <div className="bg-green-200 m-5 p-5">
      <input
        type="file"
        id="input"
        multiple
        onChange={handleFileChange}
        className="m-2"
        disabled={processing}
      />

      {Object.keys(sheetNames).length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3 style={{ marginBottom: "10px", fontSize: "24px" }}>
            Please select the sheet containing the Fit Data and the sheet
            containing the Preference Data:
          </h3>
          {Object.entries(sheetNames).map(([fileName, names]) => (
            <div key={fileName}>
              <h4>{fileName}</h4>
              <ul>
                {names.map((name, index) => (
                  <li key={index} style={{ marginBottom: "10px", fontSize: "18px" }}>
                    {name}
                    <div>
                      <select
                        value={sheetTags[fileName][name]}
                        onChange={(e) => handleTagChange(fileName, name, e.target.value)}
                        style={{ marginLeft: "10px" }}
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

      <button
        className="bg-blue-200 m-5 px-4 py-2 rounded-md"
        onClick={loadSheetNames}
        disabled={processing || files.length === 0}
      >
        {processing ? "Loading..." : "Load Sheets"}
      </button>

      <button
        className="bg-blue-200 m-5 px-4 py-2 rounded-md"
        onClick={loadData}
        disabled={
          processing ||
          files.length === 0 ||
          Object.keys(sheetNames).length === 0
        }
      >
        {processing ? "Processing..." : "Process Data"}
      </button>

      {loadError && <p className="text-red-500">{loadError}</p>}
    </div>
  );
}

export default InputComponent;
