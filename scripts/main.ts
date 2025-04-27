import { world, system } from "@minecraft/server";
import { StorageBlockController } from "./controllers/StorageBlockController";
import { PlayerController } from "./controllers/PlayerController";

const ADDON_DEBUG = true;

const INITIALIZE_DELAY = 100;
const SHORT_WORKLOAD_TIME = 250;
const LONG_WORKLOAD_TIME = 1000;

let ticksSinceLoad = 0;
let once = true;
let storageBlockController: StorageBlockController = new StorageBlockController();
let playerController: PlayerController = new PlayerController();

function mainTick() {
  // Keep track of in game time ticks
  ticksSinceLoad++;

  // Runs every time the addon is loaded once after a set delay
  if (ticksSinceLoad % INITIALIZE_DELAY == 0 && once) {
    once = false
    world.sendMessage("Initializing economy...")
    initialize();
  } 

  // Frequent workloads
  if (ticksSinceLoad % SHORT_WORKLOAD_TIME == 0) {
    world.sendMessage("Scanning for economy...")
    let currentEconomy: { [id: string]: number } = {};

    // Scan storage known storage blocks for inventory
    let itemsInStorageBlocks = storageBlockController.scanStorageBlocks();
    for (let item of itemsInStorageBlocks) {
      if (item in currentEconomy) {
        currentEconomy[item] += 1;
      } else {
        currentEconomy[item] = 1;
      }
    }

    // Scan players inventories
    let itemsInPlayerInventories = playerController.scanInventories();
    for (let item of itemsInPlayerInventories) {
      if (item in currentEconomy) {
        currentEconomy[item] += 1;
      } else {
        currentEconomy[item] = 1;
      }
    }

    if (ADDON_DEBUG) {
      world.sendMessage(`Blocks in economy: ${JSON.stringify(currentEconomy, null, 4)}`)
    }
  }

  // Infrequent worloads
  if (ticksSinceLoad % LONG_WORKLOAD_TIME == 0) {
    world.sendMessage("Scanning for storage blocks...")

    // Find and scan chests
    storageBlockController.findNewStorageBlocks();
  }

  system.run(mainTick);
}

function initialize() {
  world.sendMessage(`${JSON.stringify("INITIALIZE")}`);
}

system.run(mainTick);
