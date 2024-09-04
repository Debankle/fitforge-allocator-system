import ILPAllocator from "./algorithms/ILP";
import {
  Setup,
  State,
  Pairing,
  AllocationSet,
  InputStage,
  AllocationResult,
} from "./interfaces";
import StateSaver from "./StateIO";
import { runGaleShapley } from "./algorithms/GS";

/**
 * Backend data management context class
 * 
 * @class

 */
class CoreService {
  // Private Properties
  private initial_impact: number[][] = [[]];
  private initial_capability: number[][] = [[]];
  private initial_preference: number[][] = [[]];
  private team_names: string[] = [];
  private project_names: string[] = [];

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

  /**
   * Initial input of base allocation data
   *
   * @public
   * @param {Setup} props - The initial data
   * @returns {void}
   */
  initialise_values(props: Setup): void {
    this.initial_impact = props.impact_vals;
    this.initial_capability = props.capability_vals;
    this.initial_preference = props.preference_vals;
    this.team_names = props.team_names;
    this.project_names = props.project_names;
    this.soft_reset();
  }

  /**
   * Hard reset of the system, wiping all data and returning to initial input stage
   *
   * @public
   * @returns {void}
   */
  hard_reset(): void {
    this.initial_impact = [[]];
    this.initial_capability = [[]];
    this.initial_preference = [[]];
    this.soft_reset();
    this.dataStage = "Stage1";
  }

  /**
   * Soft reset of the system back to the original state after uploading the data initially
   *
   * @public
   * @returns {void}
   */
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

  /**
   * Calculates the b values based on the uploaded data according to the formula
   * b_ij = impact_ij * (cap_scale * capability_ij + pref_scale * preference_ij)
   * for every pairing team i project j
   *
   * @private
   * @returns {void}
   */
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

  /**
   * Set the initial allocation pairings to zero (null)
   *
   * @private
   * @returns {void}
   */
  set_initial_allocations(): void {
    for (let i = 1; i <= this.num_teams; i++) {
      this.allocations[i - 1] = [i, 0];
    }
  }

  /**
   * Return the visible team name for the team number
   *
   * @public
   * @param {number} team - team number from 1 to m
   * @returns {string} The visible name for team i
   */
  get_team_name(team: number): string {
    return this.team_names[team - 1];
  }

  /**
   * Return the visible project name for the project number
   *
   * @public
   * @param {number} project - project number from 1 to n
   * @returns {string} The visible name for project j
   */
  get_project_name(project: number): string {
    return this.project_names[project - 1];
  }

  /**
   * Get the score of the current allocation, i.e. the sum of the b values
   *
   * @public
   * @returns {number} The total score of the allocations
   */
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

  /**
   * Calculate the score for an allocation set
   *
   * @public
   * @param {number[][]} pairings - a 2D array of team project pairings
   * @returns {number} The sum of b values for each pairing
   */
  get_score_set(pairings: number[][]): number {
    let score = 0;
    for (let i = 0; i < pairings.length; i++) {
      const pairing = pairings[i];
      score += this.b[pairing[0] - 1][pairing[1] - 1];
    }
    return score;
  }

  /**
   * Get the number of teams in the current state
   *
   * @public
   * @returns {number} The number of teams in the system
   */
  get_num_teams(): number {
    return this.num_teams;
  }

  /**
   * Get the number of projects in the current state
   *
   * @public
   * @returns {number} The number of projects in the system
   */
  get_num_projects(): number {
    return this.num_projects;
  }

  /**
   * Get the b value for a specific pairing ij
   *
   * @public
   * @param {number} team - the team number i from 1 to m
   * @param {number} project - the project number j from 1 to n
   * @returns {number} The b value for pairing ij
   */
  get_b_value(team: number, project: number): number {
    // Expects team from 1 to num_teams, and project from 1 to num_projects
    return this.b[team - 1][project - 1];
  }

  /**
   * Return the b value matrix
   *
   * @public
   * @returns {number[][]} The current b values stored
   */
  get_b_values(): number[][] {
    return this.b;
  }

