import { NgModule } from '@angular/core';
import {
  canActivate,
  redirectLoggedInTo,
  redirectUnauthorizedTo,
} from '@angular/fire/auth-guard';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { ProductProfileComponent } from './equipment/profile-pages/product-profile/product-profile.component';
import { ErrorComponent } from './error/error.component';
import { AboutComponent } from './others/about/about.component';
import { LandingPageComponent } from './others/landing-page/landing-page.component';
import { PrivacyComponent } from './others/privacy/privacy.component';
import { TermsComponent } from './others/terms/terms.component';
import { GroundProfileComponent } from './play/profile-pages/ground-profile/ground-profile.component';
import { PlayerProfileComponent } from './play/profile-pages/player-profile/player-profile.component';
import { SeasonProfileComponent } from './play/profile-pages/season-profile/season-profile.component';
import { TeamProfileComponent } from './play/profile-pages/team-profile/team-profile.component';
const redirectLoggedInToDashboard = () =>
  redirectLoggedInTo(['/dashboard/home']);
const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);

const routes: Routes = [
  { path: '', component: LandingPageComponent },
  {
    path: 'login',
    component: LoginComponent,
    ...canActivate(redirectLoggedInToDashboard),
  },
  {
    path: 'signup',
    component: SignupComponent,
    ...canActivate(redirectLoggedInToDashboard),
  },
  {
    path: 'play',
    loadChildren: () => import('./play/play.module').then((m) => m.PlayModule),
  },
  {
    path: 'freestyle',
    loadChildren: () =>
      import('./freestyle/freestyle.module').then((m) => m.FreestyleModule),
  },
  {
    path: 'equipment',
    loadChildren: () =>
      import('./equipment/equipment.module').then((m) => m.EquipmentModule),
  },
  {
    path: 'academies',
    loadChildren: () =>
      import('./academies/academies.module').then((m) => m.AcademiesModule),
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
  },
  {
    path: 'support',
    loadChildren: () =>
      import('./support/support.module').then((m) => m.SupportModule),
  },
  { path: 'p/:playerid', component: PlayerProfileComponent },
  { path: 't/:teamid', component: TeamProfileComponent },
  { path: 's/:seasonid', component: SeasonProfileComponent },
  { path: 'ground/:groundid', component: GroundProfileComponent },
  { path: 'product/:productid', component: ProductProfileComponent },
  { path: 'about', component: AboutComponent },
  { path: 'privacypolicy', component: PrivacyComponent },
  { path: 'terms', component: TermsComponent },

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
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      onSameUrlNavigation: 'reload',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
