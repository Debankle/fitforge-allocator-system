import { useCoreService } from "../../CoreServiceContext";
import ListView from "./ListView";

function Rejections() {
  const coreSerivce = useCoreService();
  const rejection = coreSerivce.get_rejections();
  console.log(rejection);

  return (
    <div>
      {rejection.length == 0 ? (
        "No rejected pairings"
      ) : (
        <ListView title={"Rejected Pairings"} pairings={rejection} />
      )}
    </div>
  );
}

export default Rejections;
