import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Router } from '@angular/router';
import { logDetails } from '@shared/interfaces/others.model';
import { SnackbarService } from './snackbar.service';
import { CLOUD_FUNCTIONS } from '@shared/Constants/CLOUD_FUNCTIONS';
import firebase from 'firebase/app';

export type authUser = firebase.auth.UserCredential;
export interface User {
  id: string;
  name: string;
  email: string
}

@Injectable({
  providedIn: 'root',
})

export class AuthService {

  constructor(
    private router: Router,
    private snackbarService: SnackbarService,
    private ngAuth: AngularFireAuth,
    private ngFunc: AngularFireFunctions
  ) {
    // ngAuth.onAuthStateChanged((user) => {
    //   if (user !== null) {
    //     // localStorage.setItem('uid', user.uid);
    //     // sessionStorage.setItem('name', user.displayName);
    //   }
    // });
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

  onLogout(): void {
    this.ngAuth.signOut()
      .then(() => {
        this.snackbarService.displayCustomMsg('Logged out!');
        localStorage.removeItem('uid');
        sessionStorage.clear();
        location.href = '/';
      })
      .catch((error) => this.handleAuthError(error.code));
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
    this.snackbarService.displayCustomMsg('Incorrect password! Please try again');
  }
  passwordWeak(): void {
    this.snackbarService.displayCustomMsg(
      'Password too weak! Please try another one'
    );
  }
  emailIncorrect(): void {
    this.snackbarService.displayCustomMsg('Incorrect email! Please try again');
  }
  emailAlreadyRegistered(): void {
    this.snackbarService.displayCustomMsg(
      'Email already registered! Please try another one'
    );
  }
  accountNotExist(): void {
    this.snackbarService.displayCustomMsg(
      'Account does not exist! Please sign up'
    );
  }
  sessionExpired(): void {
    this.snackbarService.displayCustomMsg('Session Expired! Please login again');
  }
  tooManyRequests(): void {
    this.snackbarService.displayCustomMsg(
      'Request error! Please try again after sometime'
    );
  }
  popupClosedByUser(): void {
    this.snackbarService.displayCustomMsg('Please sign in using the popup box');
  }
  networkFail(): void {
    this.snackbarService.displayCustomMsg(
      'Please check your internet connection'
    );
  }
  // error display functions

  // error mapper
  handleAuthError(error): void {
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
      default:
        this.snackbarService.displayError('Error occurred!');
        break;
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
