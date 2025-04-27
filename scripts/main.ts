import { world, system, EntityInventoryComponent, Vector3, BlockVolume, Dimension, BlockInventoryComponent } from "@minecraft/server";
import { MinecraftBlockTypes, MinecraftDimensionTypes } from "@minecraft/vanilla-data";
import { arrayUnique } from "./helpers/Utilities";
import { StorageLocations } from "./dataStore/models/StorageDatastore";

const ADDON_DEBUG = true;
const SEARCH_VOLUME_DELTA = 250;
const INITIALIZE_DELAY = 100;
const SHORT_WORKLOAD_TIME = 250;
const LONG_WORKLOAD_TIME = 1000;

let ticksSinceLoad = 0;
let chestLocations: Vector3[] = [];
let storageTypes: string[] = [];
let once = true;
const storageDatastore = new StorageLocations();

function mainTick() {
  // Keep track of in game time ticks
  ticksSinceLoad++;
  
  if (ticksSinceLoad % INITIALIZE_DELAY == 0 && once) {
    once = false
    world.sendMessage("Initializing economy...")
    initialize();
  } 

  // Quick workloads
  if (ticksSinceLoad % SHORT_WORKLOAD_TIME == 0) {
    world.sendMessage("Scanning for economy...")
    let currentEconomy: { [id: string]: number } = {};

    let chestItems = scanChests();
    for (let item of chestItems) {
      if (item in currentEconomy) {
        currentEconomy[item] += 1;
      } else {
        currentEconomy[item] = 1;
      }
    }

    // Scan players inventories
    let playerInventoryItems = scanInventories();
    for (let item of playerInventoryItems) {
      if (item in currentEconomy) {
        currentEconomy[item] += 1;
      } else {
        currentEconomy[item] = 1;
      }

      if (ADDON_DEBUG) {
        world.sendMessage(`${JSON.stringify(world.getDynamicPropertyIds())}`)
      }
    }

    if (ADDON_DEBUG) {
      world.sendMessage(`Blocks in economy: ${JSON.stringify(currentEconomy, null, 4)}`)
    }
  }

  // Longer work loads
  if (ticksSinceLoad % LONG_WORKLOAD_TIME == 0) {
    world.sendMessage("Scanning for storage blocks...")
    // Find and scan chests
    chestLocations = findChests()
  }

  system.run(mainTick);
}

function findChests() {
  let worldDimension = world.getDimension(MinecraftDimensionTypes.Overworld);
  // get players' location in order to calculate search radius
  let players = world.getAllPlayers();
  let foundChests = [];

  for (let player of players) {
    let searchVolumeTo = { x: player.location.x - SEARCH_VOLUME_DELTA, y: worldDimension.heightRange.min, z: player.location.z - SEARCH_VOLUME_DELTA } as Vector3;
    let searchVolumeFrom = { x: player.location.x + SEARCH_VOLUME_DELTA, y: worldDimension.heightRange.max, z: player.location.z + SEARCH_VOLUME_DELTA } as Vector3;
    let searchVolume = new BlockVolume(searchVolumeFrom, searchVolumeTo);
    let chests = worldDimension.getBlocks(
      searchVolume, 
      { 
        includeTypes: storageTypes
      }, 
      true);
    for (let chest of chests.getBlockLocationIterator()) {
      foundChests.push(chest);   
    }
  }
  storageDatastore.saveLocations(foundChests);
  return arrayUnique(chestLocations, foundChests);
}

/**
 * Returns list of minecraft block types that can contain items (Storage Blocks)
 * 
 * @remarks
 * This function creates and destroys blocks
 * 
 * @returns list of minecraft block types that can contain items
 */
function getStorageBlocks() {
  let storageBlocks:string[] = [];
  let overworld: Dimension = world.getDimension(MinecraftDimensionTypes.Overworld);
  let formerTestBlock;
  let formerBedrockBlock;
  let bedrockBlockLocation: Vector3 = { x: 0, y: overworld.heightRange.max - 2, z: 0}
  let testBoxLocation: Vector3 = { x: 0, y: overworld.heightRange.max - 1 , z: 0};
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

function scanChests() {
  let overworld = world.getDimension(MinecraftDimensionTypes.Overworld);
  let chestBlocks = [];
  for (let chest of chestLocations) {
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

function scanInventories() {
  let players = world.getPlayers();
  let updatedKnownBlocks: string[] = [];
  for (let player of players) {
    let playerInventory = player.getComponent("inventory") as EntityInventoryComponent;
    let invContainer = playerInventory.container;
    if (invContainer !== undefined) {
      for (let i = 0; i < invContainer.size; i++) {
        let invItem = invContainer.getItem(i);

        if (invItem !== undefined) {
          for (let i = 0; i < invItem.amount; i++) {
            updatedKnownBlocks.push(invItem.typeId);
          }          
        }
      }
    }   
  }
  return updatedKnownBlocks;
}

function initialize() {
  // Calculate which Minecraft Block Types are storage blocks
  let now = new Date();
  world.sendMessage(`Start storage block scanning: ${now}`)
  storageTypes = getStorageBlocks();
  now = new Date();
  world.sendMessage(`End storage block scanning: ${now}`)

  // Load saved chest location data if there is any
  world.sendMessage(`Starting load saved chest locations: ${now}`)
  let savedLocations = storageDatastore.getStorageLocations();
  if (savedLocations !== undefined) {
    chestLocations = savedLocations;
    world.sendMessage(`Chests loaded: ${JSON.stringify(chestLocations)}`)
  }
  now = new Date();
  world.sendMessage(`End load saved chest locations: ${now}`)
  world.sendMessage(`${JSON.stringify(storageTypes)}`);
}

system.run(mainTick);
