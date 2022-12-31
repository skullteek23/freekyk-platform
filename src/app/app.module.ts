import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { REGION } from '@angular/fire/functions';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AboutComponent } from './others/about/about.component';
import { PrivacyComponent } from './others/privacy/privacy.component';
import { TermsComponent } from './others/terms/terms.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { ErrorComponent } from './error/error.component';
import { LoginComponent } from './auth/login/login.component';
import { LogoutComponent } from './auth/logout/logout.component';
import { LandingPageComponent } from './others/landing-page/landing-page.component';
import { SignupComponent } from './auth/signup/signup.component';
import { MaterialModule } from '@shared/material.module';
import { StoreModule } from '@ngrx/store';
import * as fromApp from './store/app.reducer';
import { LoginUiComponent } from './auth/login-ui/login-ui.component';
import { GroundProfileComponent } from './play/profile-pages/ground-profile/ground-profile.component';
import { PlayerProfileComponent } from './play/profile-pages/player-profile/player-profile.component';
import { SeasonProfileComponent } from './play/profile-pages/season-profile/season-profile.component';
import { TeamProfileComponent } from './play/profile-pages/team-profile/team-profile.component';
import { SeGalleryComponent } from './play/profile-pages/season-profile/se-gallery/se-gallery.component';
import { SeOverviewComponent } from './play/profile-pages/season-profile/se-overview/se-overview.component';
import { SeStatsComponent } from './play/profile-pages/season-profile/se-stats/se-stats.component';
import { TeGalleryComponent } from './play/profile-pages/team-profile/te-gallery/te-gallery.component';
import { TeMembersComponent } from './play/profile-pages/team-profile/te-members/te-members.component';
import { TeOverviewComponent } from './play/profile-pages/team-profile/te-overview/te-overview.component';
import { TeStatsComponent } from './play/profile-pages/team-profile/te-stats/te-stats.component';
import { NgImageSliderModule } from 'ng-image-slider';
import { SharedModule } from '@shared/shared.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { environment } from 'environments/environment';
import { SeStandingsComponent } from './play/profile-pages/season-profile/se-standings/se-standings.component';
import { SeFixturesComponent } from './play/profile-pages/season-profile/se-fixtures/se-fixtures.component';
import { AuthInterceptor } from './shared/interceptors/auth.interceptor';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { AppDateAdapter, APP_DATE_FORMATS } from '@shared/utils/appDateAdapter';
import { SocialGroupComponent } from '../../shared/dialogs/social-group/social-group.component';

@NgModule({
  declarations: [
    AppComponent,
    AboutComponent,
    PrivacyComponent,
    TermsComponent,
    HeaderComponent,
    FooterComponent,
    ErrorComponent,
    LoginComponent,
    LogoutComponent,
    LandingPageComponent,
    SignupComponent,
    LoginUiComponent,
    GroundProfileComponent,
    PlayerProfileComponent,
    SeasonProfileComponent,
    TeamProfileComponent,
    TeOverviewComponent,
    TeMembersComponent,
    TeGalleryComponent,
    TeStatsComponent,
    SeOverviewComponent,
    SeGalleryComponent,
    SeStatsComponent,
    SeFixturesComponent,
    SeStandingsComponent,
    SocialGroupComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MaterialModule,
    SharedModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    StoreModule.forRoot(fromApp.appReducer),
    StoreDevtoolsModule.instrument({
      logOnly: environment.production,
      maxAge: 5,
    }),
    NgImageSliderModule,
  ],
  providers: [
    { provide: REGION, useValue: 'asia-south1' },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
