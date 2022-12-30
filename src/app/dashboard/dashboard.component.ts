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
    private mediaObs: MediaObserver,
    private dialog: MatDialog,
    private router: Router,
    private avatarServ: AccountAvatarService,
    private store: Store<{ dash: DashState; }>
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
    return Math.min(window.screen.width, window.screen.height) < 768;
  }
}
