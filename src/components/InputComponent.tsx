import React, { ChangeEvent, useState, useEffect } from "react";
import readXlsxFile from "read-excel-file";
import * as XLSX from "xlsx";
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
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [sheetTags, setSheetTags] = useState<SheetTags>({});
  const [processing, setProcessing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const coreService = useCoreService();

  useEffect(() => {
    setSheetNames([]);
    setSheetTags({});
  }, [files]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
      setSheetNames([]);
      setSheetTags({});
      setLoadError(null);
    }
  };

  const loadSheetNames = () => {
    if (files.length !== 0) {
      const sheet = files[0];
      const reader = new FileReader();
      reader.onload = (event: ProgressEvent<FileReader>) => {
        if (event.target) {
          const data = event.target.result;
          const wb = XLSX.read(data, { type: "binary" });
          const sheetNamesArray: string[] = wb.SheetNames;
          setSheetNames(sheetNamesArray);
          const initialTags: SheetTags = {};
          sheetNamesArray.forEach((name) => {
            initialTags[name] = "";
          });
          setSheetTags(initialTags);
        }
      };
      reader.readAsBinaryString(sheet);
    }
  };

  const handleTagChange = (sheetName: string, tag: string) => {
    setSheetTags({ ...sheetTags, [sheetName]: tag });
  };

  const loadData = () => {
    if (files.length !== 0) {
      setProcessing(true);
      const sheet = files[0];
      const promises: Promise<{ data: number[][]; tag: string }>[] = [];
      const fit: number[][] = [];
      const pref: number[][] = [];
      const n: number[] = [];

      sheetNames.forEach((sheetName, index) => {
        if (sheetTags[sheetName] === "Fit" || sheetTags[sheetName] === "Pref") {
          // Adjust the index for 1-based indexing
          promises.push(readFromExcelSheet(sheet, index + 1, sheetTags[sheetName]));
        }
      });

      Promise.all(promises)
        .then((results) => {
          results.forEach(({ data, tag }) => {
            console.log(`Data for ${tag} sheet:`, data); // Added for debugging
            if (tag === "Fit") {
              fit.push(...data);
              n.push(data.length);
            } else if (tag === "Pref") {
              pref.push(...data);
            }
          });

          const setupParams: Setup = {
            fit_vals: fit,
            pref_vals: pref,
            num_teams_to_project: n,
            sheet_tags: sheetTags,
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
    sheetIndex: number,
    tag: string
  ): Promise<{ data: number[][]; tag: string }> => {
    return new Promise((resolve, reject) => {
      readXlsxFile(sheet, { sheet: sheetIndex })
        .then((data) => {
          const dataArray: number[][] = [];
          for (let i = 1; i < data.length; i++) {
            dataArray[i - 1] = [];
            for (let j = 0; j < data[0].length; j++) {
              const cellValue = data[i][j];
              if (typeof cellValue === "number") {
                dataArray[i - 1][j] = cellValue;
              } else {
                dataArray[i - 1][j] = Number(cellValue) || 0; // Ensure cell values are numbers
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

      {sheetNames.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3 style={{ marginBottom: "10px", fontSize: "24px" }}>
            Please select the sheet containing the Fit Data and the sheet
            containing the Preference Data:
          </h3>
          <ul>
            {sheetNames.map((name, index) => (
              <li key={index} style={{ marginBottom: "10px", fontSize: "18px" }}>
                {name}
                <div>
                  <select
                    value={sheetTags[name]}
                    onChange={(e) => handleTagChange(name, e.target.value)}
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
        disabled={processing || files.length === 0 || sheetNames.length === 0}
      >
        {processing ? "Processing..." : "Process Data"}
      </button>

      {loadError && <p className="text-red-500">{loadError}</p>}
    </div>
  );
}

export default InputComponent;
