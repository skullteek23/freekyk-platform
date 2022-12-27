import { Component, OnDestroy, OnInit } from '@angular/core';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { PlayerService } from 'src/app/services/player.service';
import { TeamService } from 'src/app/services/team.service';
import { AppState } from 'src/app/store/app.reducer';

@Component({
  selector: 'app-dash-team-manag',
  templateUrl: './dash-team-manag.component.html',
  styleUrls: ['./dash-team-manag.component.scss'],
})
export class DashTeamManagComponent implements OnInit, OnDestroy {

  isLoading = true;
  noTeam = false;
  showMobile = false;
  subscriptions = new Subscription();

  constructor(
    private mediaObs: MediaObserver,
    private teamService: TeamService,
    private playerService: PlayerService,
    private store: Store<AppState>
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(
      this.store
        .select('dash')
        .pipe(map((resp) => resp.hasTeam))
        .subscribe((team) => {
          this.noTeam = team == null;
        })
    );
    this.subscriptions.add(
      this.mediaObs
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
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  joinTeam(): void {
    this.teamService.onOpenJoinTeamDialog();
  }

  createTeam(): void {
    this.teamService.onOpenCreateTeamDialog();
  }

  onTCommsMobile(): void {
    this.teamService.onOpenTeamCommsMobileDialog();
  }

  onOpenTeamSettings(): void {
    this.teamService.onOpenTeamSettingsDialog();
  }
}
