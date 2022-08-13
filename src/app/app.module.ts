import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
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
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SignupComponent } from './auth/signup/signup.component';
import { AppMaterialModule } from './app-material.module';
import { SharedModule } from './shared/shared.module';
import { AngularFireModule } from '@angular/fire';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import * as fromApp from './store/app.reducer';
import { ReactiveFormsModule } from '@angular/forms';
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
import { environment } from 'src/environments/environment';
import { HttpClientModule } from '@angular/common/http';
// export function initializeApp1(afa: AngularFireAuth): any {
//   return () => {
//     return new Promise<void>((resolve) => {
//       afa.useEmulator(`http://${location.hostname}:9099/`);
//       setTimeout(() => resolve(), 100); // delay Angular initialization by 100ms
//     });
//   };
// }

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
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppMaterialModule,
    SharedModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    StoreModule.forRoot(fromApp.appReducer),
    StoreDevtoolsModule.instrument({
      logOnly: environment.production,
      maxAge: 5,
    }),
    NgImageSliderModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
