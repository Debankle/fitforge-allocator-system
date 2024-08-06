import { useEffect, useState } from "react";
import { useCoreService } from "../../CoreServiceContext";

function TeamsToProjects() {
  const coreService = useCoreService();
  const [numTeamsToProjects, setNumTeamsToProjects] = useState<number[]>(
    coreService.get_num_teams_to_projects()
  );

  useEffect(() => {
    const updateData = () => {
      setNumTeamsToProjects(coreService.get_num_teams_to_projects());
    };

    updateData();

    const listener = () => updateData();

    coreService.addListener(listener);

    return () => {
      coreService.removeListener(listener);
    };
  }, [coreService]);

  const handleNumTeamsChange = (index: number, value: number) => {
    const newNumTeams = [...numTeamsToProjects];
    newNumTeams[index] = value;
    coreService.set_num_teams_to_project(value, index + 1);
    setNumTeamsToProjects(newNumTeams);
  };

  return (
    <div className="bg-[#cdd1d8] min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl w-full">
        {numTeamsToProjects && (
          <>
            <h3 className="mb-4 text-xl font-semibold text-gray-800">
              Set the maximum number of teams for each project:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {numTeamsToProjects.map((numTeams, index) => (
                <div key={index} className="flex flex-col">
                  <span className="mb-2 text-md text-gray-600">
                    Project {index + 1}
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={numTeams}
                    onChange={(e) =>
                      handleNumTeamsChange(index, parseInt(e.target.value, 10))
                    }
                    className="p-2 border border-gray-300 rounded"
                  />
                  <label className="ml-2">Max Teams</label>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default TeamsToProjects;
