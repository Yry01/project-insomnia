import { Injectable } from '@angular/core';
import { Player } from '../classes/player';
import { COLLISIONS } from '../constants/constant';

@Injectable({
  providedIn: 'root',
})
export class CollisionsService {
  // all the collision indexes

  constructor() {}

  // if collisions, return true, else false
  checkCollisions(player: Player, direction: String) {
    //check the edge of the map
    if (
      (player.x <= 0 && direction === 'left') ||
      (player.y <= 0 && direction === 'up') ||
      (player.x >= 624 && direction === 'right') ||
      (player.y >= 368 && direction === 'down')
    ) {
      return true;
    }

    let x = player.x;
    let y = player.y;
    if (direction === 'left') {
      x -= 4;
    } else if (direction === 'right') {
      x += 4;
    } else if (direction === 'up') {
      y -= 4;
    } else if (direction === 'down') {
      y += 4;
    }

    let collisions = COLLISIONS;
    let nextLocation = [x, y].toString();

    // if next location is in the collision array, return true
    if (collisions.indexOf(nextLocation) > -1) {
      return true;
    }

    return false;
  }
}
