import { ListBlockVolume, Vector3, world } from "@minecraft/server";
import { DataStore } from "./BaseDatastore";

export class StorageDataStore extends DataStore {
  private _currentLocations: Vector3[];

  constructor() {
    super();
    this._currentLocations = this.getStorageLocations() ? []: [];
  }

  public get currentLocations() {
    return this._currentLocations;
  }

  public resfreshCache() {
    this._currentLocations = this.getStorageLocations() ? []: [];
  }
  
  /**
   * 
   * @param chestLocations 
   * List of chest locations to save to dynamic property
   */
  public saveLocations(chestLocations: Vector3[]): void {
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
}