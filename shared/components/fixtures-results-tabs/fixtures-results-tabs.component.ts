import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SubmitMatchRequestComponent } from '@app/main-shell/components/submit-match-request/submit-match-request.component';
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
  }

  @Input() showActionBtn = true;

  fixtures: MatchFixture[] = [];
  results: MatchFixture[] = [];

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
