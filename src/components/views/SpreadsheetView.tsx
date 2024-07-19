import { useState, useEffect } from "react";
import * as xlsx from "xlsx";
import { multiply, add } from "mathjs";

// TypeScript type definitions and interfaces
type SheetData = number[][];
type PreferencesMatrix = number[][];

interface Pairing {
  team: number;
  project: number;
  fit_value: number;
  pref_value: number;
  b_value: number;
  fit_scalar: number;
  pref_scalar: number;
}

interface MatchResults {
  teamMatches: Record<string, string>;
  totalScore: number;
}

// Function to read data from Excel sheet and convert to 2D array
const readSheet = (filePath: string, sheetName: string): SheetData => {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 }) as (
    | string
    | number
  )[][];

  // Remove header row and convert data to numbers
  return data.slice(1).map((row) => row.slice(1).map((cell) => Number(cell)));
};

// Merge three preference sheets into a single preferences matrix
const mergePreferences = (
  df: SheetData,
  db: SheetData,
  dg: SheetData
): PreferencesMatrix => {
  const combinedPreferences = add(df, db) as number[][];
  return multiply(combinedPreferences, dg) as PreferencesMatrix;
};

const SpreadsheetView = () => {
  // State variables to store data and manage selected pairing
  const [df, setDf] = useState<SheetData>([]);
  const [db, setDb] = useState<SheetData>([]);
  const [dg, setDg] = useState<SheetData>([]);
  const [combinedPreferences, setCombinedPreferences] =
    useState<PreferencesMatrix>([]);
  const [selectedPairing, setSelectedPairing] = useState<Pairing | null>(null);

  // useEffect hook to load data on component mount
  useEffect(() => {
    const dfData = readSheet("../../tests/Sample1.xlsx", "Sheet1");
    const dbData = readSheet("Book1.xlsx", "Sheet2");
    const dgData = readSheet("Book1.xlsx", "Sheet3");

    // Update state with data from Excel sheets and merged preferences
    setDf(dfData);
    setDb(dbData);
    setDg(dgData);
    setCombinedPreferences(mergePreferences(dfData, dbData, dgData));
  }, []); // Empty dependency array ensures useEffect runs only once on mount

  // Function to handle click events on table cells
  const handleClick = (teamIndex: number, projectIndex: number) => {
    // Prepare pairing data based on clicked cell coordinates
    const pairingData: Pairing = {
      team: teamIndex,
      project: projectIndex,
      fit_value: df[teamIndex][projectIndex],
      pref_value: db[teamIndex][projectIndex],
      b_value: combinedPreferences[teamIndex][projectIndex],
      fit_scalar: dg[teamIndex][projectIndex],
      pref_scalar: dg[teamIndex][projectIndex],
    };
    setSelectedPairing(pairingData); // Update selectedPairing state with the clicked pairing data
  };

  return (
    <div>
      <h1>Spreadsheet View</h1>
      <table className="table-auto border-collapse border border-gray-400">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Team/Project</th>
            {/* Render table header based on number of projects */}
            {Array.from(
              { length: combinedPreferences[0]?.length || 0 },
              (_, i) => (
                <th
                  key={i}
                  className="border border-gray-300 px-4 py-2"
                >{`Project ${i + 1}`}</th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {/* Render table rows and cells based on data */}
          {combinedPreferences.map((row, teamIndex) => (
            <tr key={teamIndex}>
              <td className="border border-gray-300 px-4 py-2">{`Team ${
                teamIndex + 1
              }`}</td>
              {row.map((cell, projectIndex) => (
                <td
                  key={projectIndex}
                  className="border border-gray-300 px-4 py-2 cursor-pointer"
                  onClick={() => handleClick(teamIndex, projectIndex)}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Render selected pairing details if a pairing is selected */}
      {selectedPairing && (
        <div className="mt-4">
          <h2>Selected Pairing Details</h2>
          <p>Team: {selectedPairing.team + 1}</p>
          <p>Project: {selectedPairing.project + 1}</p>
          <p>Fit Value: {selectedPairing.fit_value}</p>
          <p>Preference Value: {selectedPairing.pref_value}</p>
          <p>B Value: {selectedPairing.b_value}</p>
          <p>Fit Scalar: {selectedPairing.fit_scalar}</p>
          <p>Pref Scalar: {selectedPairing.pref_scalar}</p>
        </div>
      )}
    </div>
  );
};

export default SpreadsheetView;
