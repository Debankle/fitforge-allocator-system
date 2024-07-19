import { useCoreService } from "../../CoreServiceContext";
import ListView from "./ListView";

function Rejections() {
  const coreSerivce = useCoreService();
  const rejection = coreSerivce.get_rejections();
  console.log(rejection);

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

      {rejection[0].length == 0 ? (
        "No rejected pairings"
      ) : (
        <ListView pairings={rejection} />
      )}
    </div>
  );
}

export default Rejections;
