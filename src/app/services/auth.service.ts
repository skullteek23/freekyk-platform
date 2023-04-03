import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireFunctions } from '@angular/fire/functions';
import { logDetails } from '@shared/interfaces/others.model';
import { SnackbarService } from './snackbar.service';
import { CLOUD_FUNCTIONS } from '@shared/Constants/CLOUD_FUNCTIONS';
import firebase from 'firebase/app';
import { Observable, Subject } from 'rxjs';
import { ApiGetService } from '@shared/services/api.service';

export type authUser = firebase.auth.UserCredential;
export type authUserMain = authUser['user'];
export type confirmationResult = firebase.auth.ConfirmationResult;
export interface User {
  id: string;
  name: string;
  email: string
}
export const INDIAN_DIAL_PREFIX = '+91';
var reCaptchaVerifier;
var grecaptcha;

@Injectable({
  providedIn: 'root',
})

export class AuthService {

  private _user: authUserMain = null;
  private _photoChanged = new Subject<string>();

  constructor(
    private snackbarService: SnackbarService,
    private ngAuth: AngularFireAuth,
    private ngFunc: AngularFireFunctions,
    private apiService: ApiGetService
  ) {
    ngAuth.onAuthStateChanged(user => {
      this._user = user;
      this.saveUserCred(user);
      this.updatePhoto(user?.photoURL);
    });
  }

  updatePhoto(url: string) {
    this._photoChanged.next(url || null);
  }

  login(logData: logDetails): Promise<authUser> {
    if (logData?.email && logData?.password) {
      return this.ngAuth.signInWithEmailAndPassword(logData.email, logData.password);
    }
  }

  loginWithGoogle(): Promise<authUser> {
    return this.ngAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }

  signup(logData: logDetails): Promise<authUser> {
    if (logData?.email && logData?.password) {
      return this.ngAuth.createUserWithEmailAndPassword(logData.email, logData.password);
    }
    console.log('invalid details');
  }

  signupWithPhoneNumber(input: number) {
    if (input) {
      if (!reCaptchaVerifier) {
        reCaptchaVerifier = new firebase.auth.RecaptchaVerifier('phone-signup-button', {
          size: 'invisible'
        });
      }
      return this.ngAuth.signInWithPhoneNumber(`${INDIAN_DIAL_PREFIX}${input.toString()}`, reCaptchaVerifier);
    } else {
      console.log('invalid details');
      this.snackbarService.displayError('Unknown error occurred! Try again later')
      return Promise.reject();
    }
  }

  saveUserCred(user: authUserMain) {
    if (user) {
      localStorage.setItem('uid', user.uid);
      localStorage.setItem('name', user.displayName);
    }
  }

  resetCaptcha() {
    if (reCaptchaVerifier) {
      reCaptchaVerifier.render().then(function (widgetId) {
        if (grecaptcha) {
          grecaptcha.reset(widgetId);
        }
      });
    }
  }

  isLoggedIn(): Observable<authUserMain> {
    return this.ngAuth.authState;
  }

  getPhoto(): Subject<string> {
    return this._photoChanged;
  }

  async isProfileExists(user: authUserMain): Promise<boolean> {
    return await this.apiService.getPlayerOnboardingStatus(user.uid).toPromise();
  }

  onLogout(): void {
    this.ngAuth.signOut()
      .then(() => {
        this.snackbarService.displayCustomMsg('Logged out!');
        localStorage.removeItem('uid');
        this.resetUser();
        sessionStorage.clear();
        location.href = '/';
      })
      .catch((error) => this.handleAuthError(error.code));
  }

  resetUser() {
    this._user = null;
  }

  getUser(): authUserMain {
    return this._user;
  }

  storeUserInfo(data: User) {
    localStorage.setItem('uid', JSON.stringify(data.id));
    sessionStorage.setItem('user', JSON.stringify(data));
  }

  createProfile(name: string, uid: string): Promise<any> {
    const callable = this.ngFunc.httpsCallable(CLOUD_FUNCTIONS.CREATE_PROFILE);
    return callable({ name, uid }).toPromise();
  }

  getToken(): string {
    return 'token';
  }

  updateDisplayName(newName: string): Promise<any> {
    if (newName) {
      return firebase.auth().currentUser?.updateProfile({ displayName: newName.trim() });
    }
  }

