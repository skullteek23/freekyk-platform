import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { SocialShareService } from 'src/app/services/social-share.service';
import { LOREM_IPSUM_SHORT } from 'src/app/shared/Constants/CONSTANTS';
import { ContestInfoComponent } from 'src/app/shared/dialogs/contest-info/contest-info.component';
import { ContestBasicInfo } from 'src/app/shared/interfaces/contest.model';
import { ShareData } from 'src/app/shared/interfaces/others.model';

@Component({
  selector: 'app-fs-contests',
  templateUrl: './fs-contests.component.html',
  styleUrls: ['./fs-contests.component.css'],
})
export class FsContestsComponent implements OnInit {
  isLoading = true;
  noContests = false;
  contests$: Observable<ContestBasicInfo[]>;
  conFilters = ['Upcoming', 'Gender'];
  todaysDate: Date;
  constructor(
    private dialog: MatDialog,
    private ngFire: AngularFirestore,
    private shareServ: SocialShareService
  ) {}
  ngOnInit(): void {
    this.todaysDate = new Date();
    this.getContests();
  }
  onViewContestInfo(contest: ContestBasicInfo) {
    const dialogRef = this.dialog.open(ContestInfoComponent, {
      panelClass: 'large-dialogs',
      data: contest,
    });
  }
  getContests() {
    this.contests$ = this.ngFire
      .collection('contests')
      .get()
      .pipe(
        tap((val) => {
          this.isLoading = false;
          this.noContests = val.empty;
        }),
        map((resp) =>
          resp.docs.map(
            (doc) =>
              <ContestBasicInfo>{
                id: doc.id,
                ...(<ContestBasicInfo>doc.data()),
              }
          )
        )
      );
  }
  onShareContest(con: ContestBasicInfo) {
    const sData: ShareData = {
      share_desc: LOREM_IPSUM_SHORT,
      share_imgpath: con.imgpath,
      share_title: con.name,
      share_url: 'https://freekyk8--h-qcd2k7n4.web.app/freestyle/contests',
    };
    this.shareServ.onShare(sData);
  }
}
