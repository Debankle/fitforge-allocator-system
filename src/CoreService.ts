import ILPAllocator from "./algorithms/ILP";
import { Setup, State, Pairing, AllocationSet, InputStage } from "./interfaces";
import StateSaver from "./StateIO";
import { runGaleShapley } from "./algorithms/GS"; // Import the Gale-Shapley function

class CoreService {
  // Private Properties
  private initial_impact: number[][] = [[]];
  private initial_capability: number[][] = [[]];
  private initial_preference: number[][] = [[]];

  private impact: number[][] = [[]];
  private capability: number[][] = [[]];
  private preference: number[][] = [[]];
  private b: number[][] = [[]];
  private num_teams_to_project: number[] = [];

  private capability_scalar: number = 1;
  private preference_scalar: number = 1;
  private num_teams: number = 0;
  private num_projects: number = 0;

  private allocations: number[][] = [];
  private rejections: number[][] = [];
  private allocation_sets: AllocationSet[] = [];

  private min: number = Infinity;
  private max: number = -Infinity;

  public dataStage: InputStage = "Stage1";
  private listeners: Set<() => void> = new Set();

  // Setup functions
  initialise_values(props: Setup): void {
    this.initial_impact = props.impact_vals;
    this.initial_capability = props.capability_vals;
    this.initial_preference = props.preference_vals;
    this.soft_reset();
  }

  hard_reset(): void {
    this.initial_impact = [[]];
    this.initial_capability = [[]];
    this.initial_preference = [[]];
    this.soft_reset();
    this.dataStage = "Stage1";
  }

  soft_reset(): void {
    this.impact = this.initial_impact;
    this.capability = this.initial_capability;
    this.preference = this.initial_preference;
    this.preference_scalar = 1;
    this.capability_scalar = 1;
    this.rejections = [];
    this.allocation_sets = [];
    this.num_teams = this.impact.length;
    this.num_projects = this.impact[0].length;
    this.calculate_b_values();
    this.num_teams_to_project = new Array(this.num_projects).fill(1);
    this.set_initial_allocations();
    this.run_algorithm("ILP");
    this.dataStage = "Stage2";
  }

  calculate_b_values(): void {
    this.min = Infinity;
    this.max = -Infinity;
    for (let i = 0; i < this.num_teams; i++) {
      this.b[i] = [];
      for (let j = 0; j < this.num_projects; j++) {
        let a =
          this.impact[i][j] *
          (this.capability_scalar * this.capability[i][j] +
            this.preference_scalar * this.preference[i][j]);
        if (a > this.max) this.max = a;
        if (a < this.min) this.min = a;
        this.b[i][j] = a;
      }
    }
    this.notifyListeners();
  }

  set_initial_allocations(): void {
    for (let i = 1; i <= this.num_teams; i++) {
      this.allocations[i - 1] = [i, 0];
    }
  }

  // Data access functions
  get_score(): number {
    let score = 0;
    for (let i = 0; i < this.allocations.length; i++) {
      const inner_array = this.allocations[i];
      if (inner_array[1] != 0) {
        score += this.b[inner_array[0] - 1][inner_array[1] - 1];
      }
    }
    return score;
  }
  get_num_teams(): number {
    return this.num_teams;
  }

  get_num_projects(): number {
    return this.num_projects;
  }

  get_b_value(team: number, project: number): number {
    // Expects team from 1 to num_teams, and project from 1 to num_projects
    return this.b[team - 1][project - 1];
  }

  get_b_values(): number[][] {
    return this.b;
  }

  get_pairing_data(team: number, project: number): Pairing {
    if (team >= 1 && project == 0 && team <= this.num_teams) {
      return {
        impact: -1,
        capability: -1,
        preference: -1,
        capability_scalar: -1,
        preference_scalar: -1,
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
        impact: 0,
        capability: 0,
        preference: 0,
        capability_scalar: 0,
        preference_scalar: 0,
        b_value: 0,
        team: team,
        project: project,
      };
    }
    return {
      impact: this.impact[team - 1][project - 1],
      capability: this.capability[team - 1][project - 1],
      preference: this.preference[team - 1][project - 1],
      capability_scalar: this.capability_scalar,
      preference_scalar: this.preference_scalar,
      b_value: this.b[team - 1][project - 1],
      team: team,
      project: project,
    };
  }

  get_bg_colour(bvalue: number, alpha: number = 1): string {
    if (bvalue === -1) {
      return `rgba(0,0,180,${alpha})`;
    }
    let val = Math.round(((bvalue - this.min) / (this.max - this.min)) * 255);
    let red = 255 - val;
    let green = val;
    return `rgba(${red},${green},0,${alpha})`;
  }

  get_cell_bg_colour(team: number, project: number): string {
    if (this.is_pairing_allocated(team, project)) {
      return "rgba(51,153,255,0.7)";
    } else if (this.is_pairing_rejected(team, project)) {
      return "rgba(73,80,87,0.7)";
    } else {
      const bvalue = this.b[team - 1][project - 1];
      const alpha = 0.5;
      return this.get_bg_colour(bvalue, alpha);
    }
  }

