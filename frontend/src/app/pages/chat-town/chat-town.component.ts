import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthService } from '../../services/auth.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Player } from '../../classes/player';
import { KeyPressListener } from 'src/app/classes/key-press-listener';
import * as PIXI from 'pixi.js';

@Component({
  selector: 'app-chat-town',
  templateUrl: './chat-town.component.html',
  styleUrls: ['./chat-town.component.scss'],
})
export class ChatTownComponent {
  // canvas info
  WIDTH = 480;
  HEIGHT = 320;
  BG_COLOR = 0xd9f4ff;
  app!: PIXI.Application;

  // map layers
  mapLowerContainer!: PIXI.Container;
  mapUpperContainer!: PIXI.Container;
  playersContainer!: PIXI.Container;

  // player objects
  playerId!: string;
  playerRef!: any;
  allPlayersRef!: any;
  allPlayers: { [key: string]: Player } = {};

  // player skins
  skins = [
    '../assets/skins/davidmartinez.png',
    '../assets/skins/dorio.png',
    '../assets/skins/faraday.png',
    '../assets/skins/johnny.png',
    '../assets/skins/judy.png',
    '../assets/skins/judyscuba.png',
    '../assets/skins/kiwi.png',
    '../assets/skins/lucy.png',
    '../assets/skins/maine.png',
    '../assets/skins/rebecca.png',
    '../assets/skins/river.png',
    '../assets/skins/riverjacket.png',
    '../assets/skins/roguejacket.png',
    '../assets/skins/takemura.png',
    '../assets/skins/takemurajacket.png',
    '../assets/skins/tbug.png',
  ];

  constructor(
    private db: AngularFireDatabase,
    private afAuth: AngularFireAuth,
    private authService: AuthService,
    private Utils: UtilsService
  ) {}

  ngOnInit(): void {
    this.afAuth.onAuthStateChanged((user) => {
      if (user) {
        // you're' logged in
        this.playerId = user.uid;
        this.playerRef = this.db.database.ref(`players/${this.playerId}`);
        this.playerRef.set({
          id: this.playerId,
          skin: this.skins[Math.floor(Math.random() * 15)],
          direction: 'down',
          x: this.Utils.withGrid(39),
          y: this.Utils.withGrid(22),
        });

        this.playerRef.onDisconnect().remove();

        // initialize the game
        this.initGame();
      } else {
        // you're logged out
      }
    });

    this.authService.login();
  }

  initGame() {
    // initialize the game canvas
    this.app = new PIXI.Application({
      view: document.getElementById('game-canvas') as HTMLCanvasElement,
      width: this.WIDTH,
      height: this.HEIGHT,
      backgroundColor: this.BG_COLOR,
    });

    // initialize the map
    this.initMap();

    // initialize listeners on player movement
    this.initListenersOnPlayerMovement();

    // initialize keyboard controls
    this.keyPressListener();
  }

  initMap() {
    // initialize different layers of the game
    this.mapLowerContainer = new PIXI.Container();
    this.mapUpperContainer = new PIXI.Container();
    this.playersContainer = new PIXI.Container();
    this.playersContainer.sortableChildren = true;

    this.app.stage.addChild(this.mapLowerContainer);
    this.app.stage.addChild(this.playersContainer);
    this.app.stage.addChild(this.mapUpperContainer);

    // initialize the game map
    const mapLower = PIXI.Sprite.from('../../assets/map/map-lower.png'); // change
    const mapUpper = PIXI.Sprite.from('../../assets/map/map-upper.png'); // change

    // set the spawn point of the map
    this.mapLowerContainer.position.set(
      this.Utils.xOffSet() - this.Utils.withGrid(39),
      this.Utils.yOffSet() - this.Utils.withGrid(22)
    );
    this.mapUpperContainer.position.set(
      this.Utils.xOffSet() - this.Utils.withGrid(39),
      this.Utils.yOffSet() - this.Utils.withGrid(22)
    );

    this.mapLowerContainer.addChild(mapLower);
    this.mapUpperContainer.addChild(mapUpper);
  }

  initListenersOnPlayerMovement() {
    // real time player activities updates
    const allPlayersRef = this.db.database.ref('players');

    allPlayersRef.on('value', (snapshot: any) => {
      this.allPlayersRef = snapshot.val();
      Object.values(this.allPlayersRef).forEach((player: any) => {
        this.loadOtherPlayers(player);
      });
    });

    allPlayersRef.on('child_added', (snapshot: any) => {
      const playerSnapshot = snapshot.val();

      // add player to the game
      const newPlayer = new Player({
        id: playerSnapshot.id,
        x: playerSnapshot.x,
        y: playerSnapshot.y,
        skin: playerSnapshot.skin,
        direction: playerSnapshot.direction,
        container: this.playersContainer,
      });

      // add player to the list of all players (in memory)
      this.allPlayers[playerSnapshot.id] = newPlayer;
    });

    allPlayersRef.on('child_removed', (snapshot: any) => {
      const removedPlayer = snapshot.val();
      this.allPlayers[removedPlayer.id].remove();
      delete this.allPlayers[removedPlayer.id];
    });
  }

  loadOtherPlayers(player: any) {
    if (this.allPlayers[player.id].isSpriteLoaded === false) {
      setTimeout(() => {
        this.loadOtherPlayers(player);
      }, 100);
    } else {
      this.allPlayers[player.id].update({
        x: player.x,
        y: player.y,
        cameraPerson: this.allPlayersRef[this.playerId],
      });
    }
  }

  handleArrowPress(direction: string) {
    if (true) {
      //move to the next space
      const mePlayer = this.allPlayers[this.playerId];
      mePlayer.update({
        direction: direction,
        cameraPerson: this.allPlayersRef[this.playerId],
      });
      this.allPlayersRef[this.playerId].x = mePlayer.x;
      this.allPlayersRef[this.playerId].y = mePlayer.y;
      this.allPlayersRef[this.playerId].direction = mePlayer.direction;
      this.playerRef.set(this.allPlayersRef[this.playerId]);
    }

    // update map position
    const cameraPerson = this.allPlayersRef[this.playerId];
    this.mapLowerContainer.position.set(
      this.Utils.xOffSet() - cameraPerson.x,
      this.Utils.yOffSet() - cameraPerson.y
    );
    this.mapUpperContainer.position.set(
      this.Utils.xOffSet() - cameraPerson.x,
      this.Utils.yOffSet() - cameraPerson.y
    );
  }

  keyPressListener() {
    new KeyPressListener('KeyW', () => this.handleArrowPress('up'));
    new KeyPressListener('KeyS', () => this.handleArrowPress('down'));
    new KeyPressListener('KeyA', () => this.handleArrowPress('left'));
    new KeyPressListener('KeyD', () => this.handleArrowPress('right'));
  }
}
