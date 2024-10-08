import { useCoreService } from "../../CoreServiceContext";
import ListView from "./ListView";

function Rejections() {
  const coreSerivce = useCoreService();
  const rejection = coreSerivce.get_rejections();

  return (
    <div>
      {rejection.length == 0 ? (
        "No rejected pairings"
      ) : (
        <ListView
          title={"Rejected Pairings"}
          pairings={rejection}
          sortBy={"team"}
          itemsPerPage={9}
        />
      )}
    </div>
  );
}

export default Rejections;
