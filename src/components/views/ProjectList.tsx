import React, { useEffect, useState } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import ListView from "./ListView";
import { useCoreService } from "../../CoreServiceContext";

interface Props {
  team: number;
}

const ProjectList = (props: Props) => {
  const coreService = useCoreService();
  const [team, setTeam] = useState<number>(props.team);
  const [pairings, setPairings] = useState<number[][]>([]);
  const [activePage, setActivePage] = useState<number>(0);

  const numTeams = coreService.get_num_teams();
  const numProjects = coreService.get_num_projects();
  const itemsPerPage = 10; //-------------------------NUMBER OF ITEMS-----------------------------------------------
  useEffect(() => {
    const newPairings: number[][] = [];
    for (let i = 1; i <= numProjects; i++) {
      newPairings.push([team, i]);
    }
    setPairings(newPairings);
  }, [team, numProjects]);

  const totalPages = Math.ceil(pairings.length / itemsPerPage);

  const paginatedData = pairings.slice(
    activePage * itemsPerPage,
    (activePage + 1) * itemsPerPage
  );

  const handleTeamChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTeam(parseInt(event.target.value));
    setActivePage(0);
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

      <Tabs
        selectedIndex={activePage}
        onSelect={(index) => setActivePage(index)}
      >
        <TabList>
          {Array.from({ length: totalPages }, (_, index) => (
            <Tab key={index}>Page {index + 1}</Tab>
          ))}
        </TabList>

        {Array.from({ length: totalPages }, (_, index) => (
          <TabPanel key={index}>
            <ListView
              title={`Pairings for team ${team}`}
              pairings={paginatedData}
            />
          </TabPanel>
        ))}
      </Tabs>
    </div>
  );
};

export default ProjectList;
