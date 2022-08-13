import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Observable } from 'rxjs';
import { tap, map, share } from 'rxjs/operators';
import { Stats } from '../../interfaces/others.model';
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
  isLoading = true;
  userTours: string[] = [];
  userTeams: string[] = [];
  constructor(
    public dialogRef: MatDialogRef<PlayerCardComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: PlayerBasicInfo,
    private ngFire: AngularFirestore
  ) {}
  ngOnInit(): void {
    this.getAdditionalInfo();
  }
  getAdditionalInfo(): void {
    this.addiInfo$ = this.ngFire
      .collection(`players/${this.data.id}/additionalInfo`)
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
      .collection(`players/${this.data.id}/additionalInfo`)
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
              Cards: resp ? resp.cards : 0,
            } as Stats)
        )
      );
  }
  onCloseDialog(): void {
    this.dialogRef.close();
  }
  onShare(pl: PlayerBasicInfo): void {}
}
