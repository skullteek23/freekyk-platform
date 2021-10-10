import { Component, OnDestroy, OnInit } from '@angular/core';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { TeamService } from 'src/app/services/team.service';

@Component({
  selector: 'app-dash-home',
  templateUrl: './dash-home.component.html',
  styleUrls: ['./dash-home.component.css'],
})
export class DashHomeComponent implements OnInit, OnDestroy {
  isLoading = true;
  yourTeamIndex = 0;
  subscriptions = new Subscription();
  showMobile = false;
  order1: string;
  order2: string;
  order3: string;

  constructor(private mediaObs: MediaObserver, private teServ: TeamService) {}
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
    this.order1 = '0';
    this.order2 = '1';
    this.order3 = '2';
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  onComplete(ev: any): void {
    if (ev) {
      this.order1 = '1';
      this.order2 = '2';
      this.order3 = '0';
    }
  }
  joinTeam(): void {
    this.teServ.onOpenJoinTeamDialog();
  }
  createTeam(): void {
    this.teServ.onOpenCreateTeamDialog();
  }
}
