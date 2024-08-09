import { useEffect, useState } from "react";
import { useCoreService } from "../../CoreServiceContext";
import ListView from "./ListView";

function FullList() {
  const coreService = useCoreService();
  const [pairings, setPairings] = useState<number[][]>([]);

  useEffect(() => {
    const numTeams = coreService.get_num_teams();
    const numProjects = coreService.get_num_projects();
    const pairings = [];

    for (let i = 0; i < numTeams; i++) {
      for (let j = 0; j < numProjects; j++) {
        pairings.push([i + 1, j + 1]);
      }
    }
    setPairings(pairings);
  });

  return (
    <div>
      <ListView title={"All Pairings"} pairings={pairings} sortBy="b_value" itemsPerPage={99999} />
    </div>
  );
}

export default FullList;