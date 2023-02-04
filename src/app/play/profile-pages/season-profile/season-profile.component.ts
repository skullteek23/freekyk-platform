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
  ISeasonPartner,
  SeasonAbout,
  SeasonBasicInfo,
  SeasonMedia,
  SeasonParticipants,
  SeasonStats,
} from '@shared/interfaces/season.model';
import { MatchFixture, ParseMatchProperties } from '@shared/interfaces/match.model';
import { ListOption, QueryInfo } from '@shared/interfaces/others.model';
import { MatDialog } from '@angular/material/dialog';
import { ViewGroundCardComponent } from '@shared/dialogs/view-ground-card/view-ground-card.component';
import { ArraySorting } from '@shared/utils/array-sorting';
import * as _ from 'lodash';
import { QueryService } from '@app/services/query.service';
import { MatchConstants } from '@shared/constants/constants';


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
  seasonFixtures: MatchFixture[] = [];
  seasonResults: MatchFixture[] = [];
  seasonGroundsList: ListOption[] = [];
  imgPath: string;
  currentDate = new Date();
  seasonInfo: SeasonBasicInfo;
  partners: ISeasonPartner[] = [];

  constructor(
    private snackBarService: SnackbarService,
    private store: Store<DashState>,
    private route: ActivatedRoute,
    private ngFire: AngularFirestore,
    private enlargeService: EnlargeService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe({
      next: (params) => {
        if (params && params.hasOwnProperty('seasonid')) {
          this.seasonName = params['seasonid'];
          this.getSeasonInfo();
        }
      }
    });
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
            this.getMatches(this.seasonName);
            this.getPartners(this.sid);
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

  getMatches(season: string) {
    if (season) {
      this.ngFire.collection('allMatches', query => query.where('season', '==', season))
        .get()
        .pipe(
          map(resp => resp.docs.map(doc => ({ id: doc.id, ...doc.data() as MatchFixture }))),
        )
        .subscribe({
          next: (response: MatchFixture[]) => {
            const currentTimestamp = new Date().getTime();
            this.seasonFixtures = [];
            this.seasonResults = [];
            response.forEach(match => {
              match.status = ParseMatchProperties.getTimeDrivenStatus(match.status, match.date);
              if (((match.date + (MatchConstants.ONE_MATCH_DURATION * MatchConstants.ONE_HOUR_IN_MILLIS)) > currentTimestamp)) {
                this.seasonFixtures.push(match);
              } else {
                this.seasonResults.push(match);
              }
            })
            this.seasonGroundsList = _.uniqBy(response, 'stadium').map(el => ({ viewValue: el.ground, value: el.groundID }));
          },
          error: () => {
            this.seasonFixtures = [];
            this.seasonResults = [];
            this.seasonGroundsList = [];
          }
        })
    }
  }

  getPartners(seasonID: string) {
    this.ngFire.collection('partners', query => query.where('seasonID', '==', seasonID)).get()
      .subscribe({
        next: (response) => {
          if (response) {
            this.partners = !response.empty ? response.docs.map(el => el.data() as ISeasonPartner) : [];
          }
        },
        error: () => {
          this.snackBarService.displayError('Error getting Season Partners');
          this.partners = [];
        }
      })
  }

  OnOpenGround(data: ListOption) {
    this.dialog.open(ViewGroundCardComponent, {
      panelClass: 'fk-dialogs',
      data
    });
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
            return media.photos;
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
    this.enlargeService.onOpenPhoto(this.imgPath);
  }
}
