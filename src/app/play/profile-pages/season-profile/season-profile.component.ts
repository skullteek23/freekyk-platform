import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map, share, take, tap } from 'rxjs/operators';
import { DashState } from 'src/app/dashboard/store/dash.reducer';
import { EnlargeService } from 'src/app/services/enlarge.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import {
  SeasonAbout,
  SeasonBasicInfo,
  SeasonMedia,
  SeasonParticipants,
  SeasonStats,
} from '@shared/interfaces/season.model';


@Component({
  selector: 'app-season-profile',
  templateUrl: './season-profile.component.html',
  styleUrls: ['./season-profile.component.scss'],
})
export class SeasonProfileComponent implements OnInit {
  isLoading = true;
  isPremium = false;
  noPhotos = false;
  error = false;
  sid: string;
  seasonInfo$: Observable<SeasonBasicInfo>;
  seasonMoreInfo$: Observable<SeasonAbout>;
  participants$: Observable<SeasonParticipants[]>;
  photos$: Observable<string[]>;
  stats$: Observable<SeasonStats>;
  isLocked$: Observable<boolean>;
  seasonName: string;
  imgPath: string;
  currentDate = new Date();
  seasonInfo: SeasonBasicInfo;
  constructor(
    private snackBarService: SnackbarService,
    private store: Store<DashState>,
    private route: ActivatedRoute,
    private ngFire: AngularFirestore,
    private enlServ: EnlargeService,
    private router: Router
  ) { }
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
            this.seasonInfo = resp.docs[0].data() as SeasonBasicInfo;
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
              start_date: new Date((doc.data() as SeasonBasicInfo).start_date).getTime(),
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
    this.router.navigate(['/dashboard/participate']);
    this.store
      .select('hasTeam')
      .pipe(take(1))
      .subscribe((team) => {
        if (!uid) {
          this.snackBarService.displayCustomMsg('Please login to continue!');
          this.router.navigate(['/login']);
        } else if (team === null) {
          this.router.navigate(['/dashboard/participate']);
        }
      });
  }
  onEnlargePhoto(): void {
    this.enlServ.onOpenPhoto(this.imgPath);
  }
}