  /**
   * Get the Pairing details for a specific pairing ij.
   *
   * If the team and number parameters are within the range, will return their pairing data
   * If the pairing is an unallocated team, it will return -1 for each datapoint
   * If the pairing is invalid, it will return 0 for each datapoint
   *
   * @public
   * @param {number} team - the team number i from 1 to m
   * @param {number} project - the project number j from 1 to n
   * @returns {Pairing} The Pairing object containing the data for that specific pairing
   */
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

  /**
   * Get the background colour for a pairing div based on the b value scale
   *
   * @public
   * @param {number} bvalue - the b value of the pairing
   * @param {number} alpha - the alpha level for the background
   * @returns {string} The rgba string for a background
   */
  get_bg_colour(bvalue: number, alpha: number = 1): string {
    if (bvalue === -1) {
      return `rgba(0,0,180,${alpha})`;
    }
    let val = Math.round(((bvalue - this.min) / (this.max - this.min)) * 255);
    let red = 255 - val;
    let green = val;
    return `rgba(${red},${green},0,${alpha})`;
  }

  /**
   * Get the background colour for the spreadsheet cells based on its allocation status and b value
   *
   * @public
   * @param {number} team - team i from 1 to m
   * @param {number} project - project j from 1 to n
   * @returns {string} The rgba string for a background
   */
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

  /**
   * Set the capability scalar value and update the b values
   *
   * @public
   * @param {number} capability - the scalar value for capability
   * @returns {void}
   */
  set_capability_scalar(capability: number): void {
    this.capability_scalar = capability;
    this.calculate_b_values();
  }

  /**
   * Set the preference scalar value and update the b values
   *
   * @public
   * @param {number} preference - the scalar value for preference
   * @returns {void}
   */
  set_preference_scalar(preference: number): void {
    this.preference_scalar = preference;
    this.calculate_b_values();
  }

  /**
   * Get the capability scalar value
   *
   * @public
   * @returns {number} The current capability scalar value
   */
  get_capability_scalar(): number {
    return this.capability_scalar;
  }

  /**
   * Get the preference scalar value
   *
   * @public
   * @returns {number} The current preference scalar values
   */
  get_preference_scalar(): number {
    return this.preference_scalar;
  }

  /**
   * Get the current allocations
   *
   * @public
   * @returns {number[][]} The current allocations
   */
  get_allocations(): number[][] {
    return this.allocations;
  }

  /**
   * Get the current rejections
   *
   * @public
   * @returns {number[][]} The current rejections
   */
  get_rejections(): number[][] {
    return this.rejections;
  }

  /**
   * Get all of the allocation sets generate
   *
   * @public
   * @returns {AllocationSet[]} The list of all AllocationSets stored
   */
  get_allocation_sets(): AllocationSet[] {
    return this.allocation_sets;
  }

  /**
   * Set the capability value for a specific pairing
   *
   * @public
   * @param {number} team - the team i from 1 to m
   * @param {number} project - the project j from 1 to n
   * @param {number} capability - the new capability value
   */
  set_capability_value(
    team: number,
    project: number,
    capability: number
  ): void {
    this.capability[team - 1][project - 1] = capability;
    this.calculate_b_values();
  }

  /**
   * Set the preference value for a specific pairing
   *
   * @public
   * @param {number} team - the team i from 1 to m
   * @param {number} project - the project j from 1 to n
   * @param {number} preference - the new preference value
   */
  set_preference_value(
    team: number,
    project: number,
    preference: number
  ): void {
    this.preference[team - 1][project - 1] = preference;
    this.calculate_b_values();
  }

  /**
   * Set the impact value for a specific pairing
   *
   * @public
   * @param {number} team - the team i from 1 to m
   * @param {number} project - the project j from 1 to n
   * @param {number} impact - the new impact value
   */
  set_impact_value(team: number, project: number, impact: number): void {
    this.impact[team - 1][project - 1] = impact;
    this.calculate_b_values();
  }

