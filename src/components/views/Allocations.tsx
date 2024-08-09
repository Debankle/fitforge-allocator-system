import { useCoreService } from "../../CoreServiceContext";
import ListView from "./ListView";

function Allocations() {
  const coreSerivce = useCoreService();

  const formatNumber = (value: any = -1, decimals = 6) => {
    return value === -1 ? "-" : value.toFixed(decimals);
  };

  return (
    <div>
      <label>Score: {formatNumber(coreSerivce.get_score())}</label>

      <ListView
        title={"Allocated Pairings"}
        pairings={coreSerivce.get_allocations()}
        sortBy={"team"}
        itemsPerPage={9}
      />
    </div>
  );
}

export default Allocations;
