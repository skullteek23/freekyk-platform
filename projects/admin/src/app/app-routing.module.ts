import { NgModule } from '@angular/core';
import { canActivate, redirectLoggedInTo } from '@angular/fire/auth-guard';
import { RouterModule, Routes } from '@angular/router';
import { ErrorComponent } from './error/error.component';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';

const redirectLoggedUserTo = () => redirectLoggedInTo(['/seasons']);

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./main-shell/main-shell.module').then((m) => m.MainShellModule),
  },
  {
    path: 'register',
    component: SignupComponent,
    ...canActivate(redirectLoggedUserTo),
  },
  {
    path: 'login',
    component: LoginComponent,
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