  /**
   * Get the number of teams each project can be allocated to
   *
   * @public
   * @returns {number[]} The number of teams each project can take, defaults to 1
   */
  get_num_teams_to_projects(): number[] {
    return this.num_teams_to_project;
  }

  /**
   * Set the number of teams project j can take
   *
   * @public
   * @param {number} teams - the number of teams the project can take
   * @param {number} project - the project j from 1 to n
   */
  set_num_teams_to_project(teams: number, project: number): void {
    this.num_teams_to_project[project - 1] = teams;
  }

  /**
   * Checks whether a team has an allocation
   *
   * @public
   * @param {number} teamID - the team counter number i from 1 to m
   * @returns {boolean} True if the team has an allocation, false otherwise
   */
  does_team_have_allocation(teamID: number): boolean | undefined {
    const teamAllocation = this.allocations.find(
      ([team, project]) => team === teamID
    );
    return teamAllocation && teamAllocation[1] !== 0;
  }

  /**
   * Checks whether the project is at maximum amounts of allocations
   *
   * @public
   * @param {number} projectID - the project counter number j from 1 to n
   * @returns {boolean} Whether the project can be allocated to another team
   */
  does_project_have_allocation(projectID: number): boolean {
    const allocatedTeamsCount = this.allocations.filter(
      ([team, project]) => project === projectID
    ).length;
    const maxTeamsForProject = this.num_teams_to_project[projectID - 1];

    return allocatedTeamsCount >= maxTeamsForProject;
  }

  /**
   * Checks whether a specific pairing ij is allocated
   *
   * @public
   * @param {number} team - team counter i from 1 to m
   * @param {number} project - project counter j from 1 to n
   * @returns {boolean} Whether the pairing ij is allocated
   */
  is_pairing_allocated(team: number, project: number): boolean {
    return this.allocations[team - 1][1] === project;
  }

  /**
   * Checks whether a specific pairing ij is rejected
   *
   * @public
   * @param {number} team - team counter i from 1 to m
   * @param {number} project - project counter j from 1 to n
   * @returns {boolean} Whether the pairing ij is rejected
   */
  is_pairing_rejected(team: number, project: number): boolean {
    return this.rejections.some((row) =>
      row.every((value, index) => value === [team, project][index])
    );
  }

  /**
   * Attempts to set a pairing allocation
   *
   * @public
   * @param {number} team - team counter i from 1 to m
   * @param {number} project - project counter j from 1 to n
   * @returns {AllocationResult} The result of attempting to make the allocation
   */
  set_allocation(team: number, project: number): AllocationResult {
    if (this.is_pairing_rejected(team, project)) {
      return {
        success: false,
        message: "Pairing is already rejected. Cannot allocate.",
      };
    }

    const currentAllocation = this.allocations[team - 1][1];
    if (currentAllocation === project) {
      return {
        success: true,
        message: "Team is already allocated to this project.",
      };
    }

    const projectCapacity = this.num_teams_to_project[project - 1];
    const currentProjectAllocations = this.allocations.filter(
      (row) => row[1] === project
    ).length;

    if (currentProjectAllocations >= projectCapacity) {
      return {
        success: false,
        message: "Project is at maximum capacity. Cannot allocate.",
      };
    }

    if (currentAllocation !== 0) {
      // Switching allocation
      this.allocations[team - 1][1] = project;
      return {
        success: true,
        message: "Allocation switched successfully.",
        warning: `Team was switched from project ${currentAllocation} to project ${project}.`,
      };
    }

    this.allocations[team - 1][1] = project;
    return {
      success: true,
      message: "Project allocated successfully.",
    };
  }

  /**
   * Attempts to remove an allocation
   *
   * @public
   * @param {number} team - team counter i from 1 to m
   * @param {number} project - project counter j from 1 to n
   * @returns {AllocationResult} The result of attempting to make the allocation
   */
  remove_allocation(team: number, project: number): AllocationResult {
    if (this.is_pairing_allocated(team, project)) {
      this.allocations[team - 1][1] = 0;
      return {
        success: true,
        message: "Allocation removed successfully.",
      };
    } else {
      return {
        success: false,
        message: "Pairing not allocated.",
      };
    }
  }

