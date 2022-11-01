import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from 'src/environments/environment';

import { DatePipe } from '@angular/common';
import { REGION } from '@angular/fire/functions';
import { LoginComponent } from './login/login.component';
import { SignupComponent } from './signup/signup.component';
import { MyAccountPanelComponent } from './panels/my-account-panel/my-account-panel.component';
import { RegistrationsPanelComponent } from './panels/registrations-panel/registrations-panel.component';
import { AdminConfigPanelComponent } from './panels/admin-config-panel/admin-config-panel.component';
import { AngularFireModule } from '@angular/fire';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppMaterialModule } from './app-material.module';
import { SharedAdminModule } from './shared/shared-admin.module';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    MyAccountPanelComponent,
    RegistrationsPanelComponent,
    AdminConfigPanelComponent,
  ],
  imports: [
    AppRoutingModule,
    SharedAdminModule,
    AppMaterialModule,
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
