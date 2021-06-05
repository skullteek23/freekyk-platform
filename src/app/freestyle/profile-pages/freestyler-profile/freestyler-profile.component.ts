import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap, map, share } from 'rxjs/operators';
import { StatsFs } from 'src/app/shared/interfaces/others.model';
import {
  PlayerMoreInfo,
  FsStats,
  FsProfileVideos,
  FsBasic,
  PlayerBasicInfo,
} from 'src/app/shared/interfaces/user.model';

@Component({
  selector: 'app-freestyler-profile',
  templateUrl: './freestyler-profile.component.html',
  styleUrls: ['./freestyler-profile.component.css'],
})
export class FreestylerProfileComponent implements OnInit {
  defaultvalue = 0;
  fsId: string;
  fsInfoBasic$: Observable<FsBasic>;
  addiInfo$: Observable<PlayerMoreInfo>;
  fsStats$: Observable<StatsFs>;
  fsVideos$: Observable<string[]>;
  topVids: string[] = [];
  isLoading: boolean = true;
  constructor(
    private route: ActivatedRoute,
    private ngFire: AngularFirestore,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.fsId = this.route.snapshot.params['freestylerid'];
    this.getBasicInfo();
  }
  getBasicInfo() {
    this.fsInfoBasic$ = this.ngFire
      .collection('freestylers')
      .doc(this.fsId)
      .get()
      .pipe(
        tap((resp) => {
          if (resp.exists) {
            this.getAdditionalInfo();
          } else this.router.navigate(['/error']);
        }),
        map((resp) => <FsBasic>resp.data()),
        share()
      );
  }
  getAdditionalInfo() {
    this.addiInfo$ = this.ngFire
      .collection(`players/${this.fsId}/additionalInfo`)
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
  onLoadStats() {
    this.fsStats$ = this.ngFire
      .collection(`freestylers/${this.fsId}/additionalInfoFs`)
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
      .collection(`freestylers/${this.fsId}/additionalInfoFs`)
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
}
