import { Component, OnDestroy, OnInit } from '@angular/core';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { TeamService } from 'src/app/services/team.service';
import { AppState } from 'src/app/store/app.reducer';

@Component({
  selector: 'app-dash-team-manag',
  templateUrl: './dash-team-manag.component.html',
  styleUrls: ['./dash-team-manag.component.css'],
})
export class DashTeamManagComponent implements OnInit, OnDestroy {
  isLoading: boolean = true;
  noTeam = false;
  showMobile: boolean = false;
  watcher: Subscription;

  constructor(
    private mediaObs: MediaObserver,
    private teServ: TeamService,
    private store: Store<AppState>
  ) {
    this.store
      .select('dash')
      .pipe(map((resp) => resp.hasTeam))
      .subscribe((team) => {
        this.noTeam = team == null;
      });
    this.watcher = mediaObs
      .asObservable()
      .pipe(
        filter((changes: MediaChange[]) => changes.length > 0),
        map((changes: MediaChange[]) => changes[0])
      )
      .subscribe((change: MediaChange) => {
        if (change.mqAlias === 'sm' || change.mqAlias === 'xs') {
          this.showMobile = true;
        } else {
          this.showMobile = false;
        }

        this.isLoading = false;
      });
  }
  ngOnInit(): void {}
  ngOnDestroy() {
    this.watcher.unsubscribe();
  }
  joinTeam() {
    this.teServ.onOpenJoinTeamDialog();
  }
  createTeam() {
    this.teServ.onOpenCreateTeamDialog();
  }
  onTCommsMobile() {
    this.teServ.onOpenTeamCommsMobileDialog();
  }
  onOpenTeamSettings() {
    this.teServ.onOpenTeamSettingsDialog();
  }
}
