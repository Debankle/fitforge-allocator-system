import { multiply, add } from "mathjs";

type SheetData = number[][];
type PreferencesMatrix = number[][];
interface MatchResults {
  teamMatches: Record<string, string>;
  totalScore: number;
}

// Reads data into 2D Array
const readSheet = (filePath: string, sheetName: string): SheetData => {
  // const workbook = xlsx.readFile(filePath);
  // const sheet = workbook.Sheets[sheetName];
  // const data = xlsx.utils.sheet_to_json(sheet, { header: 1 }) as (string | number)[][];

  // // Remove the header row and convert the data to numbers
  // return data.slice(1).map(row => row.slice(1).map(cell => Number(cell)));
  return [[]];
};

const df = [[]];
const dg = [[]];
const db = [[]];

// Merge the three sheets into one data sheet - asumming third sheet is 1 and 0's for if they are compatible at all
const mergePreferences = (
  df: SheetData,
  db: SheetData,
  dg: SheetData
): PreferencesMatrix => {
  const combinedPreferences = add(df, db);
  return multiply(combinedPreferences, dg) as PreferencesMatrix;
};

// Main allocation algorithm
const algo = (df: SheetData, db: SheetData, dg: SheetData): MatchResults => {
  const combinedPreferences = mergePreferences(df, db, dg);
  const teamMatches: Record<string, string> = {};
  const projectMatches: Record<string, string> = {};
  const allocatedProjects = new Set<string>();

  const freeTeams = [...Array(df.length).keys()];

  //Iterates over teams
  while (freeTeams.length > 0) {
    const teamIndex = freeTeams.shift()!;
    const preferences = combinedPreferences[teamIndex]
      .map((score, index) => ({ score, index }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    // Gale
    for (const { index: projectIndex } of preferences) {
      if (!allocatedProjects.has(projectIndex.toString())) {
        teamMatches[teamIndex.toString()] = projectIndex.toString();
        projectMatches[projectIndex.toString()] = teamIndex.toString();
        allocatedProjects.add(projectIndex.toString());
        break;
      } else {
        const currentTeamIndex = parseInt(
          projectMatches[projectIndex.toString()]
        );
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

  const totalScore = Object.entries(teamMatches).reduce(
    (sum, [team, project]) => {
      return sum + combinedPreferences[parseInt(team)][parseInt(project)];
    },
    0
  );

  return { teamMatches, totalScore };
};

const { teamMatches, totalScore } = algo(df, db, dg);
