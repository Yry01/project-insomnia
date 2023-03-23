import { Component, OnInit } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';
import { Player } from '../../classes/player';
import { KeyPressListener } from 'src/app/classes/key-press-listener';
import * as PIXI from 'pixi.js';
import { CollisionsService } from '../../services/collisions.service';
import { io } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AuthService } from '@auth0/auth0-angular';

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
    public auth: AuthService,
    private Utils: UtilsService,
    private Collisions: CollisionsService
  ) {}

  ngOnInit(): void {
    const isAuthenticated = this.auth.isAuthenticated$;
    isAuthenticated.subscribe((isAuth) => {
      if (isAuth) {
        this.initGame();
      }
    });
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

  initListenersOnPlayerMovement() {
    this.socket = io(environment.backendUrl);

    this.socket.on('connection', (id: any) => {
      // add me to the game
      this.playerId = id;
      // notify new player joined the server
      this.socket.emit('player_joined', {
        id: id,
        skin: this.skins[Math.floor(Math.random() * 15)],
        direction: 'down',
        x: this.Utils.withGrid(24),
        y: this.Utils.withGrid(22),
      });

      // render all online players
      this.socket.emit('online_players');
    });

    // listen to new player joined
    this.socket.on('player_joined', (player: any) => {
      this.addPlayerToGame(player);
    });

    // listen to online players response
    this.socket.on('online_players', (players: any) => {
      Object.values(players).forEach((player: any) => {
        player = JSON.parse(player);
        this.addPlayerToGame(player);
      });
    });

    this.socket.on('player_moved', (players: any) => {
      Object.values(players).forEach((player: any) => {
        player = JSON.parse(player);
        this.loadOtherPlayers(player);
      });
      this.renderMap();
    });

    this.socket.on('player_disconnected', (playerId: string) => {
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

  renderMap() {
    // render map based on camera person's position
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

  handleArrowPress(direction: string) {
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

      this.socket.emit('player_moved', {
        id: this.playerId,
        x: mePlayer.x,
        y: mePlayer.y,
        direction: mePlayer.direction,
        skin: mePlayer.skin,
      });
    } else {
      mePlayer.playAnimation(direction);
    }
  }

  keyPressListener() {
    new KeyPressListener('KeyW', () => this.handleArrowPress('up'));
    new KeyPressListener('KeyS', () => this.handleArrowPress('down'));
    new KeyPressListener('KeyA', () => this.handleArrowPress('left'));
    new KeyPressListener('KeyD', () => this.handleArrowPress('right'));
  }
}
