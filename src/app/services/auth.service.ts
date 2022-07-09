import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { uData, logDetails } from '../shared/interfaces/others.model';
import { SnackbarService } from './snackbar.service';
import { AppState } from '../store/app.reducer';
import { CLOUD_FUNCTIONS } from '../shared/Constants/CLOUD_FUNCTIONS';
import { EMAIL_PASS_CHANGE_TIMEOUT_IN_MILI } from '../shared/Constants/DEFAULTS';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUser: uData | null = null;
  userDataChanged = new BehaviorSubject<uData | null>(this.currentUser);

  // private functions
  private setCurrentUser(userData: firebase.User | null): void {
    this.currentUser = {
      uid: userData?.uid,
      refreshToken: userData?.refreshToken,
      name: userData?.displayName,
      email: userData?.email,
      imgpath: userData?.photoURL,
    };
    this.userDataChanged.next(this.currentUser);
  }
  private resetCurrentUser(): void {
    this.currentUser = null;
  }
  // private functions

  // public accessible functions
  public onlogin(logData: logDetails): Promise<any> {
    return this.loginOnFirebase(logData.email, logData.pass);
  }

  public onSignup(logData: logDetails): Promise<any> {
    return this.signupOnFirebase(logData.email, logData.pass);
  }

  public onError(error: string): void {
    this.mapError(error);
  }
  public onGoogleSignin(): Promise<any> {
    return this.signinGoogle();
  }

  public onFacebookSignin(): Promise<any> {
    return this.signinFB();
  }
  public onLogout(): void {
    this.logoutFromFirebase()
      .then(() => {
        this.resetCurrentUser();
        sessionStorage.clear();
        localStorage.removeItem('uid');
        console.log('logged out!');
        this.onSuccesslogOut();
        location.href = '/';
      })
      .catch((error) => this.mapError(error.code));
  }
  public onForgotPassword(): void {
    this.forgotPassword()
      .then(() => {
        console.log('password reset link sent!');
        this.snackServ.displayCustomMsgLong(
          'Password Reset link has been successfully sent! Please check your email'
        );
      })
      .catch((error) => this.mapError(error.code));
  }
  public onChangePassword(newPass: string): void {
    this.ngAuth.currentUser.then((user) => {
      const lastSigninTime = new Date(user.metadata.lastSignInTime);
      if (
        new Date().getMilliseconds() - lastSigninTime.getMilliseconds() <=
        EMAIL_PASS_CHANGE_TIMEOUT_IN_MILI
      ) {
        this.changePassword(newPass)
          .then(() => {
            console.log('password changed!');
            this.snackServ.displayCustomMsg(
              'Password updated succesfully! Please login again'
            );
            this.onLogout();
          })
          .catch((error) => this.mapError(error));
      } else {
        this.snackServ.displayCustomMsg('Please login again to verify!');
      }
    });
  }

  public onChangeEmail(newEmail: string): void {
    this.ngAuth.currentUser.then((user) => {
      const lastSigninTime = new Date(user.metadata.lastSignInTime);
      if (
        new Date().getMilliseconds() - lastSigninTime.getMilliseconds() <=
        EMAIL_PASS_CHANGE_TIMEOUT_IN_MILI
      ) {
        this.changeEmail(newEmail)
          ?.then(() => {
            console.log('email changed!');
            this.snackServ.displayCustomMsg(
              'Email updated succesfully! Please login again'
            );
            this.onLogout();
          })
          .catch((error) => this.mapError(error));
      } else {
        this.snackServ.displayCustomMsg('Please login again to verify!');
      }
    });
  }
  public afterSignin(): void {
    this.router.navigate(['/dashboard', 'home']);
    this.onSuccesslogIn(this.currentUser?.name);
  }
  public afterSignup(): void {
    const name = sessionStorage.getItem('name');
    const userName = name ? name : this.currentUser?.name;
    this.router.navigate(['/dashboard', 'home']);
    this.onSuccessSignup(userName);
  }
  public createProfileByCloudFn(name: string, uid: string): Promise<any> {
    const callable = this.ngFunc.httpsCallable(CLOUD_FUNCTIONS.CREATE_PROFILE);
    return callable({ name, uid }).toPromise();
  }
  public getProfilePhoto(): void {
    return this.currentUser?.imgpath;
  }
  public getUID(): void {
    if (this.currentUser?.uid) {
      console.log('uid recieved from service!');
    }
    return this.currentUser?.uid;
  }
  public getEmail(): void {
    if (this.currentUser?.email) {
      console.log('email recieved from service!');
    }
    return this.currentUser?.email;
  }
  public getName(): void {
    if (this.currentUser?.name) {
      console.log('name recieved from service!');
    }
    return this.currentUser?.name;
  }
  // public accessible functions

  // success display functions
  private onSuccesslogIn(name: string | undefined | null): void {
    this.snackServ.displayCustomMsgLong(`Welcome back, ${name}!`);
  }
  private onSuccessSignup(name: string | undefined | null): void {
    this.snackServ.displayCustomMsgLong(`Welcome, ${name}!`);
  }
  private onSuccesslogOut(): void {
    this.snackServ.displayCustomMsgLong('Successfully logged out!');
  }
  // success display functions

  // error display functions
  private passwordIncorrect(): void {
    this.snackServ.displayCustomMsgLong('Incorrect password! Please try again');
  }
  private passwordWeak(): void {
    this.snackServ.displayCustomMsgLong(
      'Password too weak! Please try another one'
    );
  }
  private emailIncorrect(): void {
    this.snackServ.displayCustomMsgLong('Incorrect email! Please try again');
  }
  private emailAlreadyRegistered(): void {
    this.snackServ.displayCustomMsgLong(
      'Email already registered! Please try another one'
    );
  }
  private accountNotExist(): void {
    this.snackServ.displayCustomMsgLong(
      'Account does not exist! Please sign up'
    );
  }
  private sessionExpired(): void {
    this.snackServ.displayCustomMsgLong('Session Expired! Please login again');
  }
  private tooManyRequests(): void {
    this.snackServ.displayCustomMsgLong(
      'Request error! Please try again after sometime'
    );
  }
  private popupClosedByUser(): void {
    this.snackServ.displayCustomMsgLong('Please sign in using the popup box');
  }
  private networkFail(): void {
    this.snackServ.displayCustomMsgLong(
      'Please check your internet connection'
    );
  }
  // error display functions

  // firebase functions
  private signupOnFirebase(newEmail: string, newPass: string): Promise<any> {
    if (newEmail || newPass) {
      return this.ngAuth.createUserWithEmailAndPassword(newEmail, newPass);
    }
  }
  private loginOnFirebase(em: string, pass: string): Promise<any> {
    if (em || pass) {
      return this.ngAuth.signInWithEmailAndPassword(em, pass);
    }
  }
  private signinGoogle(): Promise<any> {
    return this.ngAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }
  private signinFB(): Promise<any> {
    return this.ngAuth.signInWithPopup(
      new firebase.auth.FacebookAuthProvider()
    );
  }
  private logoutFromFirebase(): Promise<any> {
    return this.ngAuth.signOut();
  }
  private updateName(newName: string): Promise<any> {
    return firebase.auth().currentUser?.updateProfile({ displayName: newName });
  }
  private forgotPassword(): Promise<any> {
    const userEmail: any = this.currentUser?.email;
    return this.ngAuth.sendPasswordResetEmail(userEmail);
  }
  private changeEmail(newEmail: string): Promise<any> {
    return firebase.auth().currentUser?.updateEmail(newEmail);
  }
  private changePassword(newPass: string): Promise<any> {
    return firebase.auth().currentUser?.updatePassword(newPass);
  }
  // firebase functions

  // error mapper
  private mapError(error: string): void {
    switch (error) {
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
      default:
        this.snackServ.displayError();
        break;
    }
  }
  // error mapper

  constructor(
    private router: Router,
    private snackServ: SnackbarService,
    public ngAuth: AngularFireAuth,
    private ngFunc: AngularFireFunctions,
    private store: Store<AppState>
  ) {
    ngAuth.onAuthStateChanged((user) => {
      if (user !== null) {
        localStorage.setItem('uid', user.uid);
        sessionStorage.setItem('name', user.displayName);
        this.setCurrentUser(user);
      }
    });
  }
}
