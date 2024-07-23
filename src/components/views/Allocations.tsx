import { useCoreService } from "../../CoreServiceContext";
import ListView from "./ListView";

function Allocations() {
  const coreSerivce = useCoreService();

  return (
    <div>
      <label>Score: {coreSerivce.get_score()}</label>

      <ListView
        title={"Allocated Pairings"}
        pairings={coreSerivce.get_allocations()}
      />
    </div>
  );
}

export default Allocations;
