import { useCoreService } from "../CoreServiceContext";
import { Pairing } from "../interfaces";
import { useState } from "react";

interface Props {
  team: number;
  project: number;
}

function PairingDiv(props: Props) {
  const coreService = useCoreService();
  const [expandedViewState, changeExpandedViewState] = useState<boolean>(false);
  const [hover, setHover] = useState<boolean>(false);
  const [isAllocated, setIsAllocated] = useState<boolean>(
    coreService.is_pairing_allocated(props.team, props.project)
  );
  const [isRejected, setIsRejected] = useState<boolean>(
    coreService.is_pairing_rejected(props.team, props.project)
  );
  const pairingData: Pairing = coreService.get_pairing_data(
    props.team,
    props.project
  );
  const bgColor: string = coreService.get_bg_color(pairingData.b_value);

  const allocatedCheckmarkChange = () => {};

  const rejectedCheckmarkChange = () => {};

  const expandView = () => {
    changeExpandedViewState(!expandedViewState);
  };

  const toggleHover = () => {
    setHover(!hover);
  };

  const teamList = () => {
    console.log("Load team list for project " + props.project);
  };

  const projectList = () => {
    console.log("Load project list for team " + props.team);
  };

  var styleSheet: any;
  if (hover) {
    styleSheet = { backgroundColor: "rgba(" + bgColor + "0.5)" };
  } else {
    styleSheet = { backgroundColor: "rgba(" + bgColor + "1)" };
  }

  return (
    <div
      className="flex flex-col"
      style={styleSheet}
      onMouseEnter={toggleHover}
      onMouseLeave={toggleHover}
    >
      <div className="flex" onClick={expandView}>
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-xl font-bold">Team:</div>
          <div className="text-2xl">{props.team}</div>
        </div>
        <div className="flex-1 flex flex-col items-center">
          <div className="grid grid-cols-2 gap-4 w-full text-center">
            <div>
              <div className="font-bold">Fit Value:</div>
              <div>{pairingData.fit_value}</div>
            </div>
            <div>
              <div className="font-bold">Fit Scalar:</div>
              <div>{pairingData.fit_scalar}</div>
            </div>
            <div>
              <div className="font-bold">Pref Value:</div>
              <div>{pairingData.pref_value}</div>
            </div>
            <div>
              <div className="font-bold">Pref Scalar:</div>
              <div>{pairingData.pref_scalar}</div>
            </div>
          </div>
          <div className="mt-2 w-full text-center">
            <div className="font-bold">B Value:</div>
            <div>{pairingData.b_value}</div>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center items-end text-right">
          <div className="text-xl font-bold">Project:</div>
          <div className="text-2xl">{props.project}</div>
        </div>
      </div>
      {expandedViewState && (
        <div className="mt-4">
          <div className="text-center text-lg">
            <label className="text-white" htmlFor="allocatedCheckmark">
              Allocate:
            </label>
            <input
              id="allocatedCheckmark"
              type="checkbox"
              checked={isAllocated}
              onChange={allocatedCheckmarkChange}
            ></input>

            <label className="text-white" htmlFor="rejectedCheckmark">
              Reject:
            </label>
            <input
              id="rejectedCheckmark"
              type="checkbox"
              checked={isRejected}
              onChange={rejectedCheckmarkChange}
            ></input>

            <button
              className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-700"
              onClick={teamList}
            >
              All team pairings for this project
            </button>
            <button
              className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-700"
              onClick={projectList}
            >
              All project pairings for this team
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default PairingDiv;
