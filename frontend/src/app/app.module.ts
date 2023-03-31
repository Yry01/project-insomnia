import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { ChatTownComponent } from './pages/chat-town/chat-town.component';
import { AuthModule } from '@auth0/auth0-angular';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { environment } from '../environments/environment';

@NgModule({
  declarations: [AppComponent, ChatTownComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AuthModule.forRoot(environment.auth),
    FormsModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
