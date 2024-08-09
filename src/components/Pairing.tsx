import { useId, useState, useEffect } from "react";
import { useCoreService } from "../CoreServiceContext";
import { useNavigation } from "../NavServiceContext";
import { AllocationState, Pairing, AllocationResult } from "../interfaces";

interface Props {
  team: number;
  project: number;
  onToggle: () => void;
}

function PairingDiv(props: Props) {
  const coreService = useCoreService();
  const { navigate } = useNavigation();
  const [hover, setHover] = useState<boolean>(false);
  const [pairingData, setPairingData] = useState<Pairing>(
    coreService.get_pairing_data(props.team, props.project)
  );
  const [mode, setMode] = useState<"Read" | "Edit">("Read");
  const [allocationStatus, setAllocationStatus] =
    useState<AllocationState>("Neither");
  const [warning, setWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capVal, setCapVal] = useState<number>(pairingData.capability);
  const [prefVal, setPrefVal] = useState<number>(pairingData.preference);
  const [impactVal, setImpactVal] = useState<number>(pairingData.impact);
  const idPrefix = useId();

  useEffect(() => {
    const updateData = () => {
      setPairingData(coreService.get_pairing_data(props.team, props.project));
      if (coreService.is_pairing_allocated(props.team, props.project)) {
        setAllocationStatus("Allocated");
      } else if (coreService.is_pairing_rejected(props.team, props.project)) {
        setAllocationStatus("Rejected");
      } else {
        setAllocationStatus("Neither");
      }
      setCapVal(pairingData.capability);
      setPrefVal(pairingData.preference);
      setImpactVal(pairingData.impact);
    };

    updateData();

    const listener = () => updateData();
    coreService.addListener(listener);

    return () => {
      coreService.removeListener(listener);
    };
  }, [props.team, props.project, coreService]);

  const handleAllocationChange = (value: AllocationState) => {
    setError(null);
    setWarning(null);

    let result: AllocationResult = { success: false, message: "" };

    switch (value) {
      case "Neither":
        if (allocationStatus === "Allocated") {
          result = coreService.remove_allocation(props.team, props.project);
        } else if (allocationStatus === "Rejected") {
          result = coreService.remove_rejection(props.team, props.project);
        } else {
          result = { success: true, message: "No change needed." };
        }
        break;

      case "Allocated":
        if (allocationStatus === "Rejected") {
          // Remove rejection first, then attempt allocation
          const rejectionRemoval = coreService.remove_rejection(
            props.team,
            props.project
          );
          if (rejectionRemoval.success) {
            result = coreService.set_allocation(props.team, props.project);
          } else {
            result = rejectionRemoval;
          }
        } else if (
          allocationStatus === "Neither" ||
          allocationStatus === "Allocated"
        ) {
          result = coreService.set_allocation(props.team, props.project);
        }
        break;

      case "Rejected":
        if (allocationStatus === "Allocated") {
          // Remove allocation first, then set rejection
          const allocationRemoval = coreService.remove_allocation(
            props.team,
            props.project
          );
          if (allocationRemoval.success) {
            result = coreService.set_rejection(props.team, props.project);
          } else {
            result = allocationRemoval;
          }
        } else if (
          allocationStatus === "Neither" ||
          allocationStatus === "Rejected"
        ) {
          result = coreService.set_rejection(props.team, props.project);
        }
        break;

      default:
        result = { success: false, message: "Invalid allocation state." };
        break;
    }
    coreService.notifyListeners();

    if (result.success) {
      setAllocationStatus(value);
      setWarning(result.warning || null);
    } else {
      setError(result.message);
      // Maintain the previous allocation status in case of failure
    }
  };

  const toggleHover = (type: boolean) => {
    setHover(type);
  };

  const teamList = () => {
    navigate({ page: "ProjectList", data: { team: props.team } });
  };

  const projectList = () => {
    navigate({ page: "TeamList", data: { project: props.project } });
  };

  const spreadsheet = () => {
    navigate({
      page: "Spreadsheet",
      data: { team: props.team, project: props.project },
    });
  };

  const formatNumber = (value: any = -1, decimals = 6) => {
    return value === -1 ? "-" : value.toFixed(decimals);
  };

  return (
    <div
      className="flex flex-col w-full max-w-screen-lg mx-auto p-4 bg-gray-100 rounded shadow-md"
      style={{
        display: "inline-block",
        transition: "all 0.3s",
        backgroundColor: coreService.get_bg_colour(
          pairingData.b_value,
          hover ? 0.5 : 1
        ),
      }}
      onMouseEnter={() => toggleHover(true)}
      onMouseLeave={() => toggleHover(false)}
    >
      {/* Top Section for Team and Project */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col">
          <div className="font-bold text-xl">Team:</div>
          <div className="text-2xl">
            {coreService.get_team_name(props.team)}
          </div>
        </div>
        <div className="flex flex-col">
          <div className="font-bold text-xl">Project:</div>
          <div className="text-2xl">
            {coreService.get_project_name(props.project)}
          </div>
        </div>
      </div>

      {/* Data Values Section */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="flex flex-col">
          <div className="font-bold text-sm">Capability:</div>
          {mode == "Read" ? (
            <div>{formatNumber(pairingData.capability)}</div>
          ) : (
            <input
              type="number"
              value={capVal}
              step={"0.000001"}
              className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value)) {
                  setCapVal(value);
                  coreService.set_capability_value(
                    props.team,
                    props.project,
                    value
                  );
                }
              }}
            />
          )}
        </div>
        <div className="flex flex-col">
          <div className="font-bold text-sm">Preference:</div>
          {mode == "Read" ? (
            <div>{formatNumber(pairingData.preference)}</div>
          ) : (
            <input
              type="number"
              value={prefVal}
              step={"0.000001"}
              className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value)) {
                  setPrefVal(value);
                  coreService.set_preference_value(
                    props.team,
                    props.project,
                    value
                  );
                }
              }}
            />
          )}
        </div>
        <div className="flex flex-col">
          <div className="font-bold text-sm">Impact:</div>
          {mode == "Read" ? (
            <div>{formatNumber(pairingData.impact)}</div>
          ) : (
            <input
              type="number"
              value={impactVal}
              step={"0.000001"}
              className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value)) {
                  setImpactVal(value);
                  coreService.set_impact_value(
                    props.team,
                    props.project,
                    value
                  );
                }
              }}
            />
          )}
        </div>
        <div className="flex flex-col">
          <div className="font-bold text-sm">Cap Scalar:</div>
          <div>{formatNumber(pairingData.capability_scalar)}</div>
        </div>
        <div className="flex flex-col">
          <div className="font-bold text-sm">Preference Scalar:</div>
          <div>{formatNumber(pairingData.preference_scalar)}</div>
        </div>
        <div className="flex flex-col">
          <div className="font-bold text-sm">B Value:</div>
          <div>{formatNumber(pairingData.b_value)}</div>
        </div>
      </div>

      {/* Allocation Status Section */}
      <div className="flex justify-center mb-4">
        <div className="flex items-center">
          <input
            type="radio"
            id={`${idPrefix}-Neither`}
            name={`${idPrefix}-allocationStatus`}
            value="Neither"
            checked={allocationStatus === "Neither"}
            onChange={() => handleAllocationChange("Neither")}
            className="mr-1"
          />
          <label htmlFor={`${idPrefix}-neither`} className="mr-3">
            Neither
          </label>

          <input
            type="radio"
            id={`${idPrefix}-allocate`}
            name={`${idPrefix}-allocationStatus`}
            value="Allocated"
            checked={allocationStatus === "Allocated"}
            onChange={() => handleAllocationChange("Allocated")}
            className="mr-1"
          />
          <label htmlFor={`${idPrefix}-allocate`} className="mr-3">
            Allocate
          </label>

          <input
            type="radio"
            id={`${idPrefix}-reject`}
            name={`${idPrefix}-allocationStatus`}
            value="Rejected"
            checked={allocationStatus === "Rejected"}
            onChange={() => handleAllocationChange("Rejected")}
            className="mr-1"
          />
          <label htmlFor={`${idPrefix}-reject`} className="mr-3">
            Reject
          </label>
        </div>
      </div>

      {/* Warning Message */}
      {warning && (
        <div className="text-black-500 text-center mb-4">{warning}</div>
      )}

      {/* Error Message */}
      {error && <div className="text-black-500 text-center mb-4">{error}</div>}

      {/* Buttons Section */}
      <div className="flex justify-center gap-2">
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-700"
          onClick={(e) => {
            e.stopPropagation();
            spreadsheet();
          }}
        >
          Spreadsheet
        </button>
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-700"
          onClick={(e) => {
            e.stopPropagation();
            teamList();
          }}
        >
          Team {props.team} project list
        </button>
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-700"
          onClick={(e) => {
            e.stopPropagation();
            projectList();
          }}
        >
          Project {props.project} team list
        </button>
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-700 opacity-50 cursor-not-allowed"
          onClick={() => setMode(mode === "Edit" ? "Read" : "Edit")}
          disabled={true}
        >
          {mode === "Edit" ? "Switch to Read" : "Switch to Edit"}
        </button>
      </div>
    </div>
  );
}

export default PairingDiv;
