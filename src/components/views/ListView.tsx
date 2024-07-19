import { Pairing } from "../../interfaces";
import { useState } from "react";
import PairingDiv from "../Pairing";

interface ListProps {
  pairings: number[][];
}

function ListView(props: ListProps) {
  return (
    <div>

      <table className="table-auto">
        <thead>
          <tr>
            <th className="px-4 py-2">Pairints</th>
          </tr>
        </thead>
        <tbody>
          {props.pairings.map((pairing, index) => (
            <PairingDiv key={index} team={pairing[0]} project={pairing[1]} />
            // <tr key={index}>
            //   <td className="border px-4 py-2">{pairing.team}</td>
            //   <td className="border px-4 py-2">{pairing.project}</td>
            //   <td className="border px-4 py-2">{pairing.fit_value}</td>
            //   <td className="border px-4 py-2">{pairing.pref_value}</td>
            //   <td className="border px-4 py-2">{pairing.b_value}</td>
            //   <td className="border px-4 py-2">{pairing.fit_scalar}</td>
            //   <td className="border px-4 py-2">{pairing.pref_scalar}</td>
            // </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ListView;
