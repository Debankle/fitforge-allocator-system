import { useCoreService } from "../CoreServiceContext";
import { Pairing } from "../interfaces";
import { useEffect, useId, useState } from "react";
import { useNavigation } from "../NavServiceContext";

interface Props {
  team: number;
  project: number;
  isShown: boolean;
  onToggle: () => void;
}

function PairingDiv(props: Props) {
  const coreService = useCoreService();
  const { navigate } = useNavigation();
  const [hover, setHover] = useState<boolean>(false);
  const [isAllocated, setIsAllocated] = useState<boolean>(
    coreService.is_pairing_allocated(props.team, props.project)
  );
  const [isRejected, setIsRejected] = useState<boolean>(
    coreService.is_pairing_rejected(props.team, props.project)
  );
  const [pairingData, setPairingData] = useState<Pairing>(
    coreService.get_pairing_data(props.team, props.project)
  );
  const bgColor: string = coreService.get_bg_color(pairingData.b_value);
  const allocatedCheckmark = useId();
  const rejectedCheckmark = useId();
  const isShown = true;

  useEffect(() => {
    const updateData = () => {
      setPairingData(coreService.get_pairing_data(props.team, props.project));
      setIsRejected(coreService.is_pairing_rejected(props.team, props.project));
      setIsAllocated(
        coreService.is_pairing_allocated(props.team, props.project)
      );
    };

    updateData();

    const listener = () => updateData();
    coreService.addListener(listener);

    return () => {
      coreService.removeListener(listener);
    };
  }, [props.team, props.project, coreService]);

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

  const spreadsheet = () => {
    navigate({
      page: "Spreadsheet",
      data: { team: props.team, project: props.project },
    });
  };

  const teamList = () => {
    navigate({ page: "ProjectList", data: { team: props.team } });
  };

  const projectList = () => {
    navigate({ page: "TeamList", data: { project: props.project } });
  };

  const handleBackgroundClick = (_: React.MouseEvent<HTMLDivElement>) => {
      props.onToggle();    
  };

  var styleSheet: any;
  if (hover) {
    styleSheet = { backgroundColor: "rgba(" + bgColor + "0.5)", display: 'inline-block', transition:'all 0.3s' };
  } else {
    styleSheet = { backgroundColor: "rgba(" + bgColor + "1)", display: 'inline-block', transition: 'all 0.3s' };
  }

  return (
    <div
      className="flex flex-col m-1"
      style={styleSheet}
      onMouseEnter={toggleHover}
      onMouseLeave={toggleHover}
      onClick={handleBackgroundClick}
    >
      <div className="flex p-2">
        <div className="flex-1 flex flex-col justify-center ml-2">
          <div className="text-xl font-bold">Team:</div>
          <div className="text-2xl">{props.team}</div>
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
                onClick={(e) => e.stopPropagation()}
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
                onClick={(e) => e.stopPropagation()}
              ></input>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center items-end text-right mr-3">
          <div className="text-xl font-bold">Project:</div>
          <div className="text-2xl">
            {pairingData.project == -1 ? "-" : props.project}
          </div>
        </div>

        {/*props.isShown will hide this and allow for toggles, but it seems to look better without, idk im not the UI guy */}
        {isShown && (
          <div className="flex-1 flex flex-col justify-center items-end text-right ml-2 mr-2">
            <button
              className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-bue-700 mt-1 mb-1"
              onClick={(e) => {
                e.stopPropagation();
                spreadsheet();
              }}
            >
              Show in spreadsheet
            </button>
            <button
              className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-700 mt-1 mb-1"
              onClick={(e) => {
                e.stopPropagation();
                teamList();
              }}
            >
              Team {props.team} project list
            </button>
            <button
              className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-700 mt-1 mb-1"
              onClick={(e) => {
                e.stopPropagation();
                projectList();
              }}
            >
              Project {props.project} team list
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PairingDiv;
