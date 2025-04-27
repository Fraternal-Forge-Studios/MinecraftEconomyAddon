import { system } from "@minecraft/server";
import { StorageBlockController } from "./controllers/StorageBlockController";
import { PlayerController } from "./controllers/PlayerController";
import { Logger } from "./helpers/Logger";

const ADDON_DEBUG = true;
const INITIALIZE_DELAY = 150;
const SHORT_WORKLOAD_TIME = 250;
const LONG_WORKLOAD_TIME = 1000;

const logger = new Logger("ME-Main");

let ticksSinceLoad = 0;
let once = true;

let storageBlockController: StorageBlockController;
let playerController: PlayerController;

function mainTick() {
  // Keep track of in game time ticks
  ticksSinceLoad++;

  // Runs every time the addon is loaded once after a set delay
  if (ticksSinceLoad % INITIALIZE_DELAY == 0 && once) {
    once = false
    logger.log("Initializing economy")
    initialize();
  } 

  // Frequent workloads
  if (ticksSinceLoad % SHORT_WORKLOAD_TIME == 0) {
    logger.log("Scanning for economy")
    let currentEconomy: { [id: string]: number } = {};

    // Scan storage known storage blocks for inventory
    logger.log("Scanning known storage blocks")
    let itemsInStorageBlocks = storageBlockController.scanStorageBlocks();
    for (let item of itemsInStorageBlocks) {
      if (item in currentEconomy) {
        currentEconomy[item] += 1;
      } else {
        currentEconomy[item] = 1;
      }
    }

    // Scan players inventories
    logger.log("Scanning known player inventories")
    let itemsInPlayerInventories = playerController.scanInventories();
    for (let item of itemsInPlayerInventories) {
      if (item in currentEconomy) {
        currentEconomy[item] += 1;
      } else {
        currentEconomy[item] = 1;
      }
    }

    if (ADDON_DEBUG) {
      logger.log(`Blocks in economy: ${JSON.stringify(currentEconomy, null, 4)}`)
    }
  }

  // Infrequent worloads
  if (ticksSinceLoad % LONG_WORKLOAD_TIME == 0) {
    logger.log("Searching for new storage blocks")

    // Find and scan chests
    storageBlockController.findNewStorageBlocks();
  }

  system.run(mainTick);
}

function initialize() {
  storageBlockController = new StorageBlockController();
  playerController = new PlayerController();
}

system.run(mainTick);
