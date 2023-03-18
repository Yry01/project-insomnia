import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatTownComponent } from './pages/chat-town/chat-town.component';
import { LoginComponent } from './pages/login/login.component';

const routes: Routes = [
  { path: 'chat-town', component: ChatTownComponent },
  { path: '', component: LoginComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
