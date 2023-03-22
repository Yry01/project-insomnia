import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { ChatTownComponent } from './pages/chat-town/chat-town.component';
import { LoginComponent } from './pages/login/login.component';
import { AuthModule } from '@auth0/auth0-angular';
import { TwilioComponent } from './pages/twilio/twilio.component';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    ChatTownComponent,
    LoginComponent,
    TwilioComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireDatabaseModule,
    AuthModule.forRoot(environment.auth),
    FormsModule,
    HttpClientModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
