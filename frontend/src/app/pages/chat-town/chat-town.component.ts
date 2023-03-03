import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthService } from '../../services/auth.service';
import { UtilsService } from 'src/app/services/utils.service';
import * as PIXI from 'pixi.js';

@Component({
  selector: 'app-chat-town',
  templateUrl: './chat-town.component.html',
  styleUrls: ['./chat-town.component.scss'],
})
export class ChatTownComponent {
  // map info
  WIDTH = 960;
  HEIGHT = 720;
  BG_COLOR = 0xd9f4ff;
  app!: PIXI.Application;

  // map layers
  mapLowerContainer!: PIXI.Container;
  mapUpperContainer!: PIXI.Container;
  otherPlayersContainer!: PIXI.Container;
  mePlayerContainer!: PIXI.Container;

  // player objects
  playerId!: string;
  playerRef!: any;

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
          name: 'test',
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
  }

  initMap() {
    // initialize different layers of the game
    this.mapLowerContainer = new PIXI.Container();
    this.mapUpperContainer = new PIXI.Container();
    this.otherPlayersContainer = new PIXI.Container();
    this.mePlayerContainer = new PIXI.Container();

    this.app.stage.addChild(this.mapLowerContainer);
    this.app.stage.addChild(this.otherPlayersContainer);
    this.app.stage.addChild(this.mePlayerContainer);
    this.app.stage.addChild(this.mapUpperContainer);

    // initialize the game map
    const mapLower = PIXI.Sprite.from('../../assets/map/map-lower.png');
    const mapUpper = PIXI.Sprite.from('../../assets/map/map-upper.png');

    this.mapLowerContainer.addChild(mapLower);
    this.mapUpperContainer.addChild(mapUpper);
  }
}
