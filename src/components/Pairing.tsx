import { useCoreService } from "../CoreServiceContext";
import { Pairing } from "../interfaces";

interface Props {
  team: number;
  project: number;
}

function PairingDiv(props: Props) {
  const coreService = useCoreService();
  const pairingData: Pairing = coreService.get_pairing_data(
    props.team,
    props.project
  );

  return (
    <div className="flex bg-grey-200">
      <div className="flex-1">Team: {props.team}</div>

      <div className="flex-1">{pairingData.b_value}</div>

      <div className="flex-1">Project: {props.project}</div>
    </div>
  );
}

export default PairingDiv;
