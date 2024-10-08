/**
 * Properties required for the setup of the backend data
 *
 * @param {number[][]} impact_vals - the impact values for each pairing.
 * @param {number[][]} capability_vals - the capability values for each pairing.
 * @param {number[]} preference_vals - the preference values for each pairing
 * @param {string[]} team_names - the visual name for each team
 * @param {string[]} project_names - the visual name for each project
 */
export interface Setup {
  impact_vals: number[][];
  capability_vals: number[][];
  preference_vals: number[][];
  team_names: string[];
  project_names: string[];
}

/**
 * Properties that dictate the state of the system
 *
 * @param {number[][]} initial_impact - The initial impact values before any modifications, for reference and rollback purposes.
 * @param {number[][]} initial_capability - The initial capability values before any modifications, for reference and rollback purposes.
 * @param {number[][]} initial_preference - The initial preference values before any modifications, for reference and rollback purposes.
 * @param {string[]} team_names - The names of the teams in the system, used for display and identification.
 * @param {string[]} project_names - The names of the projects in the system, used for display and identification.
 * @param {number[][]} impact - The current impact values after modifications and allocations.
 * @param {number[][]} capability - The current capability values after modifications and allocations.
 * @param {number[][]} preference - The current preference values after modifications and allocations.
 * @param {number} capability_scalar - A scalar value applied to the capability values to adjust their weight in calculations.
 * @param {number} preference_scalar - A scalar value applied to the preference values to adjust their weight in calculations.
 * @param {number[]} num_teams_to_project - The number of teams allocated to each project, used for managing project capacity.
 * @param {number[][]} allocations - The current allocation of teams to projects, where each entry represents a pairing of a team and a project.
 * @param {number[][]} rejections - The list of rejected pairings, where each entry represents a rejected team-project combination.
 * @param {AllocationSet[]} allocation_sets - The history or different sets of allocations, potentially representing different stages or solutions.
 * @param {InputStage} dataStage - The current stage of the input data, used to track progress through the allocation process.
 */
export interface State {
  initial_impact: number[][];
  initial_capability: number[][];
  initial_preference: number[][];
  team_names: string[];
  project_names: string[];
  impact: number[][];
  capability: number[][];
  preference: number[][];
  capability_scalar: number;
  preference_scalar: number;
  num_teams_to_project: number[];
  allocations: number[][];
  rejections: number[][];
  allocation_sets: AllocationSet[];
  dataStage: InputStage;
}

/**
 * The data representing a pairing of team to project
 *
 * @param {number} impact - the impact of this pairing
 * @param {number} capability - the capability of the team for the project
 * @param {number} preference - the preference of the team for the project
 */
export interface Pairing {
  impact: number;
  capability: number;
  preference: number;
  capability_scalar: number;
  preference_scalar: number;
  b_value: number;
  team: number;
  project: number;
}

/**
 * A set of allocations that came from an algorithm
 * 
 * @param {number[][]} allocation - the allocation set outputted by the algorithm
 * @param {string} algorithm - a string naming the algorithm used
 * @param {number} score - the score of the allocation set
 * @param {number} runCount - an identifier for the order of allocation sets
 */
export interface AllocationSet {
  allocation: number[][];
  algorithm: string;
  score: number;
  runCount: number;
}

export type NavPage =
  | "Upload"
  | "TeamsToProjects"
  | "Algorithm"
  | "Allocations"
  | "Rejections"
  | "ProjectList"
  | "TeamList"
  | "Spreadsheet"
  | "FullList"
  | "PairingTest";

export type AllocationState = "Allocated" | "Rejected" | "Neither";

export type InputStage = "Stage1" | "Stage2";

export interface PageView {
  page: NavPage;
  data: any;
}

export type AllocationResult = {
  success: boolean;
  message: string;
  warning?: string;
};
