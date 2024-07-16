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
