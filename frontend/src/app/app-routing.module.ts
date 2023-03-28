import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatTownComponent } from './pages/chat-town/chat-town.component';

const routes: Routes = [
  { path: '', component: ChatTownComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
