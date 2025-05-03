import { system, world } from "@minecraft/server";
import { StorageBlockController } from "./controllers/StorageBlockController";
import { PlayerController } from "./controllers/PlayerController";
import { Logger } from "./helpers/Logger";
import { StoreWarehouse } from "./blocks/StoreWarehouse";
import { ADDON_NAMESPACE } from "./constants/strings";
import { ADDON_INITIALIZE_DELAY, ADDON_LONG_WORKLOAD_TIME, ADDON_SHORT_WORKLOAD_TIME } from "./constants/numbers";

const ADDON_DEBUG = true;

const logger = new Logger(ADDON_NAMESPACE);

let ticksSinceLoad = 0;
let once = true;

let storageBlockController: StorageBlockController;
let playerController: PlayerController;

// Register custom blocks with block registry

function main() {
  // Keep track of in game time ticks
  ticksSinceLoad++;

  // Runs every time the addon is loaded once after a set delay
  if (ticksSinceLoad % ADDON_INITIALIZE_DELAY == 0 && once) {
    once = false;
    logger.log("Initializing economy");
    initialize();
  }

  // Frequent workloads
  if (ticksSinceLoad % ADDON_SHORT_WORKLOAD_TIME == 0) {
    frequentWorkloads();
  }

  // Infrequent worloads
  if (ticksSinceLoad % ADDON_LONG_WORKLOAD_TIME == 0) {
    infrequentWorkloads();
  }

  system.run(main);
}

function initialize() {
  storageBlockController = new StorageBlockController();
  playerController = new PlayerController();
}

function frequentWorkloads() {
  logger.log("Scanning for economy");
  let currentEconomy: { [id: string]: number } = {};

  // Scan storage known storage blocks for inventory
  logger.log("Scanning known storage blocks");
  let itemsInStorageBlocks = storageBlockController.scanStorageBlocks();
  for (let item of itemsInStorageBlocks) {
    if (item in currentEconomy) {
      currentEconomy[item] += 1;
    } else {
      currentEconomy[item] = 1;
    }
  }

  // Scan players inventories
  logger.log("Scanning known player inventories");
  let itemsInPlayerInventories = playerController.scanInventories();
  for (let item of itemsInPlayerInventories) {
    if (item in currentEconomy) {
      currentEconomy[item] += 1;
    } else {
      currentEconomy[item] = 1;
    }
  }

  if (ADDON_DEBUG) {
    logger.log(`Blocks in economy: ${JSON.stringify(currentEconomy, null, 4)}`);
  }
}

function infrequentWorkloads() {
  logger.log("Searching for new storage blocks");

  // Find and scan chests
  storageBlockController.findNewStorageBlocks();
}

system.run(main);
