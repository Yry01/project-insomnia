import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChatTownComponent } from './pages/chat-town/chat-town.component';
import { CreditComponent } from './pages/credit/credit.component';

const routes: Routes = [
  { path: '', component: ChatTownComponent },
  { path: 'credit', component: CreditComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