  // error display functions
  passwordIncorrect(): void {
    this.snackbarService.displayError('Incorrect password! Please try again');
  }
  passwordWeak(): void {
    this.snackbarService.displayError('Password too weak! Please try another one');
  }
  emailIncorrect(): void {
    this.snackbarService.displayError('Incorrect email! Please try again');
  }
  emailAlreadyRegistered(): void {
    this.snackbarService.displayError('Email already registered! Please try another one');
  }
  accountNotExist(): void {
    this.snackbarService.displayError('Account does not exist! Please sign up');
  }
  sessionExpired(): void {
    this.snackbarService.displayError('Session Expired! Please login again');
  }
  tooManyRequests(): void {
    this.snackbarService.displayError('Too many requests! Please try again after sometime');
  }
  popupClosedByUser(): void {
    this.snackbarService.displayError('Please sign in using the popup box');
  }
  networkFail(): void {
    this.snackbarService.displayError('Please check your internet connection');
  }
  // error display functions

  // error mapper
  handleAuthError(error): void {
    if (error?.code) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          this.emailAlreadyRegistered();
          break;
        case 'auth/account-exists-with-different-credential':
          this.emailAlreadyRegistered();
          break;
        case 'auth/network-request-failed':
          this.networkFail();
          break;
        case 'auth/invalid-email':
          this.emailIncorrect();
          break;
        case 'auth/wrong-password':
          this.passwordIncorrect();
          break;
        case 'auth/weak-password':
          this.passwordWeak();
          break;
        case 'auth/id-token-expired':
          this.sessionExpired();
          break;
        case 'auth/user-not-found':
          this.accountNotExist();
          break;
        case 'auth/uid-already-exists':
          this.emailAlreadyRegistered();
          break;
        case 'auth/too-many-requests':
          this.tooManyRequests();
          break;
        case 'auth/popup-closed-by-user':
          this.popupClosedByUser();
          break;
        case 'auth/invalid-phone-number':
          this.snackbarService.displayError('The format of the phone number provided is incorrect');
          break;
        case 'auth/invalid-app-credential':
          this.snackbarService.displayError('Error: Invalid App Credential');
          window.location.reload();
          break;
        case 'auth/invalid-verification-code':
          this.snackbarService.displayError('Error: Invalid OTP');
          break;
        case 'auth/user-disabled':
          this.snackbarService.displayError('Error: Account disabled by Admin');
          break;
        case 'auth/captcha-check-failed':
          this.snackbarService.displayError('Error: Hostname match not found');
          window.location.reload();
          break;
        default:
          this.snackbarService.displayError('Unknown error occurred!');
          break;
      }
    }
  }
  // error mapper

  // forgotPassword(): void {
  //   const userEmail: any = this.currentUser?.email;
  //   this.ngAuth.sendPasswordResetEmail(userEmail)
  //     .then(() => {
  //       this.snackbarService.displayCustomMsg('Password Reset link has been successfully sent! Please check your email');
  //     })
  //     .catch((error) => this.handleAuthError(error.code));
  // }

  // modifyPassword(newPassword: string): void {
  //   this.ngAuth.currentUser.then((user) => {
  //     const lastSignInTime = new Date(user.metadata.lastSignInTime);
  //     if (new Date().getTime() - lastSignInTime.getTime() <= MatchConstants.EMAIL_PASS_CHANGE_TIMEOUT_IN_MILI) {
  //       this.changePassword(newPassword)
  //         .then(() => {
  //           // console.log('password changed!');
  //           this.snackbarService.displayCustomMsg(
  //             'Password updated successfully! Please login again'
  //           );
  //           this.onLogout();
  //         })
  //         .catch((error) => this.handleAuthError(error));
  //     } else {
  //       this.snackbarService.displayCustomMsg('Please login again to verify!');
  //     }
  //   });
  // }

  // onChangeEmail(newEmail: string): void {
  //   this.ngAuth.currentUser.then((user) => {
  //     const lastSignInTime = new Date(user.metadata.lastSignInTime);
  //     if (new Date().getTime() - lastSignInTime.getTime() <= MatchConstants.EMAIL_PASS_CHANGE_TIMEOUT_IN_MILI) {
  //       this.changeEmail(newEmail)
  //         ?.then(() => {
  //           // console.log('email changed!');
  //           this.snackbarService.displayCustomMsg(
  //             'Email updated successfully! Please login again'
  //           );
  //           this.onLogout();
  //         })
  //         .catch((error) => this.handleAuthError(error));
  //     } else {
  //       this.snackbarService.displayCustomMsg('Please login again to verify!');
  //     }
  //   });
  // }
}
