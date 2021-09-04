import { Component, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, Subscription } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { MatchCardComponent } from '../../dialogs/match-card/match-card.component';
import {
  MatchFixture,
  tempFullFixtureData,
} from '../../interfaces/match.model';

@Component({
  selector: 'app-fixture-basic',
  templateUrl: './fixture-basic.component.html',
  styleUrls: ['./fixture-basic.component.css'],
})
export class FixtureBasicComponent implements OnInit, OnDestroy {
  @Input('matchData') fixture: MatchFixture;
  @Input('premium') isPremium: boolean = false;
  @Input('resultMode') isResult: boolean = false;
  @Input() admin: boolean = false;
  @Output() adminData = new Subject<tempFullFixtureData>();
  adminSub: Subscription;
  todaysDate = new Date();
  constructor(private dialog: MatDialog) {}
  ngOnInit(): void {}
  ngOnDestroy() {
    if (this.adminSub) this.adminSub.unsubscribe();
  }
  onOpenFixture(fixtData: 'fixture' | 'result') {
    const dialogRef = this.dialog.open(MatchCardComponent, {
      panelClass: 'fk-dialogs',
      data: this.fixture,
    });
  }
}
