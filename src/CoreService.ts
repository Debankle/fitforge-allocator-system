import ILPAllocator from "./algorithms/ILP";
import { Setup, State, Pairing, AllocationSet } from "./interfaces";
import StateSaver from "./StateIO";
import { runGaleShapley } from "./algorithms/GS"; // Import the Gale-Shapley function

class CoreService {
  private fit_values: number[][] = [[]];
  private preference_values: number[][] = [[]];
  private fit_scalar: number = 1;
  private preference_scalar: number = 1;
  private b_values: number[][] = [[]];
  private num_teams_to_project: number[] = [];
  private allocations: number[][] = [];
  private rejections: number[][] = [];
  private allocation_sets: AllocationSet[] = [];
  private num_teams: number = 0;
  private num_projects: number = 0;
  private min: number = Infinity;
  private max: number = -Infinity;
  public isDataLoaded: boolean = false;
  private listeners: Set<() => void> = new Set();

  addListener(listener: () => void): void {
    this.listeners.add(listener);
  }

  removeListener(listener: () => void): void {
    this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  get_num_teams(): number {
    return this.num_teams;
  }

  get_num_projects(): number {
    return this.num_projects;
  }

  saveState(filename: string): void {
    const currentState: State = {
      fit_values: this.fit_values,
      preference_values: this.preference_values,
      fit_scalar: this.fit_scalar,
      preference_scalar: this.preference_scalar,
      num_teams_to_project: this.num_teams_to_project,
      allocations: this.allocations,
      rejections: this.rejections,
      allocation_sets: this.allocation_sets,
    };
    StateSaver.save(filename, currentState);
  }

  async loadState(file: File): Promise<void> {
    const newState = await StateSaver.load(file);
    this.fit_values = newState.fit_values;
    this.preference_values = newState.preference_values;
    this.num_teams_to_project = newState.num_teams_to_project;
    this.fit_scalar = newState.fit_scalar;
    this.preference_scalar = newState.preference_scalar;
    this.allocations = newState.allocations;
    this.rejections = newState.rejections;
    this.allocation_sets = newState.allocation_sets;
    this.num_teams = this.fit_values.length;
    this.num_projects = this.fit_values[0].length;
    this.calculate_b_values();
  }

  hard_reset(): void {
    this.b_values = [[]];
    this.preference_values = [[]];
    this.fit_values = [[]];
    this.num_teams_to_project = [];
    this.num_teams = 0;
    this.num_projects = 0;
    this.allocations = [];
    this.rejections = [];
    this.soft_reset();
    this.isDataLoaded = false;
  }

  soft_reset(): void {
    this.fit_scalar = 1;
    this.preference_scalar = 1;
    this.allocation_sets = [];
    this.calculate_b_values();
  }

  calculate_b_values(): void {
    this.min = Infinity;
    this.max = -Infinity;
    for (let i = 0; i < this.num_teams; i++) {
      this.b_values[i] = [];
      for (let j = 0; j < this.num_projects; j++) {
        let a =
          this.fit_scalar * this.fit_values[i][j] +
          this.preference_scalar * this.preference_values[i][j];
        if (a > this.max) this.max = a;
        if (a < this.min) this.min = a;
        this.b_values[i][j] = a;
      }
    }
    this.isDataLoaded = true;
    this.notifyListeners();
  }

  get_b_value(team: number, project: number): number {
    return this.b_values[team - 1][project - 1];
  }

  initialise_values(props: Setup): void {
    this.fit_values = props.fit_vals;
    this.preference_values = props.pref_vals;
    this.num_teams_to_project = props.num_teams_to_project;
    this.num_teams = this.fit_values.length;
    this.num_projects = this.fit_values[0].length;
    this.soft_reset();
    this.set_initial_allocations();
  }

  set_fit_scalar(fit_scale: number): void {
    this.fit_scalar = fit_scale;
    this.calculate_b_values();
  }

  set_pref_scalar(pref_scale: number): void {
    this.preference_scalar = pref_scale;
    this.calculate_b_values();
  }

  get_fit_scalar(): number {
    return this.fit_scalar;
  }

  get_pref_scalar(): number {
    return this.preference_scalar;
  }

  set_initial_allocations(): void {
    for (let i = 1; i <= this.num_teams; i++) {
      this.allocations[i - 1] = [i, 0];
    }
  }

  set_allocation(team: number, project: number): boolean {
    if (
      this.rejections.some((row) =>
        row.every((value, index) => value === [team, project][index])
      )
    ) {
      console.log("pairing is already rejected");
      return false;
    }
    if (this.allocations[team - 1][1] == 0) {
      if (
        this.allocations.filter((row) => row[1] === project).length <
        this.num_teams_to_project[project - 1]
      ) {
        this.allocations[team - 1][1] = project;
        return true;
      } else {
        console.log("too many teams allocated to that project already");
        return false;
      }
    } else {
      console.log("team already has a project allocated");
      return false;
    }
  }

  remove_allocation(team: number, project: number): boolean {
    if (this.allocations[team - 1][1] == project) {
      this.allocations[team - 1][1] = 0;
      return true;
    } else {
      return false;
    }
  }

  set_rejection(team: number, project: number): boolean {
    if (this.allocations[team - 1][1] != project) {
      this.rejections.push([team, project]);
      return true;
    } else {
      console.log("pairing is already allocated");
      return false;
    }
  }

  remove_rejection(team: number, project: number): boolean {
    const index = this.rejections.findIndex(
      (row) => row[0] == team && row[1] == project
    );
    if (index !== -1) {
      this.rejections.splice(index, 1);
      return true;
    } else {
      return false;
    }
  }

  get_allocations(): number[][] {
    return this.allocations;
  }

  get_rejections(): number[][] {
    return this.rejections;
  }

  run_algorithm(algorithm: string): boolean {
    if (algorithm == "ILP") {
      const alloc_set = ILPAllocator(
        this.b_values,
        this.allocations,
        this.rejections,
        this.num_teams_to_project
      );
      let allocations = [];
      if (alloc_set["feasible"] == true) {
        for (const key in alloc_set) {
          if (key != "feasible" && key != "result" && key != "bounded") {
            const set = key as string;
            const alloc_split = set.split("_");
            if (alloc_split.length == 3) {
              allocations.push([
                parseInt(alloc_split[1]),
                parseInt(alloc_split[2]),
              ]);
            }
          }
        }
        const allocation: AllocationSet = {
          allocation: allocations,
          score: alloc_set["result"] as number,
          algorithm: "ILP",
          runCount: this.allocation_sets.length + 1,
        };
        this.allocation_sets.push(allocation);
        return true;
      } else {
        console.error("Failed to find a valid allocation");
      }
    } else if (algorithm == "GS") {
      // Call the Gale-Shapley algorithm
      const allocation_set = runGaleShapley(this.fit_values, this.preference_values, this.fit_scalar, this.preference_scalar);

      // Format allocation_set to match the AllocationSet type
      const allocations: number[][] = [];
      for (let i = 0; i < allocation_set.length; i++) {
        for (const proj of allocation_set[i]) {
          allocations.push([i + 1, proj]); // +1 to match 1-based index
        }
      }

      const allocation: AllocationSet = {
        allocation: allocations,
        score: this.calculateScoreFromAllocation(allocation_set),
        algorithm: "GS",
        runCount: this.allocation_sets.length + 1,
      };
      this.allocation_sets.push(allocation);
      return true;
    }
    return false;
  }

  private calculateScoreFromAllocation(allocation_set: number[][]): number {
    let score = 0;
    for (let teamIndex = 0; teamIndex < allocation_set.length; teamIndex++) {
      for (const projectIndex of allocation_set[teamIndex]) {
        score += this.b_values[teamIndex][projectIndex];
      }
    }
    return score;
  }

  get_pairing_data(team: number, project: number): Pairing {
    if (team >= 1 && project == 0 && team <= this.num_teams) {
      return {
        fit_value: -1,
        pref_value: -1,
        fit_scalar: -1,
        pref_scalar: -1,
        b_value: -1,
        team: team,
        project: -1,
      };
    } else if (
      team < 1 ||
      team > this.num_teams ||
      project < 1 ||
      project > this.num_projects
    ) {
      return {
        fit_value: 0,
        pref_value: 0,
        fit_scalar: 0,
        pref_scalar: 0,
        b_value: 0,
        team: team,
        project: project,
      };
    }
    return {
      fit_value: this.fit_values[team - 1][project - 1],
      pref_value: this.preference_values[team - 1][project - 1],
      fit_scalar: this.fit_scalar,
      pref_scalar: this.preference_scalar,
      b_value: this.b_values[team - 1][project - 1],
      team: team,
      project: project,
    };
  }

  get_bg_color(bvalue: number): string {
    if (bvalue == -1) {
      return "0,0,180,";
    }
    let val = Math.round(((bvalue - this.min) / (this.max - this.min)) * 255);
    let rbga = (255 - val).toString() + "," + val.toString() + ",0,";
    return rbga;
  }

  get_cell_color(team: number, project: number): string {
    if (this.is_pairing_allocated(team, project)) {
      return "rgba(51,153,255,0.7)";
    } else if (this.is_pairing_rejected(team, project)) {
      return "rgba(73,80,87,0.7)";
    } else {
      return (
        "rgba(" +
        this.get_bg_color(this.b_values[team - 1][project - 1]) +
        "0.5)"
      );
    }
  }

  log_dump() {
    console.log(this.b_values);
    console.log(this.allocations);
    console.log(this.rejections);
    console.log(this.allocation_sets);
  }

  is_pairing_allocated(team: number, project: number): boolean {
    if (this.allocations[team - 1][1] == project) return true;
    return false;
  }

  is_pairing_rejected(team: number, project: number): boolean {
    if (
      this.rejections.some((row) =>
        row.every((value, index) => value === [team, project][index])
      )
    ) {
      return true;
    } else {
      return false;
    }
  }

  get_allocation_sets(): AllocationSet[] {
    return this.allocation_sets;
  }

  get_score(): number {
    let score = 0;
    for (const allocation of this.allocations) {
      const team: number = allocation[0];
      const project: number = allocation[1];
      if (project != 0) {
        score = score + this.b_values[team - 1][project - 1];
      }
    }
    return score;
  }
}

export default CoreService;


