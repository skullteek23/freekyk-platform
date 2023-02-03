import { AuthService } from '@admin/services/auth.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Router, NavigationEnd } from '@angular/router';
import { SnackbarService } from '@app/services/snackbar.service';
import { Admin, AssignedRoles, FirebaseUser } from '@shared/interfaces/admin.model';
import { Observable, Subscription } from 'rxjs';
import { filter, map, share, take, tap } from 'rxjs/operators';

@Component({
  selector: 'app-main-shell',
  templateUrl: './main-shell.component.html',
  styleUrls: ['./main-shell.component.scss']
})
export class MainShellComponent implements OnDestroy, OnInit {

  activeLink = 'seasons';
  role: string;
  cols: number;
  isLoading = false;;
  links: any[] = [
    { name: 'seasons', route: 'seasons', disabled: false },
    { name: 'grounds', route: 'grounds', disabled: false },
    { name: 'my account', route: 'account', disabled: false }
  ];
  subscriptions = new Subscription();
  user$: Observable<FirebaseUser>;

  constructor(
    private mediaObs: MediaObserver,
    private router: Router,
    private authService: AuthService,
    private ngFire: AngularFirestore,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.getUser();
    this.subscriptions.add(this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        const route = event.url.split('/');
        if (route.length === 2 && route[1] === '') {
          this.router.navigate(['/']);
        } else {
          this.activeLink = route[1];
        }
      }
    }));
    this.subscriptions.add(this.mediaObs
      .asObservable()
      .pipe(
        filter((changes: MediaChange[]) => changes.length > 0),
        map((changes: MediaChange[]) => changes[0])
      )
      .subscribe((change: MediaChange) => {
        if (change.mqAlias === 'xs') {
          this.cols = 1;
        } else if (change.mqAlias === 'sm') {
          this.cols = 2;
        } else {
          this.cols = 3;
        }
      }));
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  onLogout() {
    this.authService.logOut();
  }

  getUser() {
    this.isLoading = true;
    this.user$ = this.authService.getUserDetails().pipe(take(1), tap(
      (response => {
        if (response) {
          this.getUserDetails(response.uid);
        }
      })
    ), share());
  }

  getUserDetails(uid: string) {
    if (uid) {
      this.ngFire.collection('admins').doc(uid).get().subscribe({
        next: (response) => {
          if (response.exists) {
            const adminData = response.data() as Admin;
            sessionStorage.setItem('user', JSON.stringify(adminData));
            this.role = this.authService.getUserRole(adminData.role);
            if (adminData.role === AssignedRoles.superAdmin) {
              this.links.push({ name: 'manage admins', route: 'manage-requests', disabled: false });
              this.links.push({ name: 'configurations', route: 'configurations', disabled: false });
            }
          }
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          this.snackbarService.displayError();
        }
      });
    }
  }

  goHome(): void {
    this.router.navigate(['/seasons']);
  }
}
