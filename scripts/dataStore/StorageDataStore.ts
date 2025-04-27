import { ListBlockVolume, Vector3, world } from "@minecraft/server";
import { DataStore } from "./BaseDatastore";

export class StorageDataStore extends DataStore {
  private _currentLocations: Vector3[];

  constructor() {
    super();
    this._currentLocations = this.getStorageLocations() ? []: [];
  }

  /**
   * Returns the locations currently in datastore
   */
  public get currentLocations() {
    return this._currentLocations;
  }

  /**
   * Refreshes the cached locations inside the datastore
   */
  public resfreshCache() {
    this._currentLocations = this.getStorageLocations() ? []: [];
  }
  
  /**
   * 
   * @param chestLocations 
   * List of chest locations to save to dynamic property
   */
  public saveLocations(chestLocations: Vector3[]): void {
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
        console.error(`${JSON.stringify(error)}`);
      }
    }
    this.saveData(searchKey, JSON.stringify(locationsToSave));
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
      } catch(error) {
        console.error(`${JSON.stringify(error)}`);
      }
    }

    return chestLocationsResult;
  }
}