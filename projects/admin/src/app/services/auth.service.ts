import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireFunctions } from '@angular/fire/functions';
import { Router } from '@angular/router';
import { SnackbarService } from '@app/services/snackbar.service';
import { CLOUD_FUNCTIONS } from '@shared/Constants/CLOUD_FUNCTIONS';
import { Admin, AssignedRoles, FirebaseUser, FirebaseUserCredential } from '@shared/interfaces/admin.model';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private user: FirebaseUser;
  private userRoleMap = new Map<AssignedRoles, string>();

  constructor(
    private ngAuth: AngularFireAuth,
    private ngFirestore: AngularFirestore,
    private snackbarService: SnackbarService,
    private router: Router,
    private ngFunctions: AngularFireFunctions
  ) {
    // this.addSuperAdmin();
    ngAuth.onAuthStateChanged((user) => {
      if (user !== null) {
        this.user = user;
        sessionStorage.setItem('uid', user.uid);
      }
    });

    this.userRoleMap.set(AssignedRoles.superAdmin, 'Super Admin');
    this.userRoleMap.set(AssignedRoles.organizer, 'Freekyk Organizer');
  }

  isLoggedIn(): boolean {
    const uid = sessionStorage.getItem('uid');
    return uid !== null && uid !== undefined && uid !== '';
  }

  logIn(email: string, password: string): Promise<FirebaseUserCredential> {
    if (email && password) {
      return this.ngAuth.signInWithEmailAndPassword(email, password);
    }
  }

  registerUserByEmail(formData: Admin): Promise<any> {
    if (formData && Object.keys(formData).length) {
      const callable = this.ngFunctions.httpsCallable(CLOUD_FUNCTIONS.CREATE_ADMIN_USER);
      return callable(formData).toPromise();
    }
  }

  logOut(): void {
    this.ngAuth.signOut()
      .then(() => {
        this.user = null;
        sessionStorage.clear();
        localStorage.clear();
        this.router.navigate(['/login']);
      })
      .catch((error) => {
        const errorMessage = this.getErrorMessage(error.code);
        this.snackbarService.displayError(errorMessage);
      });
  }


  getUserDetails(): Observable<FirebaseUser> {
    return this.ngAuth.user.pipe(take(1));
  }

  getUser(): FirebaseUser {
    return this.user || null;
  }

  getUID(): string {
    if (this.user) {
      return this.user.uid;
    } else {
      return sessionStorage.getItem('uid');
    }
  }

  getToken(): string {
    if (this.user?.refreshToken) {
      return this.user?.refreshToken;
    }
    return null;
  }

  isValidAndActivatedAccount(id: string, email: string): Promise<boolean> {
    return this.ngFirestore.collection('admins').doc(id).get().pipe(map(res => {
      // Only allow login when user is activated and email exists
      if (res.exists) {
        const resData = res.data() as Admin;
        return resData.status === 1 && resData.email === email;
      }
      return false;
    })).toPromise();
  }

  getUserRole(role: AssignedRoles) {
    return this.userRoleMap.get(role);
  }

  getErrorMessage(error: string): string {
    switch (error) {
      case 'auth/email-already-in-use':
        return this.emailAlreadyRegistered();
      case 'auth/account-exists-with-different-credential':
        return this.emailAlreadyRegistered();
      case 'auth/network-request-failed':
        return this.networkFail();
      case 'auth/invalid-email':
        return this.emailIncorrect();
      case 'auth/wrong-password':
        return this.passwordIncorrect();
      case 'auth/weak-password':
        return this.passwordWeak();
      case 'auth/id-token-expired':
        return this.sessionExpired();
      case 'auth/user-not-found':
        return this.accountNotExist();
      case 'auth/uid-already-exists':
        return this.emailAlreadyRegistered();
      case 'auth/too-many-requests':
        return this.tooManyRequests();
      case 'auth/popup-closed-by-user':
        return this.popupClosedByUser();
    }
  }

  // error display functions
  private passwordIncorrect(): string {
    return 'Incorrect password! Please try again';
  }
  private passwordWeak(): string {
    return 'Password too weak! Please try another one';
  }
  private emailIncorrect(): string {
    return 'Incorrect email! Please try again';
  }
  private emailAlreadyRegistered(): string {
    return 'Email already registered! Please try another one';
  }
  private accountNotExist(): string {
    return 'Account does not exist! Please sign up';
  }
  private sessionExpired(): string {
    return 'Session Expired! Please login again';
  }
  private tooManyRequests(): string {
    return 'Request error! Please try again after sometime';
  }
  private popupClosedByUser(): string {
    return 'Please sign in using the popup box';
  }
  private networkFail(): string {
    return 'Please check your internet connection';
  }
  // error display functions

  private addSuperAdmin() {
    this.ngAuth.createUserWithEmailAndPassword('@freekyk.com', 'super-user').then(user => {
      if (user && user.user.uid) {
        this.ngFirestore.collection('admins').doc(user.user.uid).set({
          name: '',
          email: '@freekyk.com',
          contactNumber: 0,
          location: {
            city: 'Ghaziabad',
            state: 'Uttar Pradesh',
            country: 'India'
          },
          status: 1,
          role: AssignedRoles.superAdmin,
          altContactNumber: 0,
          selfGround: 1,
          website: 'www.freekyk.com',
          imgPathLogo: 'https://www.erithtown.com/wp-content/themes/victory/includes/images/badge-placeholder.png',
          company: 'Freekyk India',
        } as Admin);
      }
    });
  }
}
