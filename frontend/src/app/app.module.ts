import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { ChatTownComponent } from './pages/chat-town/chat-town.component';

@NgModule({
  declarations: [AppComponent, ChatTownComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireDatabaseModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
