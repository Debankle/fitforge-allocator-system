import { State } from "./interfaces";

class StateSaver {
  static save(filePath: string, data: State): void {
    const content = this.convertToFormat(data);
    this.writeToFile(filePath, content);
  }

  static load(filePath: string): State {
    const fileContent = this.readFromFile(filePath);
    return this.convertFromFormat(fileContent);
  }

  private static convertToFormat(data: State): string {
    return JSON.stringify(data);
  }

  private static convertFromFormat(content: string): State {
    return {
      fit_values: [[]],
      preference_values: [[]],
      fit_scalar: 0,
      preference_scalar: 0,
      num_teams_to_project: [],
      allocations: [[]],
      rejections: [[]],
      allocation_sets: [[[]]]
    };
  }

  private static writeToFile(filePath: string, content: string): void {
    console.log(filePath, content);
  }

  private static readFromFile(filePath: string): string {
    return filePath;
  }
}

export default StateSaver;
