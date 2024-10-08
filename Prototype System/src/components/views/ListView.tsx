import React, { useEffect, useState } from "react";
import { Pairing } from "../../interfaces";
import PairingDiv from "../Pairing";
import { useCoreService } from "../../CoreServiceContext";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";

interface ListProps {
  title: string;
  pairings: number[][];
  sortBy: keyof Pairing;
  itemsPerPage: number;
}

function ListView(props: ListProps) {
  const coreService = useCoreService();
  const [pairingData, setPairingData] = useState<Pairing[]>([]);
  const [sortProperty, setSortProperty] = useState<keyof Pairing>(props.sortBy);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [expandedIndex, setExpandedIndex] = useState<number[]>([]);
  const [activePage, setActivePage] = useState<number>(0);
  const [badTeams, setBadTeams] = useState<boolean>(false);
  const [badProjects, setBadProjects] = useState<boolean>(false);
  const itemsPerPage = props.itemsPerPage;

  useEffect(() => {
    const fetchData = async () => {
      const data = await Promise.all(
        props.pairings.map(async ([team, project]) => {
          const pairing = await coreService.get_pairing_data(team, project);
          return { ...pairing, team, project };
        })
      );
      setPairingData(data);
    };

    fetchData();
  }, [props.pairings]);

  const filteredPairingData = pairingData.filter(({ team, project }) => {
    const teamAllocated = coreService.does_team_have_allocation(team);
    const projectAllocated = coreService.does_project_have_allocation(project);

    if (badTeams && badProjects) {
      return !teamAllocated && !projectAllocated;
    } else if (badTeams) {
      return !teamAllocated;
    } else if (badProjects) {
      return !projectAllocated;
    } else {
      return true;
    }
  });

  const sortedPairingData = [...filteredPairingData].sort((a, b) => {
    const compareA = a[sortProperty];
    const compareB = b[sortProperty];
    if (compareA < compareB) return sortOrder === "asc" ? -1 : 1;
    if (compareA > compareB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedPairingData.length / itemsPerPage);
  const paginatedData = sortedPairingData.slice(
    activePage * itemsPerPage,
    (activePage + 1) * itemsPerPage
  );

  const handleToggle = (index: number) => {
    setExpandedIndex((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div>
      <label>Sort by:</label>
      <select
        value={sortProperty}
        onChange={(e) => setSortProperty(e.target.value as keyof Pairing)}
      >
        <option value="impact">Impact</option>
        <option value="capability">Capability</option>
        <option value="preference">Preference</option>
        <option value="team">Team</option>
        <option value="project">Project</option>
        <option value="b_value">B Value</option>
      </select>
      <label>-</label>
      <select onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}>
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
      <input
        type="checkbox"
        checked={badTeams}
        onChange={() => setBadTeams(!badTeams)}
      ></input>
      <label>Show Remaining Teams Only</label>
      <input
        type="checkbox"
        checked={badProjects}
        onChange={() => setBadProjects(!badProjects)}
      ></input>
      <label>Show Remaining Projects Only</label>

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedData.map((pairing, index) => (
                <div
                  key={`${pairing.team}-${pairing.project}`}
                  className={`bg-white p-1 border rounded shadow ${
                    expandedIndex.includes(index) ? "expanded" : ""
                  }`}
                  onClick={() => handleToggle(index)}
                >
                  <PairingDiv
                    team={pairing.team}
                    project={pairing.project}
                    onToggle={() => handleToggle(index)}
                  />
                </div>
              ))}
            </div>
          </TabPanel>
        ))}
      </Tabs>
    </div>
  );
}

export default ListView;
