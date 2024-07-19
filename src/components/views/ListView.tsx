import PairingDiv from "../Pairing";

interface ListProps {
  title: string;
  pairings: number[][];
}

function ListView(props: ListProps) {
  return (
    <div>
      <table className="table-auto">
        <thead>
          <tr>
            <th className="px-4 py-2">{props.title}</th>
          </tr>
        </thead>
        <tbody>
          {props.pairings.map((pairing, index) => (
            <tr key={index}>
              <td>
                <PairingDiv
                  key={index}
                  team={pairing[0]}
                  project={pairing[1]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ListView;
