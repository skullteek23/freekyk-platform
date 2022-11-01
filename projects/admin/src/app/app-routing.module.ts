import { NgModule } from '@angular/core';
import { canActivate, redirectLoggedInTo } from '@angular/fire/auth-guard';
import { RouterModule, Routes } from '@angular/router';
import { AdminHomeComponent } from './admin-home/admin-home.component';
import { ErrorComponent } from './error/error.component';
import { MainShellComponent } from './main-shell/main-shell.component';

const redirectLoggedUserTo = () => redirectLoggedInTo(['/seasons']);

const routes: Routes = [
  {
    path: '',
    component: MainShellComponent
  },
  {
    path: 'play',
    loadChildren: () => import('./main-shell/main-shell.module').then((m) => m.MainShellModule),
  },
  {
    path: 'register',
    component: AdminHomeComponent,
    ...canActivate(redirectLoggedUserTo),
  },
  {
    path: 'login',
    component: AdminHomeComponent,
    ...canActivate(redirectLoggedUserTo),
  },
  {
    path: 'error',
    component: ErrorComponent,
    data: {
      message: 'We are sorry, but the page you requested was not found!',
      code: '404',
    },
  },
  { path: '**', redirectTo: 'error' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })],
  exports: [RouterModule],
})
export class AppRoutingModule { }
