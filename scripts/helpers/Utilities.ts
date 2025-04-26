import { ListBlockVolume, Vector3 } from "@minecraft/server";

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