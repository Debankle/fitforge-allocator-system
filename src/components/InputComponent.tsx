import { ChangeEvent, useState } from "react";
import { useCoreService } from "../CoreServiceContext";
import readXlsxFile from "read-excel-file";
import { Setup } from "../interfaces";

function InputComponent() {
  const [files, setFiles] = useState<File[]>([]);
  const coreService = useCoreService();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(selectedFiles);
    }
  };

  const readFromExcelSheet = (
    sheet: File,
    sheetIndex: number
  ): Promise<number[][]> => {
    return new Promise((resolve, reject) => {
      readXlsxFile(sheet, { sheet: sheetIndex })
        .then((data) => {
          let dataArray: number[][] = [];
          for (let i = 1; i < data.length; i++) {
            dataArray[i - 1] = [];
            for (let j = 1; j < data[0].length; j++) {
              const cellValue = data[i][j];
              if (typeof cellValue === "number") {
                dataArray[i - 1][j - 1] = cellValue;
              }
            }
          }
          resolve(dataArray);
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  };

  // NOTE: this is assuming only one file is uploaded, with two sheets fit then preference
  // and it can be read in the format. This will need a full reworking in the future
  // TODO: update this to read from selected sheets and files
  // TODO: ask for number of teams for projects
  const loadData = () => {
    if (files.length != 0) {
      const sheet = files[0];
      let fit: number[][] = [];
      let pref: number[][] = [];
      const promises: Promise<number[][]>[] = [
        readFromExcelSheet(sheet, 1),
        readFromExcelSheet(sheet, 2),
      ];
      Promise.all(promises).then((results) => {
        fit = results[0];
        pref = results[1];
        const n = Array(fit.length).fill(1);
        const setupParams: Setup = {
          fit_vals: fit,
          pref_vals: pref,
          num_teams_to_project: n,
        };
        coreService.initialise_values(setupParams);
        coreService.run_algorithm("ILP");
      });
    }
  };

  return (
    <div className="bg-green-200 m-5">
      <input
        type="file"
        id="input"
        multiple
        onChange={handleFileChange}
        className="m-2"
      ></input>

      {files.map((file, index) => (
        <h4 key={index}>{file.name}</h4>
      ))}

      <button className="bg-blue-200 m-5" onClick={loadData}>
        Click me
      </button>
    </div>
  );
}

export default InputComponent;
