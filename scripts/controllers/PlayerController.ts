import { EntityInventoryComponent, Player, world } from "@minecraft/server";

/**
 * This controller handles operations involviong players inside the world
 */
export class PlayerController {
  private _currentPlayers: Player[];

  constructor() {
    this._currentPlayers = world.getAllPlayers();
  }

  public get currentPlayers() {
    return this._currentPlayers;
  }

  /**
   * 
   * @returns 
   * Returns array of block type ids from players' inventories
   */
  public scanInventories(): string[] {
    let updatedKnownBlocks: string[] = [];
    for (let player of this._currentPlayers) {
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
    this.refreshCache();
    return updatedKnownBlocks;
  }

  /**
   * Refreshes the internal field that tracks current players in world
   */
  public refreshCache() {
    this._currentPlayers = world.getAllPlayers();
  }
}

