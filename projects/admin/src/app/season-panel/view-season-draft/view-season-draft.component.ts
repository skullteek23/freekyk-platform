import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { map, share } from 'rxjs/operators';
import { dummyFixture, MatchFixture } from 'src/app/shared/interfaces/match.model';
import { SeasonAbout, SeasonBasicInfo, SeasonDraft, statusType } from 'src/app/shared/interfaces/season.model';
import { SeasonAdminService } from '../season-admin.service';
import { ArraySorting } from 'src/app/shared/utils/array-sorting';
import { DELETE_SEASON_SUBHEADING, MatchConstants, REVOKE_MATCH_UPDATE_SUBHEADING } from '../../shared/constants/constants';
import { MatDialog } from '@angular/material/dialog';
import { RequestDialogComponent } from '../request-dialog/request-dialog.component';
import { forkJoin, Observable } from 'rxjs';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { GroundBookings, GroundPrivateInfo } from 'src/app/shared/interfaces/ground.model';
import { ConfirmationBoxComponent } from '../../shared/components/confirmation-box/confirmation-box.component';
import { UpdateMatchReportComponent } from '../update-match-report/update-match-report.component';

@Component({
  selector: 'app-view-season-draft',
  templateUrl: './view-season-draft.component.html',
  styleUrls: ['./view-season-draft.component.css']
})
export class ViewSeasonDraftComponent implements OnInit {

  isLoaderShown = false;
  seasonDraftData: SeasonDraft;
  finalFees = 0;
  seasonFixtures: dummyFixture[] = [];

  constructor(
    private route: ActivatedRoute,
    private ngFire: AngularFirestore,
    private seasonAdminService: SeasonAdminService,
    private dialog: MatDialog,
    private snackbarService: SnackbarService,
    private router: Router
  ) { }

  ngOnInit(): void {
    const params = this.route.snapshot.params;
    this.getDraftInfo(params['draftid']);
  }

  getDraftInfo(draftID): void {
    if (draftID) {
      this.isLoaderShown = true;
      forkJoin([this.ngFire.collection('seasonDrafts').doc(draftID).get(), this.getDraftFixtures(draftID)])
        .subscribe((response) => {
          this.seasonDraftData = response[0].data() as SeasonDraft;
          this.setDraftFixtures(response[1], this.seasonDraftData?.grounds);
          const fees = this.seasonDraftData?.basicInfo?.fees || 0;
          this.finalFees = (fees - ((this.seasonDraftData?.basicInfo?.discount / 100) * fees));
          this.isLoaderShown = false;
        }, (error) => {
          this.isLoaderShown = false;
          this.finalFees = 0;
          this.seasonFixtures = [];
          this.seasonDraftData = null;
        });
    }
  }

  getStatusClass() {
    return this.seasonAdminService.getStatusClass(this.seasonDraftData?.status);
  }

  editSeasonInfo() {
    // if (this.seasonDraftData?.draftID) {
    //   this.dialog.open(CreateSeasonComponent, {
    //     panelClass: 'extra-large-dialogs',
    //     disableClose: true,
    //     data: this.seasonDraftData.draftID
    //   })
    // }
  }

  onRaiseRequest() {
    this.isLoaderShown = true;
    this.isRequestExists$.subscribe(response => {
      if (!response && this.isSeasonPublished) {
        this.isLoaderShown = false;
        this.dialog.open(RequestDialogComponent, {
          panelClass: 'fk-dialogs',
          data: {
            season: this.seasonDraftData?.draftID,
            heading: REVOKE_MATCH_UPDATE_SUBHEADING
          }
        }).afterClosed().subscribe(userResponse => {
          if (userResponse && Object.keys(userResponse).length === 4) {
            this.isLoaderShown = true
            this.ngFire.collection('adminRequests').doc(userResponse['id']).set(userResponse)
              .then(
                () => {
                  this.isLoaderShown = false;
                  this.snackbarService.displayCustomMsgLong('Revoke Request Submitted!');
                }, err => {
                  this.isLoaderShown = false;
                  this.snackbarService.displayError();
                }
              )
          }
        });
      } else {
        this.isLoaderShown = false;
        this.snackbarService.displayCustomMsg('Request already submitted!');
      }
    });
  }

