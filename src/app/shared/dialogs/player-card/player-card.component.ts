import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Observable } from 'rxjs';
import { tap, map, share } from 'rxjs/operators';
import { SocialShareService } from 'src/app/services/social-share.service';
import { LOREM_IPSUM_SHORT } from '../../Constants/LOREM_IPSUM';
import { ShareData, Stats } from '../../interfaces/others.model';
import {
  PlayerMoreInfo,
  PlayerBasicInfo,
  BasicStats,
} from '../../interfaces/user.model';

@Component({
  selector: 'app-player-card',
  templateUrl: './player-card.component.html',
  styleUrls: ['./player-card.component.css'],
})
export class PlayerCardComponent implements OnInit {
  stats: {} = {};
  defaultvalue = 0;
  addiInfo$: Observable<PlayerMoreInfo>;
  plStats$: Observable<Stats>;
  isLoading: boolean = true;
  user_tours: string[] = [];
  user_teams: string[] = [];
  constructor(
    public dialogRef: MatDialogRef<PlayerCardComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: PlayerBasicInfo,
    private ngFire: AngularFirestore,
    private shareServ: SocialShareService
  ) {
    this.getAdditionalInfo();
  }
  ngOnInit(): void {}
  getAdditionalInfo() {
    this.addiInfo$ = this.ngFire
      .collection('players/' + this.data.id + '/additionalInfo')
      .doc('otherInfo')
      .get()
      .pipe(
        tap((val) => {
          this.isLoading = false;
        }),
        map((resp) => <PlayerMoreInfo>resp.data()),
        tap((resp) => {
          if (!!resp) {
            this.user_teams = !!resp.prof_teams ? resp.prof_teams : [];
            this.user_tours = !!resp.prof_tours ? resp.prof_tours : [];
          }
        }),
        share()
      );
  }
  onLoadStats() {
    this.plStats$ = this.ngFire
      .collection('players/' + this.data.id + '/additionalInfo')
      .doc('statistics')
      .get()
      .pipe(
        map((resp) => <BasicStats>resp.data()),
        map(
          (resp) =>
            <Stats>{
              Appearances: resp ? resp.apps : 0,
              Wins: resp ? resp.w : 0,
              Goals: resp ? resp.g : 0,
              Cards: resp ? resp.cards : 0,
            }
        )
      );
  }
  onCloseDialog() {
    this.dialogRef.close();
  }
  onShare(pl: PlayerBasicInfo) {
    const ShareData: ShareData = {
      share_title: pl.name,
      share_desc: LOREM_IPSUM_SHORT,
      share_url: 'https://freekyk8--h-qcd2k7n4.web.app/' + 'p/' + pl.id,
      share_imgpath: pl.imgpath_sm,
    };
    this.shareServ.onShare(ShareData);
  }
}
