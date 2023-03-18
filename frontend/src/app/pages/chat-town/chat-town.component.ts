import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthService } from '../../services/auth.service';
import { UtilsService } from 'src/app/services/utils.service';
import { Player } from '../../classes/player';
import { KeyPressListener } from 'src/app/classes/key-press-listener';
import * as PIXI from 'pixi.js';
import { CollisionsService } from '../../services/collisions.service';
import { io } from 'socket.io-client';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-chat-town',
  templateUrl: './chat-town.component.html',
  styleUrls: ['./chat-town.component.scss'],
})
export class ChatTownComponent implements OnInit {
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

  // socket.io
  socket: any;

  constructor(
    private db: AngularFireDatabase,
    private afAuth: AngularFireAuth,
    private authService: AuthService,
    private Utils: UtilsService,
    private Collisions: CollisionsService
  ) {}

  ngOnInit(): void {
    // this.afAuth.onAuthStateChanged((user) => {
    //   if (user) {
    //     // you're' logged in
    //     this.playerId = user.uid;
    //     this.playerRef = this.db.database.ref(`players/${this.playerId}`);
    //     this.playerRef.set({
    //       id: this.playerId,
    //       skin: this.skins[Math.floor(Math.random() * 15)],
    //       direction: 'down',
    //       x: this.Utils.withGrid(24),
    //       y: this.Utils.withGrid(22),
    //     });

    //     this.playerRef.onDisconnect().remove();

    //     // initialize the game
    //     this.initGame();
    //   } else {
    //     // you're logged out
    //   }
    // });

    // this.authService.login();
    this.initGame();
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
    this.initListenersOnPlayerMovement2();

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
      this.Utils.xOffSet() - this.Utils.withGrid(24),
      this.Utils.yOffSet() - this.Utils.withGrid(22)
    );
    this.mapUpperContainer.position.set(
      this.Utils.xOffSet() - this.Utils.withGrid(24),
      this.Utils.yOffSet() - this.Utils.withGrid(22)
    );

