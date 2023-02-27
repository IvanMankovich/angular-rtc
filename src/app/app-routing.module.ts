import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { BoardPageComponent } from './pages/board-page/board-page.component';
import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { AuthGuard } from './services/auth-guard/auth-guard.service';

const routes: Routes = [
  { path: '', component: MainPageComponent, canActivate: [AuthGuard] },
  { path: 'board/:boardId', component: BoardPageComponent, canActivate: [AuthGuard] },
  { path: 'sign-in', component: SignInComponent },
  { path: '**', component: NotFoundPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
