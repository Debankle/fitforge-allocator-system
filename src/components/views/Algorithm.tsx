import ListView from "./ListView";

function Algorithm() {
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
        {/*
        Choose algorithm
        run algorithm
        select allocation set
        score
        */}
      </div>

      <ListView pairings={[]} />
    </div>
  );
}

export default Algorithm;
