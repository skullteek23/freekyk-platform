import { Component, OnDestroy, OnInit } from '@angular/core';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
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
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {

  watcher: Subscription;
  // onMobile = false;
  screen = '';
  dataImg$: Observable<string>;
  dataPos$: Observable<string>;
  playerName = 'NA';
  subscriptions = new Subscription();
  sidenavOpenState: boolean;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private avatarServ: AccountAvatarService,
    private mediaObs: MediaObserver,
    private store: Store<{ dash: DashState; }>
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(
      this.mediaObs
        .asObservable()
        .pipe(
          filter((changes: MediaChange[]) => changes.length > 0),
          map((changes: MediaChange[]) => changes[0])
        )
        .subscribe((change: MediaChange) => {
          if (change.mqAlias === 'sm' || change.mqAlias === 'xs') {
          } else if (change.mqAlias === 'md') {
            this.screen = 'md';
          } else if (change.mqAlias === 'lg') {
            this.screen = 'lg';
          } else {
            this.screen = 'xl';
          }
        })
    );
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
        this.playerName = data;
      }));
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

  get onMobile(): boolean {
    return window.screen.width < 768;
  }
}
