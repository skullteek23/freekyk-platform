import { Component, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatchFixture } from '@shared/interfaces/match.model';
import { Subject, Subscription } from 'rxjs';

@Component({
  selector: 'app-fixture-dashboard',
  templateUrl: './fixture-dashboard.component.html',
  styleUrls: ['./fixture-dashboard.component.scss'],
})
export class FixtureDashboardComponent implements OnInit, OnDestroy {

  @Input('matchData') fixture: MatchFixture | null = null;
  @Input('premium') isPremium = false;
  @Input('resultMode') isResult = false;
  @Input('addSticker') myTeam: string = null;

  @Output() selectFixture = new Subject<MatchFixture>();

  todaysDate = new Date();
  subscriptions = new Subscription();

  constructor() { }

  ngOnInit(): void { }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onSelectFixture() {
    this.selectFixture.next(this.fixture);
  }
}
