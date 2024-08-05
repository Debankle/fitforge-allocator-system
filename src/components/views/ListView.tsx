import { useEffect, useState } from "react";
import { Pairing } from "../../interfaces";
import PairingDiv from "../Pairing";
import { useCoreService } from "../../CoreServiceContext";

interface ListProps {
  title: string;
  pairings: number[][];
}

function ListView(props: ListProps) {
  const coreService = useCoreService();
  const [pairingData, setPairingData] = useState<Pairing[]>([]);
  const [sortProperty, setSortProperty] = useState<keyof Pairing>("team");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [expandedIndex, setExpandedIndex] = useState<number[]>([]);

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

  const sortedPairingData = [...pairingData].sort((a, b) => {
    const compareA = a[sortProperty];
    const compareB = b[sortProperty];
    if (compareA < compareB) return sortOrder === "asc" ? -1 : 1;
    if (compareA > compareB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

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
        <option value="fit_value">Fit Value</option>
        <option value="pref_value">Preference Value</option>
        <option value="b_value">B Value</option>
        <option value="team">Team</option>
        <option value="project">Project</option>
        <option value="fit_scalar">Fit Scalar</option>
        <option value="pref_scalar">Preference Scalar</option>
        <option value="fit_scalar">Fit Scalar</option>
        <option value="pref_scalar">Preference Scalar</option>
      </select>
      <label>-</label>
      <select onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}>
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedPairingData.map((pairing, index) => (
          <div
            key={`${pairing.team}-${pairing.project}`}
            className={`bg-white p-1 border rounded shadow ${expandedIndex.includes(index) ? "expanded" : ""}`}
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
    </div>
  );
}

export default ListView;
