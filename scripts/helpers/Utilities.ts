import { ListBlockVolume, Vector3 } from "@minecraft/server";

/**
 * 
 * @param array_one 
 * Array you would like to add
 * 
 * @param array_two 
 * Array you would like to add
 * 
 * @returns 
 * Array of Vector3 with no repeated values
 */
export function arrayUnique(array_one: Vector3[], array_two: Vector3[]) {
    let blockList_two: ListBlockVolume = new ListBlockVolume(array_two);
    let new_array = array_two;
    for (let item of array_one) {
        if (!(blockList_two.isInside(item))) {
            array_two.push(item);
        }
    }

    return new_array;
}