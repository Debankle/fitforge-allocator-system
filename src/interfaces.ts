export interface Setup {
  fit_vals: number[][];
  pref_vals: number[][];
  num_teams_to_project: number[];
}

export interface State {
  fit_values: number[][];
  preference_values: number[][];
  fit_scalar: number;
  preference_scalar: number;
  num_teams_to_project: number[];
  allocations: number[][];
  rejections: number[][];
  allocation_sets: AllocationSet[];
}

export interface Pairing {
  fit_value: number;
  pref_value: number;
  fit_scalar: number;
  pref_scalar: number;
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
  | "Algorithm"
  | "Allocations"
  | "Rejections"
  | "ProjectList"
  | "TeamList"
  | "Spreadsheet";

export interface PageView {
  page: NavPage;
  data: any;
}
