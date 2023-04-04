import { Player } from './player';
import { UtilsService } from '../services/utils.service';
import * as PIXI from 'pixi.js';

export class Sprite {
  playerSprite!: PIXI.AnimatedSprite;
  private animateSpriteSheet: any;
  private container: PIXI.Container;
  private playerObject: Player;
  private Utils: UtilsService = new UtilsService();

  constructor(config: any) {
    this.container = config.container;
    this.playerObject = config.playerObject;

    // load the texture we need
    PIXI.Assets.load(config.skin).then((texture) => {
      this.createSpriteSheet(texture);
      this.createPlayerSprite(texture, config);
    });
  }

  private createSpriteSheet(sheet: any) {
    this.animateSpriteSheet = {
      'stand-down': [
        new PIXI.Texture(sheet, new PIXI.Rectangle(0 * 32, 0 * 32, 32, 32)),
      ],
      'stand-up': [
        new PIXI.Texture(sheet, new PIXI.Rectangle(0 * 32, 3 * 32, 32, 32)),
      ],
      'stand-left': [
        new PIXI.Texture(sheet, new PIXI.Rectangle(0 * 32, 2 * 32, 32, 32)),
      ],
      'stand-right': [
        new PIXI.Texture(sheet, new PIXI.Rectangle(0 * 32, 1 * 32, 32, 32)),
      ],
      'walk-down': [
        new PIXI.Texture(sheet, new PIXI.Rectangle(0 * 32, 0 * 32, 32, 32)),
        new PIXI.Texture(sheet, new PIXI.Rectangle(1 * 32, 0 * 32, 32, 32)),
        new PIXI.Texture(sheet, new PIXI.Rectangle(2 * 32, 0 * 32, 32, 32)),
        new PIXI.Texture(sheet, new PIXI.Rectangle(3 * 32, 0 * 32, 32, 32)),
      ],
      'walk-up': [
        new PIXI.Texture(sheet, new PIXI.Rectangle(0 * 32, 3 * 32, 32, 32)),
        new PIXI.Texture(sheet, new PIXI.Rectangle(1 * 32, 3 * 32, 32, 32)),
        new PIXI.Texture(sheet, new PIXI.Rectangle(2 * 32, 3 * 32, 32, 32)),
        new PIXI.Texture(sheet, new PIXI.Rectangle(3 * 32, 3 * 32, 32, 32)),
      ],
      'walk-left': [
        new PIXI.Texture(sheet, new PIXI.Rectangle(0 * 32, 2 * 32, 32, 32)),
        new PIXI.Texture(sheet, new PIXI.Rectangle(1 * 32, 2 * 32, 32, 32)),
        new PIXI.Texture(sheet, new PIXI.Rectangle(2 * 32, 2 * 32, 32, 32)),
        new PIXI.Texture(sheet, new PIXI.Rectangle(3 * 32, 2 * 32, 32, 32)),
      ],
      'walk-right': [
        new PIXI.Texture(sheet, new PIXI.Rectangle(0 * 32, 1 * 32, 32, 32)),
        new PIXI.Texture(sheet, new PIXI.Rectangle(1 * 32, 1 * 32, 32, 32)),
        new PIXI.Texture(sheet, new PIXI.Rectangle(2 * 32, 1 * 32, 32, 32)),
        new PIXI.Texture(sheet, new PIXI.Rectangle(3 * 32, 1 * 32, 32, 32)),
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
    texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
    this.playerObject.isSpriteLoaded = true;
    this.container.addChild(this.playerSprite);
    this.playerSprite.play();
  }

  update(state: any) {
    const cameraPerson = state.cameraPerson;

    let x = this.playerObject.x + this.Utils.xOffSet() - cameraPerson.x;
    let y = this.playerObject.y + this.Utils.yOffSet() - cameraPerson.y;

    if (this.playerObject === cameraPerson) {
      if (cameraPerson.x < 232) {
        x = this.playerObject.x + this.Utils.xOffSet() - 232;
      }
      if (cameraPerson.x > 388) {
        x = this.playerObject.x + this.Utils.xOffSet() - 388;
      }
      if (cameraPerson.y < 136) {
        y = this.playerObject.y + this.Utils.yOffSet() - 136;
      }
      if (cameraPerson.y > 296) {
        y = this.playerObject.y + this.Utils.yOffSet() - 296;
      }
    } else {
      if (cameraPerson.x < 232) {
        x -= 232 - cameraPerson.x;
      }
      if (cameraPerson.x > 388) {
        x += cameraPerson.x - 388;
      }
      if (cameraPerson.y < 136) {
        y -= 136 - cameraPerson.y;
      }
      if (cameraPerson.y > 296) {
        y += cameraPerson.y - 296;
      }
    }

    if (state.direction !== undefined) {
      this.playAnimation(state.direction);
    }
    this.playerSprite.zIndex = y;
    this.playerSprite.position.set(x - 8, y - 16);
  }

  playAnimation(direction: string) {
    if (!this.playerSprite.playing) {
      this.playerObject.isPlayerMoving = true;
      this.playerObject.direction = direction;
      this.playerSprite.textures = this.animateSpriteSheet['walk-' + direction];
      this.playerSprite.play();
      this.playerSprite.onComplete = () => {
        this.playerSprite.textures =
          this.animateSpriteSheet['stand-' + direction];
        this.playerObject.isPlayerMoving = false;
      };
    }
  }

  removeFromStage() {
    this.container.removeChild(this.playerSprite);
  }
}
