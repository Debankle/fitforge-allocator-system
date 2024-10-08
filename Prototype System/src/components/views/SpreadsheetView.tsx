import React, { useEffect, useRef, useState } from "react";
import { useCoreService } from "../../CoreServiceContext";
import PairingDiv from "../Pairing";
import "./SpreadsheetView.css"; // Import the CSS file
import { useNavigation } from "../../NavServiceContext";

function SpreadsheetView({ team = 1, project = 1 }) {
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

  const cellRefs = useRef<Map<string, HTMLTableCellElement>>(new Map());

  useEffect(() => {
    const updateData = () => {
      setSpreadsheetData([...coreService.get_b_values()]);
      setNumTeams(coreService.get_num_teams());
      setNumProjects(coreService.get_num_projects());
    };

    updateData();

    const listener = () => updateData();
    coreService.addListener(listener);

    return () => {
      coreService.removeListener(listener);
    };
  }, [coreService]);

  const handleCellClick = (team: number, project: number) => {
    setModalTeam(team);
    setModalProject(project);
    setIsModalShown(true);
  };

  const formatNumber = (value: any = -1, decimals = 6) => {
    return value === -1 ? "-" : value.toFixed(decimals);
  };

  const scrollToCell = (teamIndex: number, projectIndex: number) => {
    const cellKey = `${teamIndex + 1}-${projectIndex + 1}`;
    const cellElement = cellRefs.current.get(cellKey);
    if (cellElement) {
      cellElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  scrollToCell(team, project);

  return (
    <div className="spreadsheet-container">
      <table className="spreadsheet-table">
        <thead>
          <tr>
            <th className="sticky-header">Team/Project</th>
            {Array.from({ length: numProjects || 0 }, (_, projectIndex) => (
              <th
                key={projectIndex + 1}
                className="sticky-header"
                onClick={() =>
                  navigate({
                    page: "TeamList",
                    data: { project: projectIndex + 1 },
                  })
                }
              >
                {coreService.get_project_name(projectIndex + 1)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: numTeams }, (_, teamIndex) => (
            <tr key={teamIndex + 1}>
              <td
                className="sticky-cell"
                onClick={() =>
                  navigate({
                    page: "ProjectList",
                    data: { team: teamIndex + 1 },
                  })
                }
              >
                {coreService.get_team_name(teamIndex + 1)}
              </td>
              {Array.from({ length: numProjects }, (_, projectIndex) => {
                const cellKey = `${teamIndex + 1}-${projectIndex + 1}`;
                return (
                  <td
                    key={cellKey}
                    ref={(el) => {
                      if (el) cellRefs.current.set(cellKey, el);
                    }}
                    style={{
                      backgroundColor: coreService.get_cell_bg_colour(
                        teamIndex + 1,
                        projectIndex + 1
                      ),
                    }}
                    onClick={() =>
                      handleCellClick(teamIndex + 1, projectIndex + 1)
                    }
                  >
                    {formatNumber(spreadsheetData[teamIndex][projectIndex])}
                  </td>
                );
              })}
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
