import { Component, OnInit } from '@angular/core';
import { UtilsService } from 'src/app/services/utils.service';
import { Player } from '../../classes/player';
import { KeyPressListener } from 'src/app/classes/key-press-listener';
import * as PIXI from 'pixi.js';
import { CollisionsService } from '../../services/collisions.service';
import { io } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AuthService } from '@auth0/auth0-angular';
import Peer, { MediaConnection } from 'peerjs';

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

  //peer object
  peer!: Peer;

  // current calls
  currentCalls: { [key: string]: MediaConnection } = {};

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
    isAuthenticated.subscribe(async (isAuth) => {
      if (isAuth) {
        this.peer = await this.createPeerConnection();
        this.answerCall(this.peer);
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
        peerid: this.peer.id,
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
      peerid: player.peerid,
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

  createPeerConnection(): Promise<Peer> {
    return new Promise((resolve) => {
      this.peer = new Peer({
        host: 'cscc09.insonmiachat.one',
        port: 3000, // You can remove this line if using the default secure port (443)
        path: '/peerjs',
        secure: true,
      });

      this.peer.on('open', (id: string) => {
        console.log('Connected to the signaling server. My ID:', id);
        this.answerCall(this.peer); // Set up the event listener for incoming calls
        resolve(this.peer); // Resolve the promise with the peer ID
      });

      this.peer.on('error', (error: any) => {
        console.error('Error connecting to the signaling server:', error);
      });
    });
  }

  async getUserMediaStream(): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('Got user media stream:', stream);
      return stream;
    } catch (error) {
      console.error('Error getting user media:', error);
      throw error;
    }
  }

  async callUser(peer: Peer, targetPeerId: string) {
    try {
      if (this.currentCalls[targetPeerId]) {
        console.log('A call is already active,skipping call to:', targetPeerId);
        return;
      }
      const stream = await this.getUserMediaStream();
      console.log('Calling user:', targetPeerId);
      const call = peer.call(targetPeerId, stream);
      console.log('call is: ', call);
      call.on('stream', (remoteStream: MediaStream) => {
        // Handle the remote stream (e.g., play it in an audio element)
        console.log('audio should be playing in callUser');
        this.playRemoteStream(remoteStream);
      });
      call.on('close', () => {
        delete this.currentCalls[targetPeerId];
      });
      this.currentCalls[targetPeerId] = call;
    } catch (error) {
      console.error('Error calling user:', error);
    }
  }

  hangUp() {
    if (Object.keys(this.currentCalls).length > 0) {
      for (const targetPeerId in this.currentCalls) {
        if (this.currentCalls.hasOwnProperty(targetPeerId)) {
          this.currentCalls[targetPeerId].close();
          console.log(`Call with user ${targetPeerId} has been hung up.`);
        }
      }
      this.currentCalls = {};
    } else {
      console.log('No calls are active to hang up.');
    }
  }

  async callAllUsers() {
    const mePlayer = this.allPlayers[this.playerId];
    if (Object.keys(this.allPlayers).length > 1) {
      for (const player of Object.values(this.allPlayers)) {
        if (player.id !== this.playerId) {
          console.log(player.peerid);
          await this.callUser(this.peer, player.peerid);
        }
      }
    } else {
      console.log('No other players in the room');
    }
  }

  async answerCall(peer: Peer) {
    peer.on('call', async (call: MediaConnection) => {
      console.log('Call event triggered');
      try {
        console.log('Answering call:', call);
        const stream = await this.getUserMediaStream();
        console.log('stream is: ', stream);
        call.answer(stream);
        call.on('stream', (remoteStream: MediaStream) => {
          // Handle the remote stream (e.g., play it in an audio element)
          console.log('audio should be playing in answerCall');
          this.playRemoteStream(remoteStream);
        });
      } catch (error) {
        console.error('Error answering call:', error);
      }
    });
  }

  playRemoteStream(remoteStream: MediaStream) {
    console.log('audio should be playing');
    const audioElement = document.createElement('audio');
    audioElement.srcObject = remoteStream;
    audioElement.play();
  }

  callNearestUser() {
    const mePlayer = this.allPlayers[this.playerId];
    //check if there are other players in the room
    if (Object.keys(this.allPlayers).length > 1) {
      for (const player of Object.values(this.allPlayers)) {
        if (player.id !== this.playerId) {
          console.log(player.peerid);
          this.callUser(this.peer, player.peerid);
          break;
        }
      }
    } else {
      console.log('No other players in the room');
    }
  }

  keyPressListener() {
    new KeyPressListener('KeyW', () => this.handleArrowPress('up'));
    new KeyPressListener('KeyS', () => this.handleArrowPress('down'));
    new KeyPressListener('KeyA', () => this.handleArrowPress('left'));
    new KeyPressListener('KeyD', () => this.handleArrowPress('right'));
    new KeyPressListener('KeyF', () => this.callNearestUser());
    new KeyPressListener('KeyH', () => this.hangUp());
    new KeyPressListener('KeyG', () => this.callAllUsers());
  }
}
