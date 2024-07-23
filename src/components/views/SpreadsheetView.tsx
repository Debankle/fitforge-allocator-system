import { useState } from "react";
import CoreService from "../../CoreService";
import { Pairing } from "../../interfaces";
import { useCoreService } from "../../CoreServiceContext";
import { useNavigation } from "../../NavServiceContext";
import PairingDiv from "../Pairing";
import { mod } from "mathjs";

function SpreadsheetView() {
  const coreService = useCoreService();
  const { navigate } = useNavigation();
  const [displayType, setDisplayType] = useState<
    "Numbers" | "Colours" | "Both" | "Assigned"
  >("Numbers");
  const [isModalShown, setIsModalShown] = useState<boolean>(false);
  const numTeams = coreService.get_num_teams();
  const numProjects = coreService.get_num_projects();
  const [modalTeam, setModalTeam] = useState<number>(0);
  const [modalProject, setModalProject] = useState<number>(0);

  const handelCellClick = (team: number, project: number) => {
    console.log(team, project, coreService.get_pairing_data(team, project));
    setModalTeam(team);
    setModalProject(project);
    setIsModalShown(true);
  };

  return (
    <div className="relative">
      <div>
        <h1>Options for searching somehow i guess</h1>
        <label>TODO:</label>
        <ul>
          <li>view options</li>
          <li>Hover on row and column</li>
          <li>colours on cells</li>
          <li>fix left and top to side and only scroll data cells</li>
          <li>Navigate to specific row/col/cell</li>
        </ul>
      </div>
      <div className="relative overflow-auto max-w-full max-h-full">
        <table className="table-auto border-collapse border border-gray-400 min-w-full">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2 sticky top-0 bg-white z-10 left-0">
                Team/Project
              </th>
              {/* Render table header based on number of projects */}
              {Array.from({ length: numProjects || 0 }, (_, projectIndex) => (
                <th
                  key={projectIndex + 1}
                  className="border border-gray-300 px-4 py-2 sticky top-0 bg-white"
                >
                  Project {projectIndex + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Render table rows and cells based on data */}
            {Array.from({ length: numTeams }, (_, teamIndex) => (
              <tr key={teamIndex + 1}>
                <td className="border border-gray-300 px-4 py-2 sticky left-0 bg-white z-10">
                  Team {teamIndex + 1}
                </td>
                {Array.from({ length: numProjects }, (_, projectIndex) => (
                  <td
                    className="border border-gray-300 px-4 py-2 cursor-pointer"
                    style={{
                      backgroundColor: coreService.get_cell_color(
                        teamIndex + 1,
                        projectIndex + 1
                      ),
                    }}
                    key={projectIndex + 1}
                    onClick={() =>
                      handelCellClick(teamIndex + 1, projectIndex + 1)
                    }
                  >
                    {coreService.get_b_value(teamIndex + 1, projectIndex + 1)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalShown && (
        <div
          onClick={() => setIsModalShown(false)}
          className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
        >
          <div
            className="bg-white bg-opacity-100 rounded-lg shadow-ld w-full max-w-md relative"
            onClick={(e) => e.stopPropagation()}
          >
            <PairingDiv
              team={modalTeam}
              project={modalProject}
              isShown={true}
              onToggle={() => {}}
            />
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-2x1"
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
