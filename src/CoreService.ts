import IPLAllocator from "./algorithms/IPL";
import { Setup } from "./interfaces";

class CoreService {
  /*
      CoreService class - initialised at the loading of the app
      Handles the background storage and organisation of the data for m teams and n projects
  
      TODO: add comments about properties and functions
      */
  private fit_values: number[][] = [[]];
  private preference_values: number[][] = [[]];
  private fit_scalar: number = 1;
  private preference_scalar: number = 1;
  private b_values: number[][] = [[]];
  private num_teams_to_project: number[] = [];
  private allocations: number[][] = [[]];
  private rejections: number[][] = [[]];
  private num_teams: number = 0;
  private num_projects: number = 0;

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
        this.b_values[i][j] =
          this.fit_scalar * this.fit_values[i][j] +
          this.preference_scalar * this.preference_values[i][j];
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
    console.log(this.b_values);
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
    if (algorithm == "IPL") {
      const alloc_set = IPLAllocator(
        this.b_values,
        this.allocations,
        this.rejections,
        this.num_teams_to_project
      );
      console.log(alloc_set);
    }
    return allocation_set;
  }
}

export default CoreService;