  set_capability_scalar(capability: number): void {
    this.capability_scalar = capability;
    this.calculate_b_values();
  }

  set_preference_scalar(preference: number): void {
    this.preference_scalar = preference;
    this.calculate_b_values();
  }

  get_capability_scalar(): number {
    return this.capability_scalar;
  }

  get_preference_scalar(): number {
    return this.preference_scalar;
  }

  get_allocations(): number[][] {
    return this.allocations;
  }

  get_rejections(): number[][] {
    return this.rejections;
  }

  get_allocation_sets(): AllocationSet[] {
    return this.allocation_sets;
  }

  set_capability_value(
    team: number,
    project: number,
    capability: number
  ): void {
    this.capability[team - 1][project - 1] = capability;
    this.calculate_b_values();
  }

  set_preference_value(
    team: number,
    project: number,
    preference: number
  ): void {
    this.preference[team - 1][project - 1] = preference;
    this.calculate_b_values();
  }

  set_impact_value(team: number, project: number, impact: number): void {
    this.impact[team - 1][project - 1] = impact;
    this.calculate_b_values();
  }

  get_num_teams_to_projects(): number[] {
    return this.num_teams_to_project;
  }

  set_num_teams_to_project(teams: number, project: number): void {
    this.num_teams_to_project[project - 1] = teams;
  }

  // Allocation functions
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

  set_allocation(team: number, project: number): boolean {
    if (this.is_pairing_rejected(team, project)) {
      console.log("pairing is already rejected");
      return false;
    }
    if (!this.is_pairing_allocated(team, project)) {
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
    if (this.is_pairing_allocated(team, project)) {
      this.allocations[team - 1][1] = 0;
      return true;
    } else {
      console.log("pairing not allocated");
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

  // Algorithms
  run_algorithm(algorithm: string): void {
    if (algorithm == "ILP") {
      const alloc_set = ILPAllocator(
        this.b,
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
      }
    } else if (algorithm == "GS") {
      // Call the Gale-Shapley algorithm
      const allocation_set = runGaleShapley(
        this.capability,
        this.preference,
        this.capability_scalar,
        this.preference_scalar
      );

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
    }
  }

  private calculateScoreFromAllocation(allocation_set: number[][]): number {
    let score = 0;
    for (let teamIndex = 0; teamIndex < allocation_set.length; teamIndex++) {
      for (const projectIndex of allocation_set[teamIndex]) {
        score += this.b[teamIndex][projectIndex];
      }
    }
    return score;
  }

  // Connection to listeners
  addListener(listener: () => void): void {
    this.listeners.add(listener);
  }

  removeListener(listener: () => void): void {
    this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  // Save methods
  saveState(filename: string): void {
    const currentState: State = {
      initial_impact: this.initial_impact,
      initial_capability: this.initial_capability,
      initial_preference: this.initial_preference,
      impact: this.impact,
      capability: this.capability,
      preference: this.preference,
      capability_scalar: this.capability_scalar,
      preference_scalar: this.preference_scalar,
      num_teams_to_project: this.num_teams_to_project,
      allocations: this.allocations,
      rejections: this.rejections,
      allocation_sets: this.allocation_sets,
      dataStage: this.dataStage,
    };
    StateSaver.save(filename, currentState);
  }

  async loadState(file: File): Promise<void> {
    const newState = await StateSaver.load(file);
    this.initial_impact = newState.initial_impact;
    this.initial_capability = newState.initial_capability;
    this.initial_preference = newState.initial_preference;
    this.impact = newState.impact;
    this.capability = newState.capability;
    this.preference = newState.preference;
    this.capability_scalar = newState.capability_scalar;
    this.preference_scalar = newState.preference_scalar;
    this.num_teams_to_project = newState.num_teams_to_project;
    this.allocations = newState.allocations;
    this.rejections = newState.rejections;
    this.allocation_sets = newState.allocation_sets;
    this.dataStage = newState.dataStage;
    this.num_teams = this.impact.length;
    this.num_projects = this.impact[0].length;
  }

  log_dump() {
    console.log("Initial Impact:", this.initial_impact);
    console.log("Initial Capability:", this.initial_capability);
    console.log("Initial Preference:", this.initial_preference);
    console.log("Impact:", this.impact);
    console.log("Capability:", this.capability);
    console.log("Preference:", this.preference);
    console.log("B Values:", this.b);
    console.log("Number of Teams to Project:", this.num_teams_to_project);
    console.log("Capability Scalar:", this.capability_scalar);
    console.log("Preference Scalar:", this.preference_scalar);
    console.log("Number of Teams:", this.num_teams);
    console.log("Number of Projects:", this.num_projects);
    console.log("Allocations:", this.allocations);
    console.log("Rejections:", this.rejections);
    console.log("Allocation Sets:", this.allocation_sets);
    console.log("Min Value:", this.min);
    console.log("Max Value:", this.max);
    console.log("Data Stage:", this.dataStage);
    console.log("Listeners:", this.listeners);
  }
}

export default CoreService;
