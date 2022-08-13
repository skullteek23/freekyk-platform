import { Component, OnDestroy, OnInit } from '@angular/core';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { MatDialog } from '@angular/material/dialog';
import { MatDrawerMode } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { LogoutComponent } from '../auth/logout/logout.component';
import { AccountAvatarService } from '../services/account-avatar.service';
import { DashState } from './store/dash.reducer';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  watcher: Subscription;
  onMobile = false;
  screen = '';
  dataImg$: Observable<string>;
  dataPos$: Observable<string>;
  playerName: string = 'NA';
  subscriptions = new Subscription();
  sidenavOpenState: boolean;
  constructor(
    private mediaObs: MediaObserver,
    private dialog: MatDialog,
    private router: Router,
    private avatarServ: AccountAvatarService,
    private store: Store<{
      dash: DashState;
    }>
  ) { }
  ngOnInit(): void {
    if (window.location.href.endsWith('dashboard')) {
      this.router.navigate(['/dashboard/home']);
    }
    this.onResizeScreen();
    this.dataImg$ = this.avatarServ.getProfilePicture();
    this.dataPos$ = this.store
      .select('dash')
      .pipe(map((resp) => resp.playerBasicInfo.pl_pos));
    this.subscriptions.add(this.store
      .select('dash')
      .pipe(map((resp) => resp.playerBasicInfo.name))
      .subscribe(data => {
        console.log(data)
        this.playerName = data;
      }));
    this.subscriptions.add(
      this.mediaObs
        .asObservable()
        .pipe(
          filter((changes: MediaChange[]) => changes.length > 0),
          map((changes: MediaChange[]) => changes[0])
        )
        .subscribe((change: MediaChange) => {
          if (change.mqAlias === 'sm' || change.mqAlias === 'xs') {
            this.onMobile = true;
          } else if (change.mqAlias === 'md') {
            this.onMobile = false;
            this.screen = 'md';
          } else if (change.mqAlias === 'lg') {
            this.onMobile = false;
            this.screen = 'lg';
          } else {
            this.onMobile = false;
            this.screen = 'xl';
          }
        })
    );
    // this.subscriptions.add(
    //   this.authServ.userDataChanged.pipe(take(2)).subscribe((user) => {
    //     console.log(user, 'user')
    //     if (user != null) {
    //       this.displayName = user?.name;
    //       if (!this.displayName) {
    //         this.displayName = sessionStorage.getItem('name');
    //       }
    //     }
    //   })
    // );
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  onResizeScreen(): void {
    this.sidenavOpenState = window.innerWidth >= 1489;
  }
  getMode(): MatDrawerMode {
    return this.screen === 'md' ? 'over' : 'side';
  }
  onLogout(): void {
    this.dialog.open(LogoutComponent);
  }
}
