import { ListBlockVolume, Vector3, world } from "@minecraft/server";

export class DataStore {
  private DATASTORE_KEY: string = "minecraft-economy";
  constructor() {}

  /**
   * 
   * @param chestLocations 
   * List of chest locations to save to dynamic property
   */
  public saveChestLocations(chestLocations: Vector3[]): void {
    world.sendMessage(`SAVING CHEST LOCATIONS`);
    let searchKey = `${this.DATASTORE_KEY}:chest-locations`;
    let currentLocationsString = world.getDynamicProperty(searchKey);
    let locationsToSave = chestLocations;

    if (currentLocationsString !== undefined) {
      try {
        let currentLocations: Vector3[] = JSON.parse(currentLocationsString.toString());
        locationsToSave = currentLocations;
        let blockVolume = new ListBlockVolume(currentLocations);

        for (let location of chestLocations) {
          if (!blockVolume.isInside(location)) {
            
            locationsToSave.push(location);
          }
        }
      } catch(error) {
        world.sendMessage(`${JSON.stringify(error)}`);
      }
    }
    this.saveData(searchKey, JSON.stringify(locationsToSave));
    world.sendMessage(`CHEST LOCATIONS SAVED`);
  }

  /**
   * 
   * @returns 
   * Returns a list of Vector3 locations of storage block locations
   */
  public getStorageLocations(): Vector3[] | undefined {
    let searchKey = `${this.DATASTORE_KEY}:chest-locations`;
    let resultString = this.getData(searchKey);
    let chestLocationsResult = undefined;
    if (resultString !== undefined) {
      try {
        chestLocationsResult = JSON.parse(resultString.toString());
        world.sendMessage(`CHESTS LOADED: ${JSON.stringify(chestLocationsResult)}`);
      } catch(error) {
        world.sendMessage(`ERROR: ${JSON.stringify(error)}`);
      }
    }

    return chestLocationsResult;
  }

  /**
   * 
   * @param key 
   * Key used to store data from dynamic properties. Appended to DATASTORE_KEY
   * 
   * @param data 
   * String representation of object wanting to be stored
   */
  private saveData(key: string, data: string): void {
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
  private getData(key: string): string | undefined {
    let result = undefined;
    let resultString = world.getDynamicProperty(`${this.DATASTORE_KEY}:${key}`);
    if (resultString !== undefined) {
      result = resultString.toString();
    }
    return result;
  }
}