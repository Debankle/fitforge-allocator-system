import { useEffect, useState } from "react";
import ListView from "./ListView";
import { useCoreService } from "../../CoreServiceContext";

interface Props {
  team: number;
}

function ProjectList(props: Props) {
  const coreService = useCoreService();
  const [team, setTeam] = useState<number>(props.team);
  const [pairings, setPairings] = useState<number[][]>([]);
  const numTeams = coreService.get_num_teams();
  const numProjects = coreService.get_num_projects();

  useEffect(() => {
    const newPairings: number[][] = [];
    for (let i = 1; i <= numProjects; i++) {
      newPairings.push([team, i]);
    }
    setPairings(newPairings);
  }, [team]);

  const handleTeamChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTeam(parseInt(event.target.value));
  };

  return (
    <div>
      <label htmlFor="team-select">Team:</label>
      <select id="team-select" value={team} onChange={handleTeamChange}>
        {Array.from({ length: numTeams }, (_, index) => (
          <option key={index + 1} value={index + 1}>
            Team {index + 1}
          </option>
        ))}
      </select>

      <ListView title={"Pairings for team" + team} pairings={pairings} />
    </div>
  );
}

export default ProjectList;
