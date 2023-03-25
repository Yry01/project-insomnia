import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatTownComponent } from './pages/chat-town/chat-town.component';
import { LoginComponent } from './pages/login/login.component';
import { TwilioComponent } from './pages/twilio/twilio.component';

const routes: Routes = [
  { path: '', component: ChatTownComponent },
  // { path: '', component: LoginComponent },
  { path: 'twilio', component: TwilioComponent },
  { path: 'test', component: LoginComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
