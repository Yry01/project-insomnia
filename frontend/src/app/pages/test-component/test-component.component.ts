import { Component, OnInit } from '@angular/core';
import Peer from 'peerjs';

@Component({
  selector: 'app-test-component',
  templateUrl: './test-component.component.html',
  styleUrls: ['./test-component.component.scss'],
})
export class TestComponent implements OnInit {
  peer!: Peer;

  constructor() {}

  ngOnInit(): void {
    this.peer = new Peer({
      host: 'cscc09.insonmiachat.one',
      port: 443, // You can remove this line if using the default secure port (443)
      path: '/peerjs',
      secure: true,
    });

    this.peer.on('open', (id) => {
      console.log('Connected to the signaling server. My ID:', id);
    });
  }
}
