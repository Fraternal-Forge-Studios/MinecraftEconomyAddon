import { world } from "@minecraft/server";

export class DataStore {
  protected DYNAMIC_PROPERTY_SIZE_LIMIT = 32767;
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
    if (data.length > this.DYNAMIC_PROPERTY_SIZE_LIMIT) {
      let dataChunks = this.shardData(data);
      for (let i = 0; i < dataChunks.length; i++) {
        world.setDynamicProperty(`${key}:${i}`, dataChunks[i]);
      }
    } else {
      world.setDynamicProperty(`${key}:0`, data);
    }
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
    let shardKeys = this.getDataShards(key);
    let resultString = "";
    for (let shardKey of shardKeys) {
      let shardedResult = world.getDynamicProperty(shardKey);
      if (shardKey !== undefined) {
        resultString += shardedResult;
      }
    }
    return resultString;
  }

  /**
   *
   * @param data
   * String represented JSON object that is over the size limit
   *
   * @returns
   * List of chunks of the data provided to fit size limits
   */
  private shardData(data: string): string[] {
    let shardedData: string[] = [];
    let chunkedData = data.match(new RegExp(`.{1,${this.DYNAMIC_PROPERTY_SIZE_LIMIT}}`, "g"));
    if (chunkedData != null) {
      shardedData = this.DYNAMIC_PROPERTY_SIZE_LIMIT > 0 ? chunkedData : [data];
    }
    return shardedData;
  }

  /**
   *
   * @param key
   * Key to search for that shards contain.
   *
   * Example:
   *
   *  SHARD 1: minecraft-economy:chest-locations:1
   *  SHARD 2: minecraft-economy:chest-locations:2
   *
   * @returns
   * List of DynamicPropertyIds that pertain to data key provided
   *
   * @remarks
   * This sharding technique is so we can get past the size
   * constraints given to world dynamic properties
   */
  private getDataShards(key: string): string[] {
    let dynamicPropertyIds = world.getDynamicPropertyIds();
    let shardIds = [];
    for (let propertyId of dynamicPropertyIds) {
      if (propertyId.includes(key)) {
        shardIds.push(propertyId);
      }
    }

    return shardIds;
  }
}