  onRaiseDeleteRequest() {
    this.isLoaderShown = true;
    this.isRequestExists$.subscribe(response => {
      if (!response && this.isSeasonPublished) {
        this.isLoaderShown = false;
        this.dialog.open(RequestDialogComponent, {
          panelClass: 'fk-dialogs',
          data: {
            season: this.seasonDraftData?.draftID,
            heading: DELETE_SEASON_SUBHEADING
          }
        }).afterClosed().subscribe(userResponse => {
          if (userResponse && Object.keys(userResponse).length === 4) {
            this.isLoaderShown = true
            this.ngFire.collection('adminRequests').doc(userResponse['id']).set(userResponse)
              .then(
                () => {
                  this.isLoaderShown = false;
                  this.snackbarService.displayCustomMsgLong('Delete Request Submitted!');
                }, err => {
                  this.isLoaderShown = false;
                  this.snackbarService.displayError();
                }
              )
          }
        });
      } else {
        this.isLoaderShown = false;
        this.snackbarService.displayCustomMsg('Request already submitted!');
      }
    });
  }

  onConfirmDelete(): void {
    this.dialog.open(ConfirmationBoxComponent)
      .afterClosed()
      .subscribe(response => {
        if (response) {
          this.router.navigate(['/seasons/list']);
          this.seasonAdminService.deleteDraft(this.seasonDraftData.draftID)
            .then(() => this.snackbarService.displayDelete())
            .catch(err => this.snackbarService.displayCustomMsg(err));
        }
      })
  }

  publishSeason() {
    if (this.seasonDraftData?.draftID && !this.isSeasonFinished && !this.isSeasonPublished) {
      this.isLoaderShown = true;
      const season: SeasonBasicInfo = {
        name: this.seasonDraftData.basicInfo?.name,
        imgpath: this.seasonDraftData.basicInfo?.imgpath,
        locCity: this.seasonDraftData.basicInfo?.city,
        locState: this.seasonDraftData.basicInfo?.state,
        premium: true,
        p_teams: this.seasonDraftData.basicInfo?.participatingTeamsCount,
        start_date: new Date(this.seasonDraftData.basicInfo?.startDate).getTime(),
        cont_tour: this.seasonDraftData.basicInfo?.containingTournaments,
        feesPerTeam: this.seasonDraftData.basicInfo?.fees,
        discount: this.seasonDraftData.basicInfo?.discount,
        status: 'PUBLISHED'
      }
      const seasonAbout: SeasonAbout = {
        description: this.seasonDraftData.basicInfo?.description,
        rules: this.seasonDraftData.basicInfo?.rules,
        paymentMethod: 'Online',
      }
      const fixtures = this.seasonAdminService.getPublishableFixture(this.seasonFixtures);
      if (this.seasonAdminService.isGroundBooked(this.seasonDraftData.grounds, fixtures[0], fixtures[fixtures.length - 1])) {
        this.isLoaderShown = false;
        this.snackbarService.displayCustomMsg('Sorry! One or more grounds you selected is already booked!');
        return;
      }
      const startDate = season.start_date;
      const endDate = fixtures[fixtures.length - 1].date;
      const lastUpdated = new Date().getTime();
      const status: statusType = 'PUBLISHED';

      const batch = this.ngFire.firestore.batch();

      const seasonRef = this.ngFire.collection('seasons').doc(this.seasonDraftData.draftID).ref;
      const seasonMoreRef = this.ngFire.collection(`seasons/${this.seasonDraftData.draftID}/additionalInfo`).doc('moreInfo').ref;
      const draftRef = this.ngFire.collection(`seasonDrafts`).doc(this.seasonDraftData.draftID).ref;

      batch.set(seasonRef, season);
      batch.set(seasonMoreRef, seasonAbout);

      batch.update(draftRef, { lastUpdated, status });


      (this.seasonDraftData.grounds as GroundPrivateInfo[]).map(gr => gr.id).forEach(groundID => {
        const setRef = this.ngFire.collection('groundBookings').doc(groundID).ref;
        const booking: GroundBookings = { seasonID: this.seasonDraftData.draftID, groundID, bookingFrom: startDate, bookingTo: endDate };
        batch.set(setRef, booking);
      })

      fixtures.forEach(fixture => {
        const fixtureRef = this.ngFire.collection('allMatches').doc(fixture.id).ref;
        batch.set(fixtureRef, fixture);
      })

      batch.commit().then(
        () => {
          this.seasonAdminService.deleteDraft(this.seasonDraftData.draftID, true);
          this.isLoaderShown = false;
          this.goToURL();
          location.reload();
        }, err => {
          this.isLoaderShown = false;
          this.snackbarService.displayError();
        }
      )

    }
  }

