import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FeatureInfoComponent } from 'src/app/shared/dialogs/feature-info/feature-info.component';
import { fsLeaderboardModel } from 'src/app/shared/interfaces/others.model';
import { LeaderboardService } from '../leaderboard.service';

@Component({
  selector: 'app-fs-leaderboard',
  templateUrl: './fs-leaderboard.component.html',
  styleUrls: ['./fs-leaderboard.component.css'],
})
export class FsLeaderboardComponent implements OnInit {
  fsLeaderboardDataSource: fsLeaderboardModel[] = [];
  constructor(private dialog: MatDialog, private lbServ: LeaderboardService) {
    this.fsLeaderboardDataSource = this.lbServ.getFsData();
  }
  ngOnInit(): void {}
  onLearnMore(data: any) {
    const dialogRef = this.dialog.open(FeatureInfoComponent, {
      panelClass: 'large-dialogs',
      data: data,
    });
  }
}
