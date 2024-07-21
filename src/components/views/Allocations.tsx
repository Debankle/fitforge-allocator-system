import { useCoreService } from "../../CoreServiceContext";
import ListView from "./ListView";

function Allocations() {
  const coreSerivce = useCoreService();
  /*
    Implement storage and sorting of data here
    sort and get hooks working to a useState which fetches from CoreService
     then pass that to pairings
    */
  return (
    <div>
      <label>Score: {coreSerivce.get_score()}</label>

      <ListView
        title={"Allocated Pairings"}
        pairings={coreSerivce.get_allocations()} s
      />
    </div>
  );
}

export default Allocations;
