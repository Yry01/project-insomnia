import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chat-town',
  templateUrl: './chat-town.component.html',
  styleUrls: ['./chat-town.component.scss'],
})
export class ChatTownComponent {
  playerId!: string;
  playerRef!: any;

  constructor(
    private db: AngularFireDatabase,
    private afAuth: AngularFireAuth,
    private authService: AuthService
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
      } else {
        // you're logged out
      }
    });

    this.authService.login();
  }
}
