import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AboutComponent } from './others/about/about.component';
import { PrivacyComponent } from './others/privacy/privacy.component';
import { TermsComponent } from './others/terms/terms.component';
import { PricingComponent } from './others/pricing/pricing.component';
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
import { environment } from 'src/environments/environment';
// import {
//   AngularFireAuth,
//   USE_EMULATOR as USE_AUTH_EMULATOR,
// } from '@angular/fire/auth';
// import { URL as DATABASE_URL } from '@angular/fire/database';
// import { USE_EMULATOR as USE_FIRESTORE_EMULATOR } from '@angular/fire/firestore';
// import {
//   ORIGIN as FUNCTIONS_ORIGIN,
//   REGION,
//   NEW_ORIGIN_BEHAVIOR,
// } from '@angular/fire/functions';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import * as fromApp from './store/app.reducer';
import { clearState } from './store/clearState.reducer';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginUiComponent } from './auth/login-ui/login-ui.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CartComponent } from './cart/cart.component';
import { CheckoutComponent } from './cart/checkout/checkout.component';
import { FillAddressComponent } from './cart/checkout/fill-address/fill-address.component';
import { CompletePaymentComponent } from './cart/checkout/complete-payment/complete-payment.component';
import { SavedAddressListComponent } from './cart/checkout/saved-address-list/saved-address-list.component';
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
    PricingComponent,
    HeaderComponent,
    FooterComponent,
    ErrorComponent,
    LoginComponent,
    LogoutComponent,
    LandingPageComponent,
    SignupComponent,
    LoginUiComponent,
    CartComponent,
    CheckoutComponent,
    FillAddressComponent,
    CompletePaymentComponent,
    SavedAddressListComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    AppMaterialModule,
    SharedModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebase),
    StoreModule.forRoot(fromApp.appReducer, { metaReducers: [clearState] }),
    StoreDevtoolsModule.instrument({
      logOnly: environment.production,
      maxAge: 5,
    }),
    FontAwesomeModule,
  ],
  providers: [
    // { provide: USE_AUTH_EMULATOR, useValue: ['localhost', 9099] },
    // { provide: REGION, useValue: 'asia-south1' },
    // {
    //   provide: DATABASE_URL,
    //   useValue: `http://localhost:9000?ns=${environment.firebase.projectId}`,
    // },
    // { provide: USE_FIRESTORE_EMULATOR, useValue: ['localhost', 8080] },
    // { provide: NEW_ORIGIN_BEHAVIOR, useValue: true },
    // {
    //   provide: FUNCTIONS_ORIGIN,
    //   useFactory: () => (isDevMode() ? undefined : location.origin),
    // },
    // { provide: DEFAULT_CURRENCY_CODE, useValue: 'INR' },
    // {
    //   provide: APP_INITIALIZER,
    //   useFactory: initializeApp1,
    //   // for some reason this dependency is necessary for this solution to work.
    //   // Maybe in order to trigger the constructor *before* waiting 100ms?
    //   deps: [AngularFireAuth],
    //   multi: true,
    // },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
