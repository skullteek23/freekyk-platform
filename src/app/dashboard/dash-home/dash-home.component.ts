import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { MatTabGroup } from '@angular/material/tabs';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { TeamService } from 'src/app/services/team.service';
import { DashState } from '../store/dash.reducer';

@Component({
  selector: 'app-dash-home',
  templateUrl: './dash-home.component.html',
  styleUrls: ['./dash-home.component.scss'],
})
export class DashHomeComponent implements OnInit, OnDestroy {
  @ViewChild(MatTabGroup) tabs: MatTabGroup;
  isLoading = true;
  yourTeamIndex = 0;
  subscriptions = new Subscription();
  showMobile = false;
  order1: string;
  order2: string;
  order3: string;
  order4: string;

  constructor(
    private mediaObs: MediaObserver,
    private teamService: TeamService,
    private store: Store<{
      dash: DashState;
    }>
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
            this.showMobile = true;
          } else {
            this.showMobile = false;
          }
          this.isLoading = false;
        })
    );
    this.subscriptions.add(
      this.store
        .select('dash')
        .pipe(map((resp) => resp.hasTeam))
        .subscribe((hasTeam) => (this.yourTeamIndex = hasTeam ? 1 : 0))
    );
    this.order1 = '0';
    this.order2 = '1';
    this.order3 = '2';
    this.order4 = '3';
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  onComplete(ev: any): void {
    if (ev) {
      this.order1 = '1';
      this.order2 = '3';
      this.order3 = '0';
      this.order4 = '2';
    }
  }
  joinTeam(): void {
    this.teamService.onOpenJoinTeamDialog();
  }
  createTeam(): void {
    this.teamService.onOpenCreateTeamDialog();
  }
}
