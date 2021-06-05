import { Component, OnInit } from '@angular/core';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { JourneyService } from 'src/app/services/journey.service';
import { ContestMobileComponent } from 'src/app/shared/components/contest-mobile/contest-mobile.component';
import { JourneyMobileComponent } from 'src/app/shared/components/journey-mobile/journey-mobile.component';
import { TrickBoxComponent } from 'src/app/shared/components/trick-box/trick-box.component';
import {
  fsLeaderboardModel,
  FsTrick,
} from 'src/app/shared/interfaces/others.model';

@Component({
  selector: 'app-dash-freestyle',
  templateUrl: './dash-freestyle.component.html',
  styleUrls: ['./dash-freestyle.component.css'],
  providers: [JourneyService],
})
export class DashFreestyleComponent implements OnInit {
  watcher: Subscription;
  showMobile: boolean = false;
  progress = '16.6%';
  ind = 0;

  ar = [1, 2, 3, 4, 5, 6, 7, 5, 5, 5, 5, 5, 5, 5, 5, 5, 55, 5, 5, 4, 5, 55, 5];
  disableButton = false;
  subm1 = false;
  subm3 = false;
  submissionLink: string = '';
  subm2 = false;
  currIndex: number = 0;
  columns = 4;
  cols = ['freestyler', 'pts'];
  fsLeaderboardDataSource: fsLeaderboardModel[] = [];
  isLoading: boolean = true;
  newEvent: FsTrick = null;
  constructor(
    private dialog: MatDialog,
    private mediaObs: MediaObserver // private lbServ: LeaderboardService
  ) {
    // this.fsLeaderboardDataSource = lbServ.getTop10FsData();
    this.watcher = mediaObs
      .asObservable()
      .pipe(
        filter((changes: MediaChange[]) => changes.length > 0),
        map((changes: MediaChange[]) => changes[0])
      )
      .subscribe((change: MediaChange) => {
        if (change.mqAlias === 'sm' || change.mqAlias === 'xs') {
          this.showMobile = true;
          this.cols = ['rank', 'freestyler', 'pts'];
        } else if (change.mqAlias === 'md') {
          this.showMobile = false;
          this.columns = 4;
          this.cols = ['rank', 'freestyler', 'country', 'pts'];
        } else {
          this.showMobile = false;
          this.columns = 5;
          this.cols = ['rank', 'freestyler', 'nickname', 'country', 'pts'];
        }
        this.isLoading = false;
      });
  }
  ngOnInit(): void {}
  ngOnDestroy() {
    this.watcher.unsubscribe();
  }
  onUpdateTrick(trick: FsTrick) {
    this.newEvent = trick;
  }
  getDate() {
    return new Date();
  }
  onViewFreestyleContests() {
    const dialogRef = this.dialog.open(ContestMobileComponent, {
      panelClass: 'fk-dialogs',
    });
  }
  onOpenJourney() {
    const dialogRef = this.dialog.open(JourneyMobileComponent, {
      panelClass: 'fk-dialogs',
    });
  }
}
