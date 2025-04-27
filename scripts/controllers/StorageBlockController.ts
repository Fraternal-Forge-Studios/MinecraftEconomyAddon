import { BlockInventoryComponent, BlockVolume, Dimension, Vector3, world } from '@minecraft/server';
import { StorageDataStore } from '../dataStore/StorageDataStore';
import { MinecraftBlockTypes, MinecraftDimensionTypes } from '@minecraft/vanilla-data';
import { arrayUnique } from '../helpers/Utilities';
import { PlayerController } from './PlayerController';

/**
 * Controller responsible for interacting with storage blocks
 */
export class StorageBlockController {
  private _SEARCH_VOLUME_DELTA = 250;
  private _dataStore: StorageDataStore;
  private _storageBlockTypes: string[];
  private _currentLocations: Vector3[];
  private _playerController: PlayerController;

  constructor() {
    this._dataStore = new StorageDataStore();
    this._currentLocations = this._dataStore.getStorageLocations() || [];
    this._storageBlockTypes = this.getStorageBlockTypes();
    this._playerController = new PlayerController();
  }

  /**
   * Gets currently found chest locations
   */
  public get currentLocations() {
    return this._currentLocations;
  }

  /**
   * 
   * @returns 
   * Returns list of block type ids of block inside known storage blocks
   */
  public scanStorageBlocks(): string[] {
    let overworld = world.getDimension(MinecraftDimensionTypes.Overworld);
    let chestBlocks = [];
    for (let chest of this._currentLocations) {
      let chestBlock = overworld.getBlock(chest);
      if (chestBlock !== undefined) {
        let chestInventory = chestBlock.getComponent("inventory") as BlockInventoryComponent;
        if (chestInventory !== undefined) {
          let chestContainer = chestInventory.container;
          if (chestContainer !== undefined) {
            for (let i = 0; i < chestContainer.size; i++) {
              let inventoryItem = chestContainer.getItem(i);
              if (inventoryItem !== undefined) {
                for (let i = 0; i < inventoryItem.amount; i++) {
                  chestBlocks.push(inventoryItem.typeId);
                }
              } 
            }
          }
        }
      }
    }  
    return chestBlocks;
  }

  /**
   * Returns list of minecraft block types that can contain items (Storage Blocks)
   * 
   * @remarks
   * This function creates and destroys blocks
   * 
   * @returns list of minecraft block types that can contain items
   */
  public getStorageBlockTypes() {
    let storageBlocks:string[] = [];
    let overworld: Dimension = world.getDimension(MinecraftDimensionTypes.Overworld);
    let player = world.getPlayers()[0];
    let formerTestBlock;
    let formerBedrockBlock;
    let bedrockBlockLocation: Vector3 = { x: player.location.x + 5, y: overworld.heightRange.max - 2, z: player.location.z + 5};
    let testBoxLocation: Vector3 = { x: bedrockBlockLocation.x , y: overworld.heightRange.max - 1 , z: bedrockBlockLocation.z};

    formerBedrockBlock = overworld.getBlock(bedrockBlockLocation)?.typeId;
    formerTestBlock = overworld.getBlock(testBoxLocation)?.typeId;
    overworld.setBlockType(bedrockBlockLocation, MinecraftBlockTypes.Bedrock);
    
    // Loop through block types
    for (let blockType in MinecraftBlockTypes) {
      try {
        // Set test block to next block type in enum
        overworld.setBlockType(testBoxLocation, blockType);
      } catch(error) {
        continue
      }
      // Gets the block so we can look for properties
      let testBlock = overworld.getBlock(testBoxLocation);
      if (testBlock !== undefined) {
        // Get test block's inventory component
        let testInventory = testBlock.getComponent("inventory");
        // Check to see if inventory comonent exists. If it does it is storage
        if (testInventory !== undefined) {
          storageBlocks.push(testBlock.typeId);
        }
      }
    }

    // Clean up and return world back to what it was
    overworld.setBlockType(testBoxLocation, formerTestBlock || MinecraftBlockTypes.Air);
    overworld.setBlockType(bedrockBlockLocation, formerBedrockBlock || MinecraftBlockTypes.Air);

    return storageBlocks
  }


  /**
   * Updates the internal field that defines all storage type blocks in minecraft
   */
  public findNewStorageBlocks(): void {
    let worldDimension = world.getDimension(MinecraftDimensionTypes.Overworld);
    // get players' location in order to calculate search radius
    let players = world.getAllPlayers();
    let foundChests = [];

    for (let player of players) {
      let searchVolumeTo = { x: player.location.x - this._SEARCH_VOLUME_DELTA, y: worldDimension.heightRange.min, z: player.location.z - this._SEARCH_VOLUME_DELTA } as Vector3;
      let searchVolumeFrom = { x: player.location.x + this._SEARCH_VOLUME_DELTA, y: worldDimension.heightRange.max, z: player.location.z + this._SEARCH_VOLUME_DELTA } as Vector3;
      let searchVolume = new BlockVolume(searchVolumeFrom, searchVolumeTo);
      let chests = worldDimension.getBlocks(
        searchVolume, 
        { 
          includeTypes: this._storageBlockTypes
        }, 
        true);
      for (let chest of chests.getBlockLocationIterator()) {
        foundChests.push(chest);   
      }
    }
    this._dataStore.saveLocations(foundChests);
    
    this._currentLocations =  arrayUnique(this._currentLocations, foundChests);
  }
}