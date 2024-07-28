import { useEffect, useState } from "react";
import { useCoreService } from "../../CoreServiceContext";
import ListView from "./ListView";
import { AllocationSet } from "../../interfaces";

type Algorithm = "ILP" | "GS";

function Algorithm() {
  const coreService = useCoreService();
  const [algorithmSets, setAlgorithmSets] = useState<AllocationSet[]>(
    coreService.get_allocation_sets()
  );
  const [currentAlgorithmSet, setCurrentAlgorithmSet] = useState<AllocationSet>(
    algorithmSets[0]
  ); // get this from the fouth select option
  const [algorithmType, setAlgorithmType] = useState<Algorithm>("ILP");
  const [currentAlgorithmSetIndex, setCurrentAlgorithmSetIndex] =
    useState<number>(0);

  const handleAlgorithmRun = () => {
    const _ = coreService.run_algorithm(algorithmType);
    setAlgorithmSets(coreService.get_allocation_sets());
    const newIndex = algorithmSets.length - 1;
    setCurrentAlgorithmSet(algorithmSets[newIndex]);
    setCurrentAlgorithmSetIndex(newIndex);
  };

  useEffect(() => {
    const updateData = () => {
      setAlgorithmSets(coreService.get_allocation_sets());
      setCurrentAlgorithmSet(algorithmSets[algorithmSets.length - 1]);
    };

    updateData();
  }, [algorithmSets]);

  const handleSetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSet = algorithmSets[parseInt(event.target.value)];
    setCurrentAlgorithmSet(selectedSet);
  };

  const handleAlgorithmChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setAlgorithmType(event.target.value as Algorithm);
  };

  return (
    <div>
      <div>
        <select onChange={handleAlgorithmChange}>
          <option value="ILP">Integer Linear Programmig</option>
          <option value="GS">Gale-Shapely Matching</option>
        </select>
        <button onClick={handleAlgorithmRun}>Run</button>
        <select onChange={handleSetChange} value={currentAlgorithmSetIndex}>
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
