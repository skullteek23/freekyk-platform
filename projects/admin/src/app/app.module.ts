import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { canActivate, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { CommonModule, DatePipe } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { AngularFireModule } from '@angular/fire';
import { RouterModule, Routes } from '@angular/router';
import { REGION } from '@angular/fire/functions';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { environment } from 'environments/environment';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { ErrorComponent } from './error/error.component';
import { MaterialModule } from '@shared/material.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { SharedModule } from '@shared/shared.module';
import { SnackBarModule } from '@shared/modules/snack-bar/snack-bar.module';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '@shared/utils/appDateAdapter';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AdminHeaderComponent } from './admin-header/admin-header.component';
import { AdminLoginGuard } from './guards/admin-login.guard';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { AdminFooterComponent } from './admin-footer/admin-footer.component';

const redirectUnauthorizedGuard = () => redirectUnauthorizedTo(['/login']);

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./main-shell/main-shell.module').then((m) => m.MainShellModule),
    ...canActivate(redirectUnauthorizedGuard),
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [AdminLoginGuard]
  },
  {
    path: 'register',
    component: SignupComponent,
    canActivate: [AdminLoginGuard]

  },
  {
    path: '**',
    component: ErrorComponent,
    data: {
      message: 'We are sorry, but the page you requested was not found!',
      code: '404',
    },
  },
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    ErrorComponent,
    AdminHeaderComponent,
    AdminFooterComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    MaterialModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    FlexLayoutModule,
    SharedModule,
    SnackBarModule,
    HttpClientModule,
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' }),
    AngularFireModule.initializeApp(environment.firebase)
  ],
  providers: [
    { provide: REGION, useValue: 'asia-south1' },
    DatePipe,
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
