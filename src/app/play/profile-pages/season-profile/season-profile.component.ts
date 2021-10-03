import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, share, startWith, tap } from 'rxjs/operators';
import { EnlargeService } from 'src/app/services/enlarge.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import {
  SeasonAbout,
  SeasonBasicInfo,
  SeasonMedia,
  SeasonParticipants,
  SeasonStats,
} from 'src/app/shared/interfaces/season.model';
import { TeamBasicInfo } from 'src/app/shared/interfaces/team.model';
import { MembershipInfo } from 'src/app/shared/interfaces/user.model';
import { AppState } from 'src/app/store/app.reducer';

@Component({
  selector: 'app-season-profile',
  templateUrl: './season-profile.component.html',
  styleUrls: ['./season-profile.component.css'],
})
export class SeasonProfileComponent implements OnInit {
  isLoading = true;
  isPremium = false;
  noPhotos = false;
  error = false;
  sid: string;
  seasonInfo$: Observable<SeasonBasicInfo>;
  seasonMoreInfo$: Observable<SeasonAbout>;
  photos$: Observable<string[]>;
  stats$: Observable<SeasonStats>;
  isLocked$: Observable<boolean>;
  seasonName: string;
  imgPath: string;
  constructor(
    private snackServ: SnackbarService,
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private ngFire: AngularFirestore,
    private enlServ: EnlargeService,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.seasonName = this.route.snapshot.params.seasonid;
    this.getSeasonInfo();
  }
  getSeasonInfo(): void {
    this.seasonInfo$ = this.ngFire
      .collection('seasons', (query) =>
        query.where('name', '==', this.seasonName).limit(1)
      )
      .get()
      .pipe(
        tap((resp) => {
          if (!resp.empty) {
            this.sid = resp.docs[0].id;
            this.getSeasonMoreInfo(this.sid);
            this.getPhotos(this.sid);
            this.getStats(this.sid);
          } else {
            this.error = resp.empty;
            this.router.navigate(['error']);
          }
        }),
        map((resp) =>
          resp.docs.map(
            (doc) =>
              ({
                id: doc.id,
                ...(doc.data() as SeasonBasicInfo),
              } as SeasonBasicInfo)
          )
        ),
        map((resp) => resp[0]),
        tap((resp) => (this.imgPath = resp?.imgpath)),
        share()
      );
  }
  getSeasonMoreInfo(sid: string): void {
    this.seasonMoreInfo$ = this.ngFire
      .collection('seasons/' + sid + '/additionalInfo')
      .doc('moreInfo')
      .get()
      .pipe(
        tap((resp) => (this.isLoading = false)),
        map(
          (resp) =>
            ({ id: resp.id, ...(resp.data() as SeasonAbout) } as SeasonAbout)
        ),
        share()
      );
  }
  getPhotos(sid: string): void {
    this.photos$ = this.ngFire
      .collection('seasons/' + sid + '/additionalInfo')
      .doc('media')
      .get()
      .pipe(
        map((resp) => {
          if (resp.exists) {
            return resp.data() as SeasonMedia;
          }
        }),
        map((media: SeasonMedia) => {
          if (media) {
            return [
              media.photo_1,
              media.photo_2,
              media.photo_3,
              media.photo_4,
              media.photo_5,
            ];
          }
          return [];
        })
      );
  }
  getStats(sid: string): void {
    this.stats$ = this.ngFire
      .collection('seasons/' + sid + '/additionalInfo')
      .doc('statistics')
      .get()
      .pipe(
        map((resp) => {
          if (resp.exists) {
            return resp.data() as SeasonStats;
          }
        })
      );
  }
  onParticipate(): void {
    const uid = localStorage.getItem('uid');
    this.store
      .select('dash')
      .pipe(map((resp) => resp.hasTeam))
      .subscribe(async (team) => {
        if (!uid) {
          this.snackServ.displayCustomMsg('Please login to continue!');
          this.router.navigate(['/login']);
        } else if (team === null) {
          this.snackServ.displayCustomMsg(
            'Join/create a team to perform this action!'
          );
        } else if (team.capId !== uid) {
          this.snackServ.displayCustomMsg('Please contact your team captain!');
        } else {
          const teamSnap = await this.ngFire
            .collection('teams')
            .doc(team.id)
            .get()
            .pipe(map((resp) => (resp.data() as TeamBasicInfo).imgpath))
            .toPromise();
          this.ngFire
            .collection('seasons/' + this.sid + '/participants')
            .doc(team.id)
            .set({
              tid: team.id,
              tname: team.name,
              timgpath: teamSnap,
            } as SeasonParticipants)
            .then(() =>
              this.snackServ.displayCustomMsg('Participation successful!')
            );
        }
      });
  }
  onEnlargePhoto(): void {
    this.enlServ.onOpenPhoto(this.imgPath);
  }
}