  setDraftFixtures(fixtures: dummyFixture[], groundsList: GroundPrivateInfo[]): void {
    if (fixtures && groundsList && groundsList.length && fixtures.length) {
      const groundsListNames = groundsList.map(ground => ground.name);
      this.seasonFixtures = fixtures.filter(fixture => groundsListNames.indexOf(fixture.stadium) > -1);
    } else if (this.isSeasonFinished || this.isSeasonPublished) {
      this.isLoaderShown = true;
      this.ngFire.collection('allMatches', query => query.where('season', '==', this.seasonDraftData?.basicInfo?.name)).get().subscribe(
        (response) => {
          this.seasonFixtures = response.docs.map(fixture => {
            if (fixture.exists) {
              const fixtureData = fixture.data() as MatchFixture;
              const id = fixture.id;
              return ({
                date: fixtureData.date,
                concluded: fixtureData.concluded,
                premium: fixtureData.premium,
                season: fixtureData.season,
                type: fixtureData.type,
                locCity: fixtureData.locCity,
                locState: fixtureData.locState,
                stadium: fixtureData.stadium,
                id,
              } as dummyFixture)
            }
          })
          this.isLoaderShown = false;
        }
      )
    } else {
      this.seasonFixtures = [];
    }
  }

  onUpdateMatchData(matchID: any) {
    if (matchID) {
      this.isLoaderShown = true;
      this.isInvalidUpdate(matchID).subscribe(response => {
        if (response === false) {
          this.isLoaderShown = false;
          this.dialog.open(UpdateMatchReportComponent, {
            panelClass: 'extra-large-dialogs',
            data: matchID,
            disableClose: true
          }).afterClosed().subscribe(userResponse => {
            console.log(userResponse);
          });
        }
        this.isLoaderShown = false;
      })
    }
  }

  isInvalidUpdate(matchID: string): Observable<boolean> {
    if (matchID) {
      return this.ngFire.collection('allMatches').doc(matchID).get().pipe(map(resp => resp.exists ? (resp.data() as MatchFixture).concluded === true : true));
    }
  }

  getDraftFixtures(draftID): Observable<dummyFixture[]> {
    return this.ngFire.collection('seasonFixturesDrafts', query => query.where('draftID', '==', draftID)).get()
      .pipe(
        map(response => response.docs.map(doc => doc.data() as dummyFixture)),
        map(response => response.sort(ArraySorting.sortObjectByKey('date'))),
        map(response => response as dummyFixture[])
      )
  }

  goToURL() {
    if (this.seasonDraftData?.basicInfo?.name) {
      window.open(`${MatchConstants.SEASON_URL}${this.seasonDraftData.basicInfo.name}`, "_blank");
    }
  }

  get containingTournaments(): string {
    return this.seasonDraftData?.basicInfo?.containingTournaments.join(', ')
  }

  get groundAvailable$(): Observable<boolean> {
    return this.ngFire.collection('groundBookings').snapshotChanges().pipe(map(resp => resp.length === 0));
  }

  get isSeasonPublished(): boolean {
    return this.seasonDraftData?.status === 'PUBLISHED';
  }

  get isSeasonFinished(): boolean {
    return this.seasonDraftData?.status === 'FINISHED';
  }

  get isRequestExists$(): Observable<boolean> {
    if (this.seasonDraftData?.draftID) {
      return this.ngFire.collection('adminRequests', query => query.where('seasonId', '==', this.seasonDraftData.draftID)).get().pipe(map(resp => !resp.empty), share());
    }
  }
}
