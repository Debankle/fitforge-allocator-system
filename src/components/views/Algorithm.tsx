import { useEffect, useState } from "react";
import { useCoreService } from "../../CoreServiceContext";
import ListView from "./ListView";
import { AllocationSet } from "../../interfaces";

function Algorithm() {
  const coreService = useCoreService();
  const [algorithmSets, setAlgorithmSets] = useState<AllocationSet[]>(
    coreService.get_allocation_sets()
  );
  const [currentAlgorithmSet, setCurrentAlgorithmSet] = useState<AllocationSet>(
    algorithmSets[0]
  ); // get this from the fouth select option

  const handleAlgorithmRun = () => {
    const algorithmType = "ILP"; // TODO: get from select 3
    const _ = coreService.run_algorithm(algorithmType);
    setAlgorithmSets(coreService.get_allocation_sets());
    console.log(algorithmSets);
  };

  const handleSetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSet = algorithmSets[parseInt(event.target.value)];
    setCurrentAlgorithmSet(selectedSet);
  };

  return (
    <div>
      <label>Sort by:</label>
      <select>
        <option value="B value">B Value</option>
      </select>
      <label>-</label>
      <select>
        <option value="Descending">Descending</option>
      </select>

      <div>
        <select>
          <option value="ILP">Integer Linear Programmig</option>
          <option value="GS">Gale-Shapely Matching</option>
        </select>
        <button onClick={handleAlgorithmRun}>Run</button>
        <select onChange={handleSetChange}>
          {algorithmSets.map((item, index) => (
            <option key={index} value={index}>
              Set {item.runCount} - Algorithm {item.algorithm} - Score{" "}
              {item.score}
            </option>
          ))}
        </select>
      </div>

      <ListView
        title={"Algorithm Pairings"}
        pairings={currentAlgorithmSet.allocation}
      />
    </div>
  );
}

export default Algorithm;
