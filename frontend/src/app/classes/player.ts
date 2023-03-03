import { Sprite } from './sprite';

export class Player {
  x: number;
  y: number;
  isSpriteLoaded: boolean = false;

  private sprite: Sprite;

  constructor(config: any) {
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.sprite = new Sprite({
      skin: config.skin,
      playerObject: this,
      container: config.container,
      direction: config.direction,
    });
  }

  get playerSprite() {
    return this.sprite.playerSprite;
  }

  update(state: any) {
    this.updatePosition(state);
    this.updateSprite(state);
  }

  private updatePosition(state: any) {
    this.x = state.x;
    this.y = state.y;
  }

  private updateSprite(state: any) {
    this.sprite.update(state);
  }

  remove() {
    this.sprite.removeFromStage();
  }
}
