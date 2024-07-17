import React, { useState, useEffect } from "react";
import { useCoreService } from "../../CoreServiceContext";
import { Pairing } from "../../interfaces";

function ListView() {
  const coreService = useCoreService();
  const [pairings, setPairings] = useState<Pairing[]>([]);

  useEffect(() => {
    loadPairings();
  }, []);

  const loadPairings = () => {
    let loadedPairings: Pairing[] = [];

    // Determine the maximum indices to iterate through
    const maxTeams = coreService.getNumTeams();
    const maxProjects = coreService.getNumProjects();

    // Loop through all possible pairings
    for (let team = 1; team <= maxTeams; team++) {
      for (let project = 1; project <= maxProjects; project++) {
        // Check if the pairing is allocated or rejected
        const pairingData = coreService.get_pairing_data(team, project);
        loadedPairings.push(pairingData);
        // if (coreService.is_pairing_allocated(team, project) || coreService.is_pairing_rejected(team, project)) {
        //   // Fetch pairing data
        //   const pairingData = coreService.get_pairing_data(team, project);
        //   loadedPairings.push(pairingData);
        // }
      }
    }
    setPairings(loadedPairings);
  };

  return (
    <div>
      <h1>List View</h1>
      <table className="table-auto">
        <thead>
          <tr>
            <th className="px-4 py-2">Team</th>
            <th className="px-4 py-2">Project</th>
            <th className="px-4 py-2">Fit Value</th>
            <th className="px-4 py-2">Preference Value</th>
            <th className="px-4 py-2">B Value</th>
            <th className="px-4 py-2">Fit Scalar</th>
            <th className="px-4 py-2">Pref Scalar</th>
          </tr>
        </thead>
        <tbody>
          {pairings.map((pairing, index) => (
            <tr key={index}>
              <td className="border px-4 py-2">{pairing.team}</td>
              <td className="border px-4 py-2">{pairing.project}</td>
              <td className="border px-4 py-2">{pairing.fit_value}</td>
              <td className="border px-4 py-2">{pairing.pref_value}</td>
              <td className="border px-4 py-2">{pairing.b_value}</td>
              <td className="border px-4 py-2">{pairing.fit_scalar}</td>
              <td className="border px-4 py-2">{pairing.pref_scalar}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ListView;
