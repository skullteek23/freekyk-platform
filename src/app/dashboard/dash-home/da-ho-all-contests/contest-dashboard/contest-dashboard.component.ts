import { Component, Input, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ContestInfoComponent } from 'src/app/shared/dialogs/contest-info/contest-info.component';
import { ContestBasicInfo } from 'src/app/shared/interfaces/contest.model';

@Component({
  selector: 'app-contest-dashboard',
  templateUrl: './contest-dashboard.component.html',
  styleUrls: ['./contest-dashboard.component.css'],
})
export class ContestDashboardComponent implements OnInit {
  @Input('type') contestType: 'upcoming' | 'active' | 'finished' = 'upcoming';
  @Input('data') contests: ContestBasicInfo[] = [];
  myContests: ContestBasicInfo[];
  noUpcomingContests: boolean = false;
  constructor(private dialog: MatDialog, private ngFire: AngularFirestore) {}
  ngOnInit(): void {}
  onShowContestInfo(contest: ContestBasicInfo) {
    const dialogRef = this.dialog.open(ContestInfoComponent, {
      panelClass: 'large-dialogs',
      data: contest,
    });
  }
  getUpcomingContests() {
    const todaysDate = new Date();
    this.ngFire
      .collection('contests', (ref) =>
        ref.where('start_date', '==', todaysDate)
      )
      .get()
      .toPromise()
      .then((doc) => {
        if (doc.empty) this.noUpcomingContests = true;
        else {
          doc.forEach((element) => {
            this.myContests.push(<ContestBasicInfo>element.data());
          });
        }
      });
  }
  getDate() {
    return new Date();
  }
  onParticipate(contest: ContestBasicInfo) {
    if (this.contestType == 'upcoming') this.onShowContestInfo(contest);
  }
}
