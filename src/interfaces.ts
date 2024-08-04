export interface Setup {
  impact_vals: number[][];
  capability_vals: number[][];
  preference_vals: number[][];
}

export interface State {
  initial_impact: number[][];
  initial_capability: number[][];
  initial_preference: number[][];
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
  | "Spreadsheet";

export type InputStage = "Stage1" | "Stage2";

export interface PageView {
  page: NavPage;
  data: any;
}
