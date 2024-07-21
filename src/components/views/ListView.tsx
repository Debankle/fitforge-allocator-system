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

  return (
    <div>
      <label>Sort by:</label>
      <select
        value={sortProperty}
        onChange={(e) => setSortProperty(e.target.value as keyof Pairing)}
      >
        <option value="fit_value">Fit Value</option>
        <option value="pref_value">Preference Value</option>
        <option value="fit_scalar">Fit Scalar</option>
        <option value="pref_scalar">Preference Scalar</option>
        <option value="b_value">B Value</option>
        <option value="team">Team</option>
        <option value="project">Project</option>
      </select>
      <label>-</label>
      <select onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}>
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>

      <table className="table-auto">
        <thead>
          <tr>
            <th className="px-4 py-2">{props.title}</th>
          </tr>
        </thead>
        <tbody>
          {sortedPairingData.map((pairing) => (
            <tr key={`${pairing.team}-${pairing.project}`}>
              <td>
                <PairingDiv team={pairing.team} project={pairing.project} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ListView;
