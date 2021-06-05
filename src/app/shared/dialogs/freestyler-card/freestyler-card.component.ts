import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { tap, map, share } from 'rxjs/operators';
import { SocialShareService } from 'src/app/services/social-share.service';
import { LOREM_IPSUM_SHORT } from '../../Constants/CONSTANTS';
import { ShareData, StatsFs } from '../../interfaces/others.model';
import {
  FsBasic,
  FsProfileVideos,
  FsStats,
  PlayerMoreInfo,
} from '../../interfaces/user.model';

@Component({
  selector: 'app-freestyler-card',
  templateUrl: './freestyler-card.component.html',
  styleUrls: ['./freestyler-card.component.css'],
})
export class FreestylerCardComponent implements OnInit {
  defaultvalue = 0;
  addiInfo$: Observable<PlayerMoreInfo>;
  fsStats$: Observable<StatsFs>;
  fsVideos$: Observable<string[]>;
  topVids: string[] = [];
  isLoading: boolean = true;
  constructor(
    public dialogRef: MatDialogRef<FreestylerCardComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: FsBasic,
    private ngFire: AngularFirestore,
    private shareServ: SocialShareService
  ) {
    this.getAdditionalInfo();
  }
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
        share()
      );
  }

  ngOnInit(): void {}
  onLoadStats() {
    this.fsStats$ = this.ngFire
      .collection('freestylers/' + this.data.id + '/additionalInfoFs')
      .doc('statistics')
      .get()
      .pipe(
        map((resp) => <FsStats>resp.data()),
        tap((resp) => (this.topVids = resp ? resp.top_vids : [])),
        map(
          (resp) =>
            <StatsFs>{
              'Skill Level': resp ? resp.sk_lvl : 0,
              'Journey Tricks Completed': resp ? resp.tr_a : 0,
              'Brand Collaborations': resp ? resp.br_colb.length : 0,
            }
        )
      );
    this.fsVideos$ = this.ngFire
      .collection('freestylers/' + this.data.id + '/additionalInfoFs')
      .doc('fsVideos')
      .get()
      .pipe(
        map((resp) => <FsProfileVideos>resp.data()),
        map((resp) => {
          if (resp)
            return [resp.vid_1, resp.vid_2, resp.vid_3, resp.vid_4, resp.vid_5];
          return [];
        })
      );
  }
  extractVideoUrl(videoLink: string) {
    if (videoLink != null || videoLink != undefined)
      return videoLink.split('v=')[1].substring(0, 11);
  }
  onCloseDialog() {
    this.dialogRef.close();
  }
  onShare(pl: FsBasic) {
    const ShareData: ShareData = {
      share_title: pl.name,
      share_desc: LOREM_IPSUM_SHORT,
      share_url: 'https://freekyk8--h-qcd2k7n4.web.app/' + 'p/' + pl.id,
      share_imgpath: pl.imgpath_lg,
    };
    this.shareServ.onShare(ShareData);
  }
}
