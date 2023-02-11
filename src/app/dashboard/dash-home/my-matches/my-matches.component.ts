import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SubmitMatchRequestComponent } from '@app/shared/dialogs/submit-match-request/submit-match-request.component';
import { MatchFixture, ParseMatchProperties } from '@shared/interfaces/match.model';

export class IMyMatchesData {
  team: string = 'Team';
  teamMatches: MatchFixture[] = [];
  results: MatchFixture[] = [];
}


@Component({
  selector: 'app-my-matches',
  templateUrl: './my-matches.component.html',
  styleUrls: ['./my-matches.component.scss']
})
export class MyMatchesComponent implements OnInit {

  @Input() set matches(value: MatchFixture[]) {
    if (value) {
      value.forEach(match => {
        if (ParseMatchProperties.isResult(match.date)) {
          this.fixtures.push(match);
        } else {
          this.results.push(match);
        }
      });
    }
  }

  @Input() teamName: string = null;

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
