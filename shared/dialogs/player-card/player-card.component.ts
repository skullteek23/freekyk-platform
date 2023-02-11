import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OnboardingStepsTrackerService } from '@app/services/onboarding-steps-tracker.service';
import { SocialShareService } from '@app/services/social-share.service';
import { ShareData } from '@shared/components/sharesheet/sharesheet.component';
import { Stats } from '@shared/interfaces/others.model';

import { Observable } from 'rxjs';
import { tap, map, share } from 'rxjs/operators';
import {
  PlayerMoreInfo,
  PlayerBasicInfo,
  BasicStats,
} from '../../interfaces/user.model';

@Component({
  selector: 'app-player-card',
  templateUrl: './player-card.component.html',
  styleUrls: ['./player-card.component.scss'],
})
export class PlayerCardComponent implements OnInit {

  stats: {} = {};
  defaultvalue = 0;
  data: PlayerBasicInfo;
  basicInfo$: Observable<PlayerBasicInfo>;
  addiInfo$: Observable<PlayerMoreInfo>;
  plStats$: Observable<Stats>;
  isLoading = true;
  userTours: string[] = [];
  userTeams: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<PlayerCardComponent>,
    private ngFire: AngularFirestore,
    private socialShareService: SocialShareService,
    @Inject(MAT_DIALOG_DATA) public pid: string,
  ) { }

  ngOnInit(): void {
    if (this.pid) {
      this.getPlayerInfo();
    }
  }

  getPlayerInfo() {
    this.ngFire
      .collection('players')
      .doc(this.pid)
      .get()
      .pipe(
        map((resp) => resp.data() as PlayerBasicInfo),
        share()
      )
      .subscribe(response => {
        this.data = response;
        this.getAdditionalInfo();
      });
  }

  getAdditionalInfo(): void {
    this.addiInfo$ = this.ngFire
      .collection(`players/${this.pid}/additionalInfo`)
      .doc('otherInfo')
      .get()
      .pipe(
        tap((val) => {
          this.isLoading = false;
        }),
        map((resp) => resp.data() as PlayerMoreInfo),
        tap((resp) => {
          if (!!resp) {
            this.userTeams = !!resp.prof_teams ? resp.prof_teams : [];
            this.userTours = !!resp.prof_tours ? resp.prof_tours : [];
          }
        }),
        share()
      );
  }

  onLoadStats(): void {
    this.plStats$ = this.ngFire
      .collection(`players/${this.pid}/additionalInfo`)
      .doc('statistics')
      .get()
      .pipe(
        map((resp) => resp.data() as BasicStats),
        map(
          (resp) =>
          ({
            Appearances: resp ? resp.apps : 0,
            Wins: resp ? resp.w : 0,
            Goals: resp ? resp.g : 0,
            'Red Cards': resp ? resp.rcards : 0,
            'Yellow Cards': resp ? resp.ycards : 0,
          } as Stats)
        )
      );
  }

  onCloseDialog(): void {
    this.dialogRef.close();
  }

  onShare(element: PlayerBasicInfo): void {
    const data = new ShareData();
    data.share_url = `/play/players/${this.pid}`;
    data.share_title = element.name;
    this.socialShareService.onShare(data);
  }
}
