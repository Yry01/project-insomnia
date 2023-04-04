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
    const mapLower = PIXI.Sprite.from('../../assets/map/map-lower.png');
    const mapUpper = PIXI.Sprite.from('../../assets/map/map-upper.png');

    // set the spawn point of the map
    this.mapLowerContainer.position.set(
      this.Utils.xOffSet() - this.Utils.withGrid(24),
      this.Utils.yOffSet() - this.Utils.withGrid(12)
    );
    this.mapUpperContainer.position.set(
      this.Utils.xOffSet() - this.Utils.withGrid(24),
      this.Utils.yOffSet() - this.Utils.withGrid(12)
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
        y: this.Utils.withGrid(12),
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

    if (cameraPerson.x >= 232 && cameraPerson.x <= 388) {
      this.mapLowerContainer.x = this.Utils.xOffSet() - cameraPerson.x;
      this.mapUpperContainer.x = this.Utils.xOffSet() - cameraPerson.x;
    }

    if (cameraPerson.y >= 136 && cameraPerson.y <= 296) {
      this.mapLowerContainer.y = this.Utils.yOffSet() - cameraPerson.y;
      this.mapUpperContainer.y = this.Utils.yOffSet() - cameraPerson.y;
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
      return stream;
    } catch (error) {
      console.error('Error getting user media:', error);
      throw error;
    }
  }

  async callUser(peer: Peer, targetPeerId: string) {
    try {
      if (this.currentCalls[targetPeerId]) {
        return;
      }
      const stream = await this.getUserMediaStream();
      await this.checkIsTalking(stream);
      const call = peer.call(targetPeerId, stream);
      call.on('stream', (remoteStream: MediaStream) => {
        this.isInCall = true;
        //remove the hidden class of hang-up and mute and icons
        const hangUp = document.getElementById('hang-up');
        const mute = document.getElementById('mute');
        const icons = document.getElementById('icons');
        hangUp?.classList.remove('hidden');
        mute?.classList.remove('hidden');
        icons?.classList.remove('hidden');
        const micOn = document.getElementById('mic-on');
        const micOff = document.getElementById('mic-off');
        if (this.isMuted) {
          micOn?.classList.add('hidden');
          micOff?.classList.remove('hidden');
        } else {
          micOff?.classList.add('hidden');
          micOn?.classList.remove('hidden');
        }
        // add the hidden to call class
        const callUser = document.getElementById('call-user');
        callUser?.classList.add('hidden');
        // Handle the remote stream (e.g., play it in an audio element)
        this.playRemoteStream(remoteStream);
      });
      call.on('close', () => {
        this.isInCall = false;
        // add the hidden class of hang-up and mute
        const hangUp = document.getElementById('hang-up');
        const mute = document.getElementById('mute');
        const icons = document.getElementById('icons');
        hangUp?.classList.add('hidden');
        mute?.classList.add('hidden');
        icons?.classList.add('hidden');
        // remove the hidden to call class
        const callUser = document.getElementById('call-user');
        callUser?.classList.remove('hidden');
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
        }
      }
      this.currentCalls = {};
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

      const vol = document.getElementById('vol');
      if (average > threshold) {
        this.isTalking = true;
        if (!this.isMuted && this.isInCall) {
          vol?.classList.remove('hidden');
        } else {
          vol?.classList.add('hidden');
        }
      } else {
        this.isTalking = false;
        vol?.classList.add('hidden');
      }

      // Check the audio levels every 100 milliseconds
      setTimeout(() => checkAudioLevels(), 100);
    };

    checkAudioLevels();
  }

  async callAllUsers() {
    if (Object.keys(this.allPlayers).length > 1) {
      for (const player of Object.values(this.allPlayers)) {
        if (player.id !== this.playerId) {
          await this.callUser(this.peer, player.peerid);
        }
      }
    }
  }

  async answerCall(peer: Peer) {
    peer.on('call', async (call: MediaConnection) => {
      try {
        const stream = await this.getUserMediaStream();
        await this.checkIsTalking(stream);
        if (this.isMuted) {
          stream.getAudioTracks().forEach((track) => {
            track.enabled = false;
          });
        }
        call.answer(stream);
        call.on('stream', (remoteStream: MediaStream) => {
          this.isInCall = true;
          //remove the hidden class of hang-up and mute
          const hangUp = document.getElementById('hang-up');
          const mute = document.getElementById('mute');
          const icons = document.getElementById('icons');
          hangUp?.classList.remove('hidden');
          mute?.classList.remove('hidden');
          icons?.classList.remove('hidden');
          // add the hidden to call class
          const callUser = document.getElementById('call-user');
          callUser?.classList.add('hidden');
          const micOn = document.getElementById('mic-on');
          const micOff = document.getElementById('mic-off');
          if (this.isMuted) {
            micOn?.classList.add('hidden');
            micOff?.classList.remove('hidden');
          } else {
            micOff?.classList.add('hidden');
            micOn?.classList.remove('hidden');
          }
          // Handle the remote stream (e.g., play it in an audio element)
          this.playRemoteStream(remoteStream);
        });
        // Handle call close event
        call.on('close', () => {
          this.isInCall = false;
          const hangUp = document.getElementById('hang-up');
          const mute = document.getElementById('mute');
          const icons = document.getElementById('icons');
          hangUp?.classList.add('hidden');
          mute?.classList.add('hidden');
          icons?.classList.add('hidden');
          // remove the hidden to call class
          const callUser = document.getElementById('call-user');
          callUser?.classList.remove('hidden');
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
    const audioElement = document.createElement('audio');
    audioElement.srcObject = remoteStream;
    audioElement.play();
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    const micOn = document.getElementById('mic-on');
    const micOff = document.getElementById('mic-off');
    if (this.isMuted) {
      micOn?.classList.add('hidden');
      micOff?.classList.remove('hidden');
    } else {
      micOff?.classList.add('hidden');
      micOn?.classList.remove('hidden');
    }

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
