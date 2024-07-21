import { useCoreService } from "../../CoreServiceContext";
import { useEffect, useState } from "react";
import ListView from "./ListView";
interface Props {
  project: number;
}

function TeamList(props: Props) {
  const coreService = useCoreService();
  const [project, setProject] = useState<number>(props.project);
  const [pairings, setPairings] = useState<number[][]>([]);
  const numTeams = coreService.get_num_teams();
  const numProjects = coreService.get_num_projects();

  useEffect(() => {
    const newPairings: number[][] = [];
    for (let i = 1; i <= numTeams; i++) {
      newPairings.push([i, project]);
    }
    setPairings(newPairings);
  }, [project]);

  const handleProjectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setProject(parseInt(event.target.value));
  };

  return (
    <div>
      <label htmlFor="project-select">Team:</label>
      <select
        id="project-select"
        value={project}
        onChange={handleProjectChange}
      >
        {Array.from({ length: numProjects }, (_, index) => (
          <option key={index + 1} value={index + 1}>
            Project {index + 1}
          </option>
        ))}
      </select>


      <ListView title={"Pairings for project " + project} pairings={pairings} />
    </div>
  );
}

export default TeamList;
