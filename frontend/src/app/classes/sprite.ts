import { Player } from './player';
import * as PIXI from 'pixi.js';

export class Sprite {
  private skin: string;
  playerSprite!: PIXI.AnimatedSprite;
  private animateSpriteSheet: any;
  private container: PIXI.Container;
  private playerObject: Player;

  constructor(config: any) {
    this.container = config.container;
    this.skin = config.skin;
    this.playerObject = config.playerObject;

    // load the texture we need
    PIXI.Assets.load(this.skin).then((texture) => {
      this.createSpriteSheet(texture);
      this.createPlayerSprite(texture, config);
    });
  }

  private createSpriteSheet(sheet: any) {
    this.animateSpriteSheet = {
      'stand-down': [
        new PIXI.Texture(sheet, new PIXI.Rectangle(0 * 32, 0 * 32, 32, 32)),
      ],
    };
  }

  private createPlayerSprite(texture: any, config: any) {
    this.playerSprite = new PIXI.AnimatedSprite(
      this.animateSpriteSheet['stand-' + config.direction]
    );
    this.playerSprite.animationSpeed = 0.15;
    this.playerSprite.loop = false;
    this.playerSprite.x = config.x;
    this.playerSprite.y = config.y;
    this.playerSprite.scale.set(2);
    texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
    this.playerObject.isSpriteLoaded = true;
    this.container.addChild(this.playerSprite);
    this.playerSprite.play();
  }

  removeFromStage() {
    this.container.removeChild(this.playerSprite);
  }

  update(state: any) {
    const x = this.playerObject.x;
    const y = this.playerObject.y;

    this.playerSprite.position.set(x, y);
  }
}