    this.mapLowerContainer.addChild(mapLower);
    this.mapUpperContainer.addChild(mapUpper);
  }

  initListenersOnPlayerMovement2() {
    this.socket = io(environment.backendUrl);

    this.socket.on('connection', (id: any) => {
      // add me to the game
      this.playerId = id;
      console.log('my id is: ', this.playerId);
      // notify new player joined the server
      this.socket.emit('newPlayer', {
        id: id,
        skin: this.skins[Math.floor(Math.random() * 15)],
        direction: 'down',
        x: this.Utils.withGrid(24),
        y: this.Utils.withGrid(22),
      });

      // render other existing players
      this.socket.emit('existingPlayers');
    });

    this.socket.on('existingPlayers', (players: any) => {
      Object.values(players).forEach((player: any) => {
        player = JSON.parse(player);
        this.addPlayerToGame(player);
      });
    });

    this.socket.on('playerMoved', (players: any) => {
      Object.values(players).forEach((player: any) => {
        player = JSON.parse(player);
        this.loadOtherPlayers2(player);
      });
    });

    this.socket.on('newPlayer', (player: any) => {
      this.addPlayerToGame(player);
    });

    this.socket.on('playerQuit', (playerId: string) => {
      this.allPlayers[playerId].remove();
      delete this.allPlayers[playerId];
    });
  }

  addPlayerToGame(player: any) {
    // add player to the game
    const newPlayer = new Player({
      id: player.id,
      x: player.x,
      y: player.y,
      skin: player.skin,
      direction: player.direction,
      container: this.playersContainer,
    });
    this.allPlayers[player.id] = newPlayer;
    this.loadOtherPlayers(player);
  }

  initListenersOnPlayerMovement() {
    // real time player activities updates
    const allPlayersRef = this.db.database.ref('players');

    allPlayersRef.on('value', (snapshot: any) => {
      this.allPlayersRef = snapshot.val();
      console.log(Object.values(this.allPlayersRef));
      Object.values(this.allPlayersRef).forEach((player: any) => {
        this.loadOtherPlayers(player);
      });
    });

    allPlayersRef.on('child_added', (snapshot: any) => {
      console.log('child_added');
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

  loadOtherPlayers2(player: any) {
    if (this.allPlayers[player.id].isSpriteLoaded === false) {
      setTimeout(() => {
        this.loadOtherPlayers(player);
      }, 100);
    } else {
      this.allPlayers[player.id].update({
        x: player.x,
        y: player.y,
        cameraPerson: this.allPlayers[this.playerId],
      });
    }
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
        cameraPerson: this.allPlayers[this.playerId],
      });
    }
  }

  handleArrowPress(direction: string) {
    const mePlayer = this.allPlayers[this.playerId];
    if (!this.Collisions.checkCollisions(mePlayer, direction)) {
      //move to the next space
      mePlayer.update({
        direction: direction,
        cameraPerson: this.allPlayersRef[this.playerId],
      });
      this.allPlayersRef[this.playerId].x = mePlayer.x;
      this.allPlayersRef[this.playerId].y = mePlayer.y;
      this.allPlayersRef[this.playerId].direction = mePlayer.direction;
      this.playerRef.set(this.allPlayersRef[this.playerId]);
    } else {
      mePlayer.playAnimation(direction);
    }

    // update map position
    const cameraPerson = this.allPlayersRef[this.playerId];
    if (
      cameraPerson.x > 232 &&
      cameraPerson.x < 392 &&
      cameraPerson.y > 136 &&
      cameraPerson.y < 396
    ) {
      this.mapLowerContainer.position.set(
        this.Utils.xOffSet() - cameraPerson.x,
        this.Utils.yOffSet() - cameraPerson.y
      );
      this.mapUpperContainer.position.set(
        this.Utils.xOffSet() - cameraPerson.x,
        this.Utils.yOffSet() - cameraPerson.y
      );
    } else {
      let xOffSet = this.Utils.xOffSet();
      let yOffSet = this.Utils.yOffSet();
      if (cameraPerson.x < 232) {
        if (cameraPerson.y < 136) {
          xOffSet = xOffSet - 232;
          yOffSet = yOffSet - 136;
        } else if (cameraPerson.y > 396) {
          xOffSet = xOffSet - 232;
          yOffSet = yOffSet - 396;
        } else {
          xOffSet = xOffSet - 232;
          yOffSet = yOffSet - cameraPerson.y;
        }
      } else if (cameraPerson.x > 392) {
        if (cameraPerson.y < 136) {
          xOffSet = xOffSet - 392;
          yOffSet = yOffSet - 136;
        } else if (cameraPerson.y > 396) {
          xOffSet = xOffSet - 392;
          yOffSet = yOffSet - 396;
        } else {
          xOffSet = xOffSet - 392;
          yOffSet = yOffSet - cameraPerson.y;
        }
      } else {
        if (cameraPerson.y < 136) {
          xOffSet = xOffSet - cameraPerson.x;
          yOffSet = yOffSet - 136;
        } else if (cameraPerson.y > 396) {
          xOffSet = xOffSet - cameraPerson.x;
          yOffSet = yOffSet - 396;
        } else {
          xOffSet = xOffSet - cameraPerson.x;
          yOffSet = yOffSet - cameraPerson.y;
        }
      }
      this.mapLowerContainer.position.set(xOffSet, yOffSet);
      this.mapUpperContainer.position.set(xOffSet, yOffSet);
    }
  }

  handleArrowPress2(direction: string) {
    const mePlayer = this.allPlayers[this.playerId];
    if (!this.Collisions.checkCollisions(mePlayer, direction)) {
      //move to the next space
      mePlayer.update({
        direction: direction,
        cameraPerson: this.allPlayers[this.playerId],
      });
      this.allPlayers[this.playerId].x = mePlayer.x;
      this.allPlayers[this.playerId].y = mePlayer.y;
      this.allPlayers[this.playerId].direction = mePlayer.direction;

      this.socket.emit('playerMoved', {
        id: this.playerId,
        x: mePlayer.x,
        y: mePlayer.y,
        direction: mePlayer.direction,
        skin: mePlayer.skin,
      });
    } else {
      mePlayer.playAnimation(direction);
    }

    // update map position
    const cameraPerson = this.allPlayers[this.playerId];
    if (
      cameraPerson.x > 232 &&
      cameraPerson.x < 392 &&
      cameraPerson.y > 136 &&
      cameraPerson.y < 396
    ) {
      this.mapLowerContainer.position.set(
        this.Utils.xOffSet() - cameraPerson.x,
        this.Utils.yOffSet() - cameraPerson.y
      );
      this.mapUpperContainer.position.set(
        this.Utils.xOffSet() - cameraPerson.x,
        this.Utils.yOffSet() - cameraPerson.y
      );
    } else {
      let xOffSet = this.Utils.xOffSet();
      let yOffSet = this.Utils.yOffSet();
      if (cameraPerson.x < 232) {
        if (cameraPerson.y < 136) {
          xOffSet = xOffSet - 232;
          yOffSet = yOffSet - 136;
        } else if (cameraPerson.y > 396) {
          xOffSet = xOffSet - 232;
          yOffSet = yOffSet - 396;
        } else {
          xOffSet = xOffSet - 232;
          yOffSet = yOffSet - cameraPerson.y;
        }
      } else if (cameraPerson.x > 392) {
        if (cameraPerson.y < 136) {
          xOffSet = xOffSet - 392;
          yOffSet = yOffSet - 136;
        } else if (cameraPerson.y > 396) {
          xOffSet = xOffSet - 392;
          yOffSet = yOffSet - 396;
        } else {
          xOffSet = xOffSet - 392;
          yOffSet = yOffSet - cameraPerson.y;
        }
      } else {
        if (cameraPerson.y < 136) {
          xOffSet = xOffSet - cameraPerson.x;
          yOffSet = yOffSet - 136;
        } else if (cameraPerson.y > 396) {
          xOffSet = xOffSet - cameraPerson.x;
          yOffSet = yOffSet - 396;
        } else {
          xOffSet = xOffSet - cameraPerson.x;
          yOffSet = yOffSet - cameraPerson.y;
        }
      }
      this.mapLowerContainer.position.set(xOffSet, yOffSet);
      this.mapUpperContainer.position.set(xOffSet, yOffSet);
    }
  }

  keyPressListener() {
    new KeyPressListener('KeyW', () => this.handleArrowPress2('up'));
    new KeyPressListener('KeyS', () => this.handleArrowPress2('down'));
    new KeyPressListener('KeyA', () => this.handleArrowPress2('left'));
    new KeyPressListener('KeyD', () => this.handleArrowPress2('right'));
  }
}
