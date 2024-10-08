import { State } from "./interfaces";

class StateSaver {
  static async save(filename: string, data: State): Promise<void> {
    const content = this.convertToFormat(data);
    const blob = new Blob([content], { type: "application/txt" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(href);
  }

  static async load(file: File): Promise<State> {
    const fileContent = await this.readFromFile(file);
    return this.convertFromFormat(fileContent);
  }

  private static convertToFormat(data: State): string {
    return "<FFASv1.0>\n" + JSON.stringify(data);
  }

  private static convertFromFormat(content: string): State {
    try {
      const parsedState: State = JSON.parse(content);
      return parsedState;
    } catch (error) {
      throw new Error("Error parsing JSON: " + error);
    }
  }

  private static readFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const fileText = e.target.result as string;
          const splitFileContent = fileText.split("\n");
          if (
            splitFileContent.length == 2 &&
            splitFileContent[0] == "<FFASv1.0>"
          ) {
            resolve(splitFileContent[1]);
          } else {
            reject(new Error("Invalid File format"));
          }
        } else {
          reject(new Error("File reading error"));
        }
      };
      reader.onerror = () => {
        reject(new Error("File reading error"));
      };
      reader.readAsText(file);
    });
  }
}

export default StateSaver;
