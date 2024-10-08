import { multiply, add } from 'mathjs';

type SheetData = number[][];
type PreferencesMatrix = number[][];
interface MatchResults {
  teamMatches: Record<string, string>;
  totalScore: number;
}

const calculateBValues = (fitValues: SheetData, preferenceValues: SheetData, fitScalar: number = 1, prefScalar: number = 1): SheetData => {
  const numTeams = fitValues.length;
  const numProjects = fitValues[0].length;
  const bValues: SheetData = Array.from({ length: numTeams }, () => Array(numProjects).fill(0));

  let max = -Infinity;
  let min = Infinity;

  for (let i = 0; i < numTeams; i++) {
    for (let j = 0; j < numProjects; j++) {
      const bValue = fitScalar * fitValues[i][j] + prefScalar * preferenceValues[i][j];
      bValues[i][j] = bValue;
      if (bValue > max) max = bValue;
      if (bValue < min) min = bValue;
    }
  }

  const range = max - min;
  if (range > 0) {
    for (let i = 0; i < numTeams; i++) {
      for (let j = 0; j < numProjects; j++) {
        bValues[i][j] = (bValues[i][j] - min) / range;
      }
    }
  }
  return bValues;
};

export const runGaleShapley = (fitValues: SheetData, preferenceValues: SheetData, fitScalar: number = 1, prefScalar: number = 1): number[][] => {
  // Calculate b_values
  const bValues = calculateBValues(fitValues, preferenceValues, fitScalar, prefScalar);

  const numTeams = fitValues.length;
  const numProjects = fitValues[0].length;
  const allocation_set: number[][] = Array.from({ length: numTeams }, () => []);

  const teamMatches: Record<string, string> = {};
  const projectMatches: Record<string, string> = {};
  const allocatedProjects = new Set<string>();

  const freeTeams = [...Array(numTeams).keys()].map(i => i + 1); // Adjusted to start from 1

  while (freeTeams.length > 0) {
    const teamIndex = freeTeams.shift()! - 1; // Adjusted for zero-based indexing
    const preferences = bValues[teamIndex]
      .map((score, index) => ({ score, index }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);

    for (const { index: projectIndex } of preferences) {
      if (!allocatedProjects.has((projectIndex + 1).toString())) { // Adjusted to start from 1
        teamMatches[(teamIndex + 1).toString()] = (projectIndex + 1).toString(); // Adjusted to start from 1
        projectMatches[(projectIndex + 1).toString()] = (teamIndex + 1).toString(); // Adjusted to start from 1
        allocatedProjects.add((projectIndex + 1).toString()); // Adjusted to start from 1
        allocation_set[teamIndex].push(projectIndex + 1); // Adjusted to start from 1
        break;
      } else {
        const currentTeamIndex = parseInt(projectMatches[(projectIndex + 1).toString()]) - 1; // Adjusted for zero-based indexing
        const currentRank = bValues[currentTeamIndex][projectIndex];
        const newRank = bValues[teamIndex][projectIndex];
        if (newRank > currentRank) {
          delete teamMatches[(currentTeamIndex + 1).toString()]; // Adjusted to start from 1
          teamMatches[(teamIndex + 1).toString()] = (projectIndex + 1).toString(); // Adjusted to start from 1
          projectMatches[(projectIndex + 1).toString()] = (teamIndex + 1).toString(); // Adjusted to start from 1
          allocation_set[currentTeamIndex] = allocation_set[currentTeamIndex].filter(proj => proj !== (projectIndex + 1)); // Adjusted to start from 1
          allocation_set[teamIndex].push(projectIndex + 1); // Adjusted to start from 1
          freeTeams.push(currentTeamIndex + 1); // Adjusted to start from 1
          break;
        }
      }
    }
  }

  return allocation_set;
};

