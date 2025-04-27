import { world } from "@minecraft/server";

export class Logger {
  private _name;

  constructor(name: string) {
    this._name = name;
  }

  /**
   * 
   * @param severity 
   * What severity level to translate
   * 
   * @returns 
   * Returns human readable version of severity level
   */
  private translateSeverity(severity: number): string {
    let severityText = "";
    switch(severity) {
      case 0: {
        severityText = "ERROR";
        break;
      }
      case 1: {
        severityText = "WARN";
        break;
      }
      case 2: {
        severityText = "INFO";
        break;
      }
      case 3: {
        severityText = "DEBUG";
        break;
      }
      default: {
        severityText = "THIS SHOULDNT HAPPEN";
      }
    }

    return severityText;
  }

  /**
   * 
   * @param message 
   * Message to display as log text
   * 
   * @param severity 
   * How severe is the log message
   */
  public log(message: string, severity: number = 2) {
    let formatedMessage = `[${this.translateSeverity(severity)}] [${this._name}] ${message}`;
    world.sendMessage(formatedMessage);
  }
}