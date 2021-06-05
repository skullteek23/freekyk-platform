import { Component, OnInit } from '@angular/core';
import { MatchCardComponent } from 'src/app/shared/dialogs/match-card/match-card.component';
import firebase from 'firebase/app';
import { MatDialog } from '@angular/material/dialog';
import { MatchFixture } from 'src/app/shared/interfaces/match.model';
@Component({
  selector: 'app-pl-st-knockout',
  templateUrl: './pl-st-knockout.component.html',
  styleUrls: ['./pl-st-knockout.component.css'],
})
export class PlStKnockoutComponent implements OnInit {
  result = false;
  constructor(private dialog: MatDialog) {}
  ngOnInit(): void {}
  getDate() {
    return new Date();
  }
  onOpenFixture(fixtData: 'fixture' | 'result') {
    const matchFixture: MatchFixture = {
      date: firebase.firestore.Timestamp.fromDate(new Date()),
      teams: ['Team A', 'Team B'],
      concluded: false,
      logos: [
        'https://images.unsplash.com/photo-1612017071647-4466ded889b8?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'https://images.unsplash.com/photo-1612064544259-2d41a595ad91?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80',
      ],
      score: [1, 0],
      season: 'Season A',
      premium: false,
      type: 'FKC',
      locCity: 'Ghaziabad',
      locState: 'Uttar Pradesh',
    };

    const dialogRef = this.dialog.open(MatchCardComponent, {
      panelClass: 'fk-dialogs',
      data: matchFixture,
    });
  }
}
