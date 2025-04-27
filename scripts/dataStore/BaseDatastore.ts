import { world } from "@minecraft/server";

export class DataStore {

  protected DATASTORE_KEY: string = "minecraft-economy";
  protected jsonString: string = "";
  protected dataObj = undefined;

  constructor() {}

  /**
   * 
   * @param key 
   * Key used to store data from dynamic properties. Appended to DATASTORE_KEY
   * 
   * @param data 
   * String representation of object wanting to be stored
   */
  protected saveData(key: string, data: string): void {
    world.setDynamicProperty(`${this.DATASTORE_KEY}:${key}`, data);
  }

  /**
   * 
   * @param key 
   * Key used to retrieve data from dynamic properties. Appended to DATASTORE_KEY
   * 
   * @returns
   * Returns string representation of object stored in the dynamic property 
   */
  protected getData(key: string): string | undefined {
    let result = undefined;
    let resultString = world.getDynamicProperty(`${this.DATASTORE_KEY}:${key}`);
    if (resultString !== undefined) {
      result = resultString.toString();
    }
    return result;
  }
}