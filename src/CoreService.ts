import ILPAllocator from "./algorithms/ILP";
import { Setup, State, Pairing } from "./interfaces";
import StateSaver from "./StateIO";

class CoreService {
  private fit_values: number[][] = [[]];
  private preference_values: number[][] = [[]];
  private fit_scalar: number = 1;
  private preference_scalar: number = 1;
  private b_values: number[][] = [[]];
  private num_teams_to_project: number[] = [];
  private allocations: number[][] = [[]];
  private rejections: number[][] = [[]];
  private allocation_sets: number[][][] = [[[]]];
  private num_teams: number = 0;
  private num_projects: number = 0;
  private min: number = Infinity;
  private max: number = -Infinity;

  getNumTeams(): number {
    return this.num_teams;
  }

  getNumProjects(): number {
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
    this.allocations = [[]];
    this.rejections = [[]];
    this.soft_reset();
  }

  soft_reset(): void {
    this.fit_scalar = 1;
    this.preference_scalar = 1;
    this.calculate_b_values();
  }

  calculate_b_values(): void {
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
  }

  initialise_values(props: Setup): void {
    this.fit_values = props.fit_vals;
    this.preference_values = props.pref_vals;
    this.num_teams_to_project = props.num_teams_to_project;
    this.num_teams = this.fit_values.length;
    this.num_projects = this.fit_values[0].length;
    this.soft_reset();
  }

  set_fit_scalar(fit_scale: number): void {
    this.fit_scalar = fit_scale;
    this.calculate_b_values();
  }

  set_pref_scalar(pref_scale: number): void {
    this.preference_scalar = pref_scale;
    this.calculate_b_values();
  }

  get_allocations(): number[][] {
    return this.allocations;
  }

  get_rejections(): number[][] {
    return this.rejections;
  }

  run_algorithm(algorithm: string): number[][] {
    let allocation_set: number[][] = [];
    if (algorithm == "ILP") {
      const alloc_set = ILPAllocator(
        this.b_values,
        this.allocations,
        this.rejections,
        this.num_teams_to_project
      );
      console.log(alloc_set);
    }
    return allocation_set;
  }

  get_pairing_data(team: number, project: number): Pairing {
    if (
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
    let val = Math.round(((bvalue - this.min) / (this.max - this.min)) * 255);
    let rbga = (255 - val).toString() + "," + val.toString() + ",0,";
    return rbga;
  }

  log_dump() {
    console.log(this.b_values);
    console.log(this.allocations);
    console.log(this.rejections);
  }

  is_pairing_allocated(team: number, project: number): boolean {
    return false;
  }

  is_pairing_rejected(team: number, project: number): boolean {
    return false;
  }
}

export default CoreService;
