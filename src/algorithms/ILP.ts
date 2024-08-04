import solver from "javascript-lp-solver";

interface Constraints {
  [key: string]: { max: number };
}

interface Variables {
  [key: string]: { score: number } & { [key: string]: number };
}

interface AllocatorReturn {
  [key: string]: boolean | number | boolean | number[];
}

const ILPAllocator = (
  bvalues: number[][],
  allocations: number[][],
  rejections: number[][],
  allocNums: number[]
): AllocatorReturn => {
  const m = bvalues.length;
  const n = bvalues[0].length;
  const constraints: Constraints = {};
  const variables: Variables = {};

  for (var i = 1; i < m + 1; i++) {
    constraints[`T${i}`] = { max: 1 };
  }
  for (var j = 1; j < n + 1; j++) {
    constraints[`P${j}`] = { max: allocNums[j - 1] };
  }

  for (var i = 1; i < m + 1; i++) {
    for (var j = 1; j < n + 1; j++) {
      variables[`x_${i}_${j}`] = {
        score: bvalues[i - 1][j - 1],
      };
      for (var p = 1; p < m + 1; p++) {
        variables[`x_${i}_${j}`][`T${p}`] = 0;
      }
      for (var q = 1; q < n + 1; q++) {
        variables[`x_${i}_${j}`][`P${q}`] = 0;
      }
      variables[`x_${i}_${j}`][`T${i}`] = 1;
      variables[`x_${i}_${j}`][`P${j}`] = 1;
    }
  }

  for (var i = 1; i < allocations.length; i++) {
    if (allocations[i][1] != 0) {
      variables[`x_${allocations[i][0]}_${allocations[i][1]}`]["score"] = 999999;
    }
  }

  for (var j = 1; j < rejections.length; j++) {
    variables[`x_${rejections[j][0]}_${rejections[j][1]}`]["score"] = -999999;
  }

  const model = {
    optimize: "score",
    opType: "max",
    constraints: constraints,
    variables: variables,
  };

  return solver.Solve(model);
};

export default ILPAllocator;
