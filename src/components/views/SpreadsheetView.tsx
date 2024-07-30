import React, { useEffect, useState } from "react";
import { useCoreService } from "../../CoreServiceContext";
import { useNavigation } from "../../NavServiceContext";
import PairingDiv from "../Pairing";
import "./SpreadsheetView.css"; // Import the CSS file

function SpreadsheetView() {
  const coreService = useCoreService();
  const { navigate } = useNavigation();
  const [isModalShown, setIsModalShown] = useState<boolean>(false);
  const [spreadsheetData, setSpreadsheetData] = useState<number[][]>(
    coreService.get_b_values()
  );
  const [numTeams, setNumTeams] = useState<number>(coreService.get_num_teams());
  const [numProjects, setNumProjects] = useState<number>(
    coreService.get_num_projects()
  );
  const [modalTeam, setModalTeam] = useState<number>(0);
  const [modalProject, setModalProject] = useState<number>(0);

  useEffect(() => {
    const updateData = () => {
      setSpreadsheetData(coreService.get_b_values());
      setNumTeams(coreService.get_num_teams());
      setNumProjects(coreService.get_num_projects());
      console.log(spreadsheetData);
    };

    updateData();

    const listener = () => updateData();
    coreService.addListener(listener);

    return () => {
      coreService.removeListener(listener);
    };
  }, [coreService]);

  const handleCellClick = (team: number, project: number) => {
    console.log(team, project, coreService.get_pairing_data(team, project));
    setModalTeam(team);
    setModalProject(project);
    setIsModalShown(true);
  };

  return (
    <div className="spreadsheet-container">
      <table className="spreadsheet-table">
        <thead>
          <tr>
            <th className="sticky-header">Team/Project</th>
            {Array.from({ length: numProjects || 0 }, (_, projectIndex) => (
              <th key={projectIndex + 1} className="sticky-header">
                Project {projectIndex + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: numProjects }, (_, teamIndex) => (
            <tr key={teamIndex + 1}>
              <td className="sticky-cell">Team {teamIndex + 1}</td>
              {Array.from({ length: numTeams }, (_, projectIndex) => (
                <td
                  key={`${teamIndex + 1}-${projectIndex + 1}`}
                  style={{
                    backgroundColor: coreService.get_cell_color(
                      teamIndex + 1,
                      projectIndex + 1
                    ),
                  }}
                  onClick={() =>
                    handleCellClick(teamIndex + 1, projectIndex + 1)
                  }
                >
                  {spreadsheetData[teamIndex][projectIndex]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {isModalShown && (
        <div
          onClick={() => setIsModalShown(false)}
          className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
        >
          <div
            className="bg-white bg-opacity-100 rounded-lg shadow-lg w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            <PairingDiv
              team={modalTeam}
              project={modalProject}
              isShown={true}
              onToggle={() => {}}
            />
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-2xl"
              onClick={() => setIsModalShown(false)}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SpreadsheetView;
