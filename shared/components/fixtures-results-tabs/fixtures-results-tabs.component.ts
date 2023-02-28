import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SubmitMatchRequestComponent } from '@app/shared/dialogs/submit-match-request/submit-match-request.component';
import { MatchFixture, ParseMatchProperties } from '@shared/interfaces/match.model';

@Component({
  selector: 'app-fixtures-results-tabs',
  templateUrl: './fixtures-results-tabs.component.html',
  styleUrls: ['./fixtures-results-tabs.component.scss']
})
export class FixturesResultsTabsComponent implements OnInit {
  @Input() set matches(value: MatchFixture[]) {
    this.fixtures = [];
    this.results = [];
    if (value) {
      value.forEach(match => {
        if (ParseMatchProperties.isResult(match.date)) {
          this.results.push(match);
        } else {
          this.fixtures.push(match);
        }
      });
    }
    this.index = this.fixtures.length !== 0 ? 0 : 1;
  }

  @Input() showActionBtn = true;

  fixtures: MatchFixture[] = [];
  results: MatchFixture[] = [];
  index = 0;

  constructor(
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
  }

  openMatchRequestForm() {
    this.dialog.open(SubmitMatchRequestComponent, {
      panelClass: 'fk-dialogs'
    });
  }

}
