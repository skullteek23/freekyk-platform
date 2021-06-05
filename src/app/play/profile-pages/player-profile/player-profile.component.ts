import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, share, tap } from 'rxjs/operators';
import { Stats } from 'src/app/shared/interfaces/others.model';
import {
  BasicStats,
  PlayerBasicInfo,
  PlayerMoreInfo,
} from 'src/app/shared/interfaces/user.model';

@Component({
  selector: 'app-player-profile',
  templateUrl: './player-profile.component.html',
  styleUrls: ['./player-profile.component.css'],
})
export class PlayerProfileComponent implements OnInit {
  stats: {} = {};
  playerId: string;
  defaultvalue = 0;
  plInfo$: Observable<PlayerBasicInfo>;
  addiInfo$: Observable<PlayerMoreInfo>;
  plStats$: Observable<Stats>;
  isLoading: boolean = true;
  user_tours: string[] = [];
  user_teams: string[] = [];
  constructor(
    private route: ActivatedRoute,
    private ngFire: AngularFirestore,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.playerId = this.route.snapshot.params['playerid'];
    this.getBasicInfo();
  }
  getBasicInfo() {
    this.plInfo$ = this.ngFire
      .collection('players')
      .doc(this.playerId)
      .get()
      .pipe(
        tap((resp) => {
          if (resp.exists) {
            this.getAdditionalInfo();
          } else this.router.navigate(['/error']);
        }),
        map((resp) => <PlayerBasicInfo>resp.data()),
        share()
      );
  }
  getAdditionalInfo() {
    this.addiInfo$ = this.ngFire
      .collection(`players/${this.playerId}/additionalInfo`)
      .doc('otherInfo')
      .get()
      .pipe(
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
      .collection(`players/${this.playerId}/additionalInfo`)
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
}
