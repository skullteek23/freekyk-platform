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
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUser: uData | null = null;
  userDataChanged = new BehaviorSubject<uData | null>(this.currentUser);

  // private functions
  private setCurrentUser(userData: firebase.User | null) {
    this.currentUser = {
      uid: userData?.uid,
      refreshToken: userData?.refreshToken,
      name: userData?.displayName,
      email: userData?.email,
      imgpath: userData?.photoURL,
    };
    this.userDataChanged.next(this.currentUser);
  }
  private resetCurrentUser() {
    this.currentUser = null;
  }
  // private functions

  // public accessible functions
  public onlogin(logData: logDetails) {
    return this.loginOnFirebase(logData.email, logData.pass);
  }

  public onSignup(logData: logDetails) {
    return this.signupOnFirebase(logData.email, logData.pass);
  }

  public onError(error: string) {
    this.mapError(error);
  }
  public onGoogleSignin() {
    return this.signinGoogle();
  }

  public onFacebookSignin() {
    return this.signinFB();
  }
  public onLogout() {
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
  public onForgotPassword() {
    this.forgotPassword()
      .then(() => {
        console.log('password reset link sent!');
        this.snackServ.displayCustomMsgLong(
          'Password Reset link has been successfully sent! Please check your email'
        );
      })
      .catch((error) => this.mapError(error.code));
  }
  public onChangePassword(newPass: string) {
    this.changePassword(newPass)
      .then(() => {
        console.log('password changed!');
        this.snackServ.displayCustomMsg(
          'Password updated succesfully! Please login again'
        );
        setTimeout(() => {
          this.onLogout();
          location.reload();
        }, 2000);
      })
      .catch((error) => this.mapError(error));
  }
  public onChangeEmail(newEmail: string) {
    this.changeEmail(newEmail)
      ?.then(() => {
        console.log('email changed!');
        this.snackServ.displayCustomMsg(
          'Email updated succesfully! Please login again'
        );
        setTimeout(() => {
          this.onLogout();
          location.reload();
        }, 2000);
      })
      .catch((error) => this.mapError(error));
  }
  public afterSignin() {
    this.router.navigate(['/dashboard', 'home']);
    this.onSuccesslogIn(this.currentUser?.name);
  }
  public afterSignup(name?: string | null) {
    const userName = name ? name : this.currentUser?.name;
    this.router.navigate(['/dashboard', 'home']);
    this.onSuccessSignup(userName);
  }
  public createProfileByCloudFn(name: string, uid: string) {
    const callable = this.ngFunc.httpsCallable(CLOUD_FUNCTIONS.CREATE_PROFILE);
    return callable({ name: name, uid: uid }).toPromise();
  }
  public getProfilePhoto() {
    return this.currentUser?.imgpath;
  }
  public getUID() {
    if (this.currentUser?.uid) console.log('uid recieved from service!');
    return this.currentUser?.uid;
  }
  public getEmail() {
    if (this.currentUser?.email) console.log('email recieved from service!');
    return this.currentUser?.email;
  }
  public getName() {
    if (this.currentUser?.name) console.log('name recieved from service!');
    return this.currentUser?.name;
  }
  // public accessible functions

  //success display functions
  private onSuccesslogIn(name: string | undefined | null) {
    this.snackServ.displayCustomMsgLong(`Welcome back, ${name}!`);
  }
  private onSuccessSignup(name: string | undefined | null) {
    this.snackServ.displayCustomMsgLong(`Welcome, ${name}!`);
  }
  private onSuccesslogOut() {
    this.snackServ.displayCustomMsgLong('Successfully logged out!');
  }
  //success display functions

  // error display functions
  private passwordIncorrect() {
    this.snackServ.displayCustomMsgLong('Incorrect password! Please try again');
  }
  private passwordWeak() {
    this.snackServ.displayCustomMsgLong(
      'Password too weak! Please try another one'
    );
  }
  private emailIncorrect() {
    this.snackServ.displayCustomMsgLong('Incorrect email! Please try again');
  }
  private emailAlreadyRegistered() {
    this.snackServ.displayCustomMsgLong(
      'Email already registered! Please try another one'
    );
  }
  private accountNotExist() {
    this.snackServ.displayCustomMsgLong(
      'Account does not exist! Please sign up'
    );
  }
  private sessionExpired() {
    this.snackServ.displayCustomMsgLong('Session Expired! Please login again');
  }
  private tooManyRequests() {
    this.snackServ.displayCustomMsgLong(
      'Request error! Please try again after sometime'
    );
  }
  private popupClosedByUser() {
    this.snackServ.displayCustomMsgLong('Please sign in using the popup box');
  }
  private networkFail() {
    this.snackServ.displayCustomMsgLong(
      'Please check your internet connection'
    );
  }
  // error display functions

  //firebase functions
  private signupOnFirebase(newEmail: string, newPass: string) {
    if (newEmail || newPass)
      return this.ngAuth.createUserWithEmailAndPassword(newEmail, newPass);
  }
  private loginOnFirebase(em: string, pass: string) {
    if (em || pass) return this.ngAuth.signInWithEmailAndPassword(em, pass);
  }
  private signinGoogle() {
    return this.ngAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }
  private signinFB() {
    return this.ngAuth.signInWithPopup(
      new firebase.auth.FacebookAuthProvider()
    );
  }
  private logoutFromFirebase() {
    return this.ngAuth.signOut();
  }
  private updateName(newName: string) {
    return firebase.auth().currentUser?.updateProfile({ displayName: newName });
  }
  private forgotPassword() {
    const userEmail: any = this.currentUser?.email;
    return this.ngAuth.sendPasswordResetEmail(userEmail);
  }
  private changeEmail(newEmail: string) {
    return firebase.auth().currentUser?.updateEmail(newEmail);
  }
  private changePassword(newPass: string) {
    return firebase.auth().currentUser?.updatePassword(newPass);
  }
  //firebase functions

  //error mapper
  private mapError(error: string) {
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
  //error mapper

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
