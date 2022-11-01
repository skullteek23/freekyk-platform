import { Injectable } from '@angular/core';
import firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { uData, logDetails } from '@shared/interfaces/others.model';
import { SnackbarService } from './snackbar.service';
import { CLOUD_FUNCTIONS } from '@shared/Constants/CLOUD_FUNCTIONS';
import { EMAIL_PASS_CHANGE_TIMEOUT_IN_MILI } from '@shared/Constants/DEFAULTS';

@Injectable({
  providedIn: 'root',
})

export class AuthService {

  userDataChanged = new BehaviorSubject<uData | null>(null);
  private currentUser: uData | null = null;

  constructor(
    private router: Router,
    private snackbarService: SnackbarService,
    private ngAuth: AngularFireAuth,
    private ngFunc: AngularFireFunctions
  ) {
    ngAuth.onAuthStateChanged((user) => {
      if (user !== null) {
        localStorage.setItem('uid', user.uid);
        sessionStorage.setItem('name', user.displayName);
        this.setCurrentUser(user);
      }
    });
  }

  onlogin(logData: logDetails): Promise<any> {
    return this.loginOnFirebase(logData.email, logData.pass);
  }

  onSignup(logData: logDetails): Promise<any> {
    return this.signupOnFirebase(logData.email, logData.pass);
  }

  onError(error: string): void {
    this.mapError(error);
  }

  onGoogleSignIn(): Promise<any> {
    return this.signInGoogle();
  }

  onFacebookSignIn(): Promise<any> {
    return this.signInFacebook();
  }

  onLogout(): void {
    this.logoutFromFirebase()
      .then(() => {
        this.resetCurrentUser();
        sessionStorage.clear();
        localStorage.removeItem('uid');
        // console.log('logged out!');
        this.onSuccesslogOut();
        location.href = '/';
      })
      .catch((error) => this.mapError(error.code));
  }

  onForgotPassword(): void {
    this.forgotPassword()
      .then(() => {
        // console.log('password reset link sent!');
        this.snackbarService.displayCustomMsg(
          'Password Reset link has been successfully sent! Please check your email'
        );
      })
      .catch((error) => this.mapError(error.code));
  }

  onChangePassword(newPass: string): void {
    this.ngAuth.currentUser.then((user) => {
      const lastSignInTime = new Date(user.metadata.lastSignInTime);
      if (new Date().getTime() - lastSignInTime.getTime() <= EMAIL_PASS_CHANGE_TIMEOUT_IN_MILI) {
        this.changePassword(newPass)
          .then(() => {
            // console.log('password changed!');
            this.snackbarService.displayCustomMsg(
              'Password updated successfully! Please login again'
            );
            this.onLogout();
          })
          .catch((error) => this.mapError(error));
      } else {
        this.snackbarService.displayCustomMsg('Please login again to verify!');
      }
    });
  }


  onChangeEmail(newEmail: string): void {
    this.ngAuth.currentUser.then((user) => {
      const lastSignInTime = new Date(user.metadata.lastSignInTime);
      if (new Date().getTime() - lastSignInTime.getTime() <= EMAIL_PASS_CHANGE_TIMEOUT_IN_MILI) {
        this.changeEmail(newEmail)
          ?.then(() => {
            // console.log('email changed!');
            this.snackbarService.displayCustomMsg(
              'Email updated successfully! Please login again'
            );
            this.onLogout();
          })
          .catch((error) => this.mapError(error));
      } else {
        this.snackbarService.displayCustomMsg('Please login again to verify!');
      }
    });
  }

  afterSignIn(): void {
    this.router.navigate(['/dashboard', 'home']);
    this.onSuccessLogIn(this.currentUser?.name);
  }

  afterSignup(): void {
    const name = sessionStorage.getItem('name');
    const userName = name ? name : this.currentUser?.name;
    this.router.navigate(['/dashboard', 'home']);
    this.onSuccessSignup(userName);
  }

  createProfileByCloudFn(name: string, uid: string): Promise<any> {
    const callable = this.ngFunc.httpsCallable(CLOUD_FUNCTIONS.CREATE_PROFILE);
    return callable({ name, uid }).toPromise();
  }

  getProfilePhoto(): void {
    return this.currentUser?.imgpath;
  }

  getUID(): void {
    if (this.currentUser?.uid) {
      // console.log('uid received from service!');
    }
    return this.currentUser?.uid;
  }

  getEmail(): void {
    if (this.currentUser?.email) {
      // console.log('email received from service!');
    }
    return this.currentUser?.email;
  }

  getName(): void {
    if (this.currentUser?.name) {
      // console.log('name received from service!');
    }
    return this.currentUser?.name;
  }

  updateAuthDisplayName(name: string) {
    this.updateName(name);
  }

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

  // success display functions
  private onSuccessLogIn(name: string | undefined | null): void {
    this.snackbarService.displayCustomMsg(`Welcome back, ${name}!`);
  }
  private onSuccessSignup(name: string | undefined | null): void {
    this.snackbarService.displayCustomMsg(`Welcome, ${name}!`);
  }
  private onSuccesslogOut(): void {
    this.snackbarService.displayCustomMsg('Successfully logged out!');
  }
  // success display functions

  // error display functions
  private passwordIncorrect(): void {
    this.snackbarService.displayCustomMsg('Incorrect password! Please try again');
  }
  private passwordWeak(): void {
    this.snackbarService.displayCustomMsg(
      'Password too weak! Please try another one'
    );
  }
  private emailIncorrect(): void {
    this.snackbarService.displayCustomMsg('Incorrect email! Please try again');
  }
  private emailAlreadyRegistered(): void {
    this.snackbarService.displayCustomMsg(
      'Email already registered! Please try another one'
    );
  }
  private accountNotExist(): void {
    this.snackbarService.displayCustomMsg(
      'Account does not exist! Please sign up'
    );
  }
  private sessionExpired(): void {
    this.snackbarService.displayCustomMsg('Session Expired! Please login again');
  }
  private tooManyRequests(): void {
    this.snackbarService.displayCustomMsg(
      'Request error! Please try again after sometime'
    );
  }
  private popupClosedByUser(): void {
    this.snackbarService.displayCustomMsg('Please sign in using the popup box');
  }
  private networkFail(): void {
    this.snackbarService.displayCustomMsg(
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
  private signInGoogle(): Promise<any> {
    return this.ngAuth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }
  private signInFacebook(): Promise<any> {
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
        this.snackbarService.displayError('Error occurred!');
        break;
    }
  }
  // error mapper
}
