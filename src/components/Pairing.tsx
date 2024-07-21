import { useCoreService } from "../CoreServiceContext";
import { Pairing } from "../interfaces";
import { useId, useState } from "react";

interface Props {
  team: number;
  project: number;
}

function PairingDiv(props: Props) {
  const coreService = useCoreService();
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
  const allocatedCheckmark = useId();
  const rejectedCheckmark = useId();

  const allocatedCheckmarkChange = () => {
    if (isRejected) {
      coreService.remove_rejection(props.team, props.project);
      coreService.set_allocation(props.team, props.project);
      setIsRejected(false);
      setIsAllocated(true);
    } else if (isAllocated) {
      coreService.remove_allocation(props.team, props.project);
      setIsAllocated(false);
    } else {
      coreService.set_allocation(props.team, props.project);
      setIsAllocated(true);
    }
  };

  const rejectedCheckmarkChange = () => {
    if (isAllocated) {
      coreService.remove_allocation(props.team, props.project);
      coreService.set_rejection(props.team, props.project);
      setIsAllocated(false);
      setIsRejected(true);
    } else if (isRejected) {
      coreService.remove_rejection(props.team, props.project);
      setIsRejected(false);
    } else {
      coreService.set_rejection(props.team, props.project);
      setIsRejected(true);
    }
  };

  const toggleHover = () => {
    setHover(!hover);
  };

  const teamList = () => {
    console.log("Load project pairings for team " + props.team);
  };

  const projectList = () => {
    console.log("Load team pairings for project " + props.project);
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
      <div className="flex">
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-xl font-bold">Team:</div>
          <div className="text-2xl">{props.team}</div>
          <button
            className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-700"
            onClick={teamList}
          >
            Team {props.team} project list
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center">
          <div className="grid grid-cols-2 gap-4 w-full text-center">
            <div>
              <div className="font-bold">Fit Value:</div>
              <div>
                {pairingData.fit_value == -1 ? "-" : pairingData.fit_value}
              </div>
            </div>
            <div>
              <div className="font-bold">Fit Scalar:</div>
              <div>
                {pairingData.fit_scalar == -1 ? "-" : pairingData.fit_scalar}
              </div>
            </div>
            <div>
              <div className="font-bold">Pref Value:</div>
              <div>
                {pairingData.pref_value == -1 ? "-" : pairingData.pref_value}
              </div>
            </div>
            <div>
              <div className="font-bold">Pref Scalar:</div>
              <div>
                {pairingData.pref_scalar == -1 ? "-" : pairingData.pref_scalar}
              </div>
            </div>
          </div>
          <div className="mt-2 w-full text-center">
            <div className="font-bold">B Value:</div>
            <div>{pairingData.b_value == -1 ? "-" : pairingData.b_value}</div>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full text-center">
            <div>
              <label className="text-white" htmlFor={allocatedCheckmark}>
                Allocate:
              </label>
              <input
                id={allocatedCheckmark}
                type="checkbox"
                checked={isAllocated}
                onChange={allocatedCheckmarkChange}
              ></input>
            </div>
            <div>
              <label className="text-white" htmlFor={rejectedCheckmark}>
                Reject:
              </label>
              <input
                id={rejectedCheckmark}
                type="checkbox"
                checked={isRejected}
                onChange={rejectedCheckmarkChange}
              ></input>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center items-end text-right">
          <div className="text-xl font-bold">Project:</div>
          <div className="text-2xl">
            {pairingData.project == -1 ? "-" : props.project}
          </div>
          <button
            className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-700"
            onClick={projectList}
          >
            Project {props.project} team list
          </button>
        </div>
      </div>
    </div>
  );
}

export default PairingDiv;