  /**
   * Attempts to reject a pairing
   *
   * @public
   * @param {number} team - team counter i from 1 to m
   * @param {number} project - project counter j from 1 to n
   * @returns {AllocationResult} The result of attempting to make the rejection
   */
  set_rejection(team: number, project: number): AllocationResult {
    if (this.allocations[team - 1][1] === project) {
      return {
        success: false,
        message: "Pairing is already allocated. Cannot reject.",
      };
    }

    if (!this.is_pairing_rejected(team, project)) {
      this.rejections.push([team, project]);
      return {
        success: true,
        message: "Project rejected successfully.",
      };
    } else {
      return {
        success: false,
        message: "Pairing already rejected.",
      };
    }
  }

  /**
   * Attempts to remove a rejected pairing
   *
   * @public
   * @param {number} team - team counter i from 1 to m
   * @param {number} project - project counter j from 1 to n
   * @returns {AllocationResult} The result of attempting to make the rejection
   */
  remove_rejection(team: number, project: number): AllocationResult {
    const index = this.rejections.findIndex(
      (row) => row[0] == team && row[1] == project
    );
    if (index !== -1) {
      this.rejections.splice(index, 1);
      return {
        success: true,
        message: "Rejection removed successfully.",
      };
    } else {
      return {
        success: false,
        message: "Pairing not rejected.",
      };
    }
  }

  /**
   * Runs the algorithm to produce an optimal allocation set
   * 
   * @public
   * @param {string} algorithm - an identifier to specify a specific algorithm
   */
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
          score: this.get_score_set(allocations),
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

  /**
   * Calculates the score based on the pairings from an allocation set
   * 
   * @public
   * @param {number[][]} allocation_set - the allocation set a score should be calculate for
   * @returns {number} The score of the allocation set
   */
  private calculateScoreFromAllocation(allocation_set: number[][]): number {
    let score = 0;
    for (let teamIndex = 0; teamIndex < allocation_set.length; teamIndex++) {
      for (const projectIndex of allocation_set[teamIndex]) {
        score += this.b[teamIndex][projectIndex];
      }
    }
    return score;
  }

  /**
   * Add a listener function that can be updated on data change
   * 
   * @public
   * @param {() => void} listener - a function that will be called on change
   */
  addListener(listener: () => void): void {
    this.listeners.add(listener);
  }

  /**
   * Removes a listener function from the listeners set
   * 
   * @public
   * @param {() => void} listener - the function to be removed
   */
  removeListener(listener: () => void): void {
    this.listeners.delete(listener);
  }

  /**
   * Calls all listeners, to update them on data changes
   * 
   * @public
   */
  notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  /**
   * Save the current state of the program in a local file on the pc
   * 
   * @public
   */
  saveState(): void {
    const generateFilename = (programName: string): string => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");

      return `${programName}_${year}-${month}-${day}_${hours}-${minutes}-${seconds}.ffas`;
    };
    const filename = generateFilename("FitForge");

    const currentState: State = {
      initial_impact: this.initial_impact,
      initial_capability: this.initial_capability,
      initial_preference: this.initial_preference,
      team_names: this.team_names,
      project_names: this.project_names,
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

  /**
   * Loads a save state from a specified file
   * 
   * @async
   * @public
   * @param {File} file - the file to read the save state from
   * @returns {Promise<void>} returns nothing async
   */
  async loadState(file: File): Promise<void> {
    const newState = await StateSaver.load(file);
    this.initial_impact = newState.initial_impact;
    this.initial_capability = newState.initial_capability;
    this.initial_preference = newState.initial_preference;
    this.team_names = newState.team_names;
    this.project_names = newState.project_names;
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
    console.log("Team Names: ", this.team_names);
    console.log("Project Names: ", this.project_names);
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
