import { Player } from './player';
import { UtilsService } from '../services/utils.service';
import * as PIXI from 'pixi.js';

export class Sprite {
  private skin: string;
  playerSprite!: PIXI.AnimatedSprite;
  private animateSpriteSheet: any;
  private container: PIXI.Container;
  private playerObject: Player;
  private Utils: UtilsService = new UtilsService();

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
    console.log(
      state.cameraPerson.x,
      state.cameraPerson.y,
      this.playerObject.x,
      this.playerObject.y
    );
    //if camera person has distance from the wall less than 15, then the whole map should not move according to the player\
    if (
      state.cameraPerson.x === this.playerObject.x &&
      state.cameraPerson.y === this.playerObject.y
    ) {
      let y = this.Utils.yOffSet();
      let x = this.Utils.xOffSet();
      if (state.cameraPerson.y > 436) {
        y = this.playerObject.y + this.Utils.yOffSet() - 436;
        if (state.cameraPerson.x > 392) {
          x = this.playerObject.x + this.Utils.xOffSet() - 392;
        } else if (state.cameraPerson.x < 156) {
          x = this.playerObject.x + this.Utils.xOffSet() - 156;
        }
      } else if (state.cameraPerson.y < 136) {
        y = this.playerObject.y + this.Utils.yOffSet() - 136;
        if (state.cameraPerson.x > 392) {
          x = this.playerObject.x + this.Utils.xOffSet() - 392;
        } else if (state.cameraPerson.x < 156) {
          x = this.playerObject.x + this.Utils.xOffSet() - 156;
        }
      } else {
        if (state.cameraPerson.x > 392) {
          x = this.playerObject.x + this.Utils.xOffSet() - 392;
        } else if (state.cameraPerson.x < 156) {
          x = this.playerObject.x + this.Utils.xOffSet() - 156;
        }
      }
      // else if(state.cameraPerson.x>392) {
      //   x = this.playerObject.x + this.Utils.xOffSet() - 392;
      // }
      // else if(state.cameraPerson.x<156) {
      //   x = this.playerObject.x + this.Utils.xOffSet() - 156;
      // }
      if (state.direction !== undefined) {
        this.playAnimation(state.direction);
      }
      this.playerSprite.zIndex = y;
      this.playerSprite.position.set(x - 8, y - 16);
    } else {
      const x =
        this.playerObject.x + this.Utils.xOffSet() - state.cameraPerson.x;
      const y =
        this.playerObject.y + this.Utils.yOffSet() - state.cameraPerson.y;
      if (state.direction !== undefined) {
        this.playAnimation(state.direction);
      }
      this.playerSprite.zIndex = y;
      this.playerSprite.position.set(x - 8, y - 16);
    }
  }

  private playAnimation(direction: string) {
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
