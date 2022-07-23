import { Component, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, Subscription } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { MatchFixture, tempFullFixtureData } from 'src/app/shared/interfaces/match.model';
import { MatchCardAdminComponent } from '../../../dialogs/match-card-admin/match-card-admin.component';

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
  constructor(private dialog: MatDialog) { }
  ngOnInit(): void { }
  ngOnDestroy() {
    if (this.adminSub) this.adminSub.unsubscribe();
  }
  onOpenFixture(fixtData: 'fixture' | 'result') {
    // if (this.admin) {
    const data = this.fixture;
    const dialogRef = this.dialog.open(MatchCardAdminComponent, {
      panelClass: 'fk-dialogs',
      data: data,
    });
    this.adminSub = dialogRef
      .afterClosed()
      .pipe(
        take(1),
        filter((r) => r != null)
      )
      .subscribe((data: tempFullFixtureData) => this.adminData.next(data));
    // } else {
    // const dialogRef = this.dialog.open(match, {
    //   panelClass: 'fk-dialogs',
    //   data: this.fixture,
    // });
    // }
  }
}
