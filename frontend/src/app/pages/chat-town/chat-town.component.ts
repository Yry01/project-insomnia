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
import { SKINS } from 'src/app/constants/skins-constant';

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
  allPlayers: { [key: string]: Player } = {};

  //peer object
  peer!: Peer;

  //ismuted
  isMuted = false;

  //isInCall
  isInCall = false;

  // current calls
  currentCalls: { [key: string]: MediaConnection } = {};

  //istalking
  isTalking = false;

  // keyboard controls
  keys: { [key: string]: boolean } = {};

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
        skin: SKINS[Math.floor(Math.random() * 15)],
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
        if (player.id === this.playerId) return;
        this.loadOtherPlayers(player);
      });
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
    if (this.allPlayers[player.id] === undefined) return;
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

  renderPlayers() {
    Object.values(this.allPlayers).forEach((player: any) => {
      this.loadOtherPlayers(player);
    });
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
        peerid: mePlayer.peerid,
      });
      this.renderMap();
      this.renderPlayers();
    } else {
      mePlayer.playAnimation(direction);
    }
  }

  createPeerConnection(): Promise<Peer> {
    return new Promise((resolve) => {
      this.peer = new Peer({
        host: environment.peerjsHost,
        port: environment.peerjsPort, // You can remove this line if using the default secure port (443)
        path: '/peerjs',
        secure: environment.peerjsSecure,
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
      await this.checkIsTalking(stream);
      const call = peer.call(targetPeerId, stream);
      console.log('call is: ', call);
      call.on('stream', (remoteStream: MediaStream) => {
        this.isInCall = true;
        console.log('is in call: ', this.isInCall);
        // Handle the remote stream (e.g., play it in an audio element)
        console.log('audio should be playing in callUser');
        this.playRemoteStream(remoteStream);
      });
      call.on('close', () => {
        this.isInCall = false;
        console.log('is in call: ', this.isInCall);
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

  async checkIsTalking(stream: MediaStream) {
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const checkAudioLevels = () => {
      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / bufferLength;

      // Set a threshold for when the user is considered to be talking
      const threshold = 10;

      if (average > threshold) {
        this.isTalking = true;
      } else {
        this.isTalking = false;
      }

      // Check the audio levels every 100 milliseconds
      setTimeout(() => checkAudioLevels(), 100);
      console.log('is talking: ', this.isTalking);
    };

    checkAudioLevels();
  }

  async callAllUsers() {
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
        await this.checkIsTalking(stream);
        if (this.isMuted) {
          stream.getAudioTracks().forEach((track) => {
            track.enabled = false;
          });
        }
        console.log('stream is: ', stream);
        call.answer(stream);
        call.on('stream', (remoteStream: MediaStream) => {
          this.isInCall = true;
          console.log('is in call: ', this.isInCall);
          // Handle the remote stream (e.g., play it in an audio element)
          console.log('audio should be playing in answerCall');
          this.playRemoteStream(remoteStream);
        });
        // Handle call close event
        call.on('close', () => {
          this.isInCall = false;
          console.log('is in call: ', this.isInCall);
          console.log(
            `Call with user ${call.peer} has been hung up by receiver.`
          );
          delete this.currentCalls[call.peer];
        });

        // Store the call in the currentCalls object
        this.currentCalls[call.peer] = call;
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

  toggleMute() {
    this.isMuted = !this.isMuted;

    for (const key in this.currentCalls) {
      const call = this.currentCalls[key];
      // mute this player's audio based on the isMuted state
      call.peerConnection.getSenders().forEach((sender) => {
        if (sender.track && sender.track.kind === 'audio') {
          sender.track.enabled = !this.isMuted;
        }
      });
    }
  }

  keyPressListener() {
    this.onMovementKeys();

    new KeyPressListener('KeyH', () => this.hangUp());
    new KeyPressListener('KeyG', () => this.callAllUsers());
    new KeyPressListener('KeyM', () => this.toggleMute());
  }

  onMovementKeys() {
    document.addEventListener('keydown', (event) => {
      this.keys[event.key] = true;
    });

    document.addEventListener('keyup', (event) => {
      this.keys[event.key] = false;
    });

    // key pressed
    setInterval(() => {
      if (this.keys['w'] == true) {
        this.handleArrowPress('up');
      }

      if (this.keys['a'] == true) {
        this.handleArrowPress('left');
      }

      if (this.keys['s'] == true) {
        this.handleArrowPress('down');
      }

      if (this.keys['d'] == true) {
        this.handleArrowPress('right');
      }
    }, 1000 / 30);
  }
}
