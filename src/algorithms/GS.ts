import { multiply, add } from 'mathjs';

type SheetData = number[][];
type PreferencesMatrix = number[][];
interface MatchResults {
  teamMatches: Record<string, string>;
  totalScore: number;
}

export const mergePreferences = (df: SheetData, db: SheetData, dg: SheetData): PreferencesMatrix => {
  const combinedPreferences = add(df, db);
  return multiply(combinedPreferences, dg) as PreferencesMatrix;
};

export const runGaleShapley = (fitValues: SheetData, preferenceValues: SheetData, bValues: SheetData): MatchResults => {
  const combinedPreferences = mergePreferences(fitValues, preferenceValues, bValues);
  const teamMatches: Record<string, string> = {};
  const projectMatches: Record<string, string> = {};
  const allocatedProjects = new Set<string>();

  const freeTeams = [...Array(fitValues.length).keys()];

  while (freeTeams.length > 0) {
    const teamIndex = freeTeams.shift()!;
    const preferences = combinedPreferences[teamIndex]
      .map((score, index) => ({ score, index }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);

    for (const { index: projectIndex } of preferences) {
      if (!allocatedProjects.has(projectIndex.toString())) {
        teamMatches[teamIndex.toString()] = projectIndex.toString();
        projectMatches[projectIndex.toString()] = teamIndex.toString();
        allocatedProjects.add(projectIndex.toString());
        break;
      } else {
        const currentTeamIndex = parseInt(projectMatches[projectIndex.toString()]);
        const currentRank = combinedPreferences[currentTeamIndex][projectIndex];
        const newRank = combinedPreferences[teamIndex][projectIndex];
        if (newRank > currentRank) {
          delete teamMatches[currentTeamIndex.toString()];
          teamMatches[teamIndex.toString()] = projectIndex.toString();
          projectMatches[projectIndex.toString()] = teamIndex.toString();
          freeTeams.push(currentTeamIndex);
          break;
        }
      }
    }
  }

  const totalScore = Object.entries(teamMatches).reduce((sum, [team, project]) => {
    return sum + combinedPreferences[parseInt(team)][parseInt(project)];
  }, 0);

  return { teamMatches, totalScore };
};
