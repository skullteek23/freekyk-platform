import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatchCardComponent } from '@shared/dialogs/match-card/match-card.component';
import { MatchFixture } from '@shared/interfaces/match.model';

@Component({
  selector: 'app-knockout-strip',
  templateUrl: './knockout-strip.component.html',
  styleUrls: ['./knockout-strip.component.css'],
  providers: [DatePipe],
})
export class KnockoutStripComponent implements OnInit {
  @Input() match: MatchFixture;
  constructor(private datePipe: DatePipe, private dialog: MatDialog) { }

  ngOnInit(): void { }
  checkTBD(date: number): string {
    if (new Date(date).getHours() === 0) {
      return 'TBD';
    }
    return this.datePipe.transform(date, 'shortTime');
  }
  openFixture() {
    const dialogRef = this.dialog.open(MatchCardComponent, {
      panelClass: 'fk-dialogs',
      data: this.match,
    });
  }
}
