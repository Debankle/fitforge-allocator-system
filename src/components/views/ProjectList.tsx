import React, { useEffect, useState } from "react";
import PageNav from "./PageNav";
import { useCoreService } from "../../CoreServiceContext";
import ListView from "./ListView";

interface Props {
  team: number;
}

const ProjectList: React.FC<Props> = (props) => {
  const coreService = useCoreService();
  const [team, setTeam] = useState<number>(props.team);
  const [pairings, setPairings] = useState<number[][]>([]);

  const numTeams = coreService.get_num_teams();
  const numProjects = coreService.get_num_projects();
  const itemsPerPage = 12;

  useEffect(() => {
    const newPairings: number[][] = [];
    for (let i = 1; i <= numProjects; i++) {
      newPairings.push([team, i]);
    }
    setPairings(newPairings);
  }, [team, numProjects]);

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

      <ListView pairings={pairings} title={`Pairings for team ${team}`} sortBy={"project"} />

        {/*}
      <PageNav
        title={`Pairings for team ${team}`}
        pairings={pairings}
        itemsPerPage={itemsPerPage}
      />
      {*/}
    </div>
  );
};

export default ProjectList;
