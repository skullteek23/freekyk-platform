import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { environment } from 'environments/environment';
import { CommonModule, DatePipe } from '@angular/common';
import { REGION } from '@angular/fire/functions';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { AngularFireModule } from '@angular/fire';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ErrorComponent } from './error/error.component';
import { MaterialModule } from '@shared/material.module';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { canActivate, redirectLoggedInTo } from '@angular/fire/auth-guard';

const loginRedirect = () =>
  redirectLoggedInTo(['/']);

const routes = [
  {
    path: '',
    loadChildren: () => import('./main-shell/main-shell.module').then((m) => m.MainShellModule),
  },
  {
    path: 'register',
    component: SignupComponent,
    ...canActivate(loginRedirect),
  },
  {
    path: 'login',
    component: LoginComponent,
    ...canActivate(loginRedirect),
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
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    ErrorComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' }),
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    AngularFireModule.initializeApp(environment.firebase)
  ],
  providers: [
    { provide: REGION, useValue: 'asia-south1' },
    DatePipe
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
