import { Component, OnDestroy, OnInit } from '@angular/core';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { MatDialog } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { Observable, Subject, Subscription } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { LogoutComponent } from '../auth/logout/logout.component';
import { AccountAvatarService } from '../services/account-avatar.service';
import { AuthService } from '../services/auth.service';
import { PlayerService } from '../services/player.service';
import { TeamCommunicationService } from '../services/team-communication.service';
import { TeamService } from '../services/team.service';
import { DashState } from './store/dash.reducer';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [TeamService, PlayerService],
})
export class DashboardComponent implements OnInit, OnDestroy {
  watcher: Subscription;
  onMobile: boolean = false;
  screen: string = '';
  profile_picture: string | null | undefined = null;
  displayName: string | null | undefined = null;
  dataImg$: Observable<string>;
  dataPos$: Observable<string>;
  constructor(
    private mediaObs: MediaObserver,
    private dialog: MatDialog,
    private authServ: AuthService,
    private plServ: PlayerService,
    private teServ: TeamService,
    private avatarServ: AccountAvatarService,
    private store: Store<{
      dash: DashState;
    }>
  ) {
    this.dataImg$ = this.avatarServ.getProfilePicture();
    this.dataPos$ = this.store
      .select('dash')
      .pipe(map((resp) => resp.playerBasicInfo.pl_pos));
    this.watcher = this.mediaObs
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
      });
    this.authServ.userDataChanged.pipe(take(2)).subscribe((user) => {
      if (user != null) {
        this.displayName = user?.name;
        if (!this.displayName)
          this.displayName = sessionStorage.getItem('name');
      }
    });
  }
  ngOnInit(): void {}
  ngOnDestroy() {
    this.watcher.unsubscribe();
  }
  getMode() {
    if (this.screen == 'md') return 'over';
    else return 'side';
  }
  onLogout() {
    this.dialog.open(LogoutComponent);
  }
}
