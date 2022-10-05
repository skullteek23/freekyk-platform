import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { map, share } from 'rxjs/operators';
import { dummyFixture, MatchFixture } from 'src/app/shared/interfaces/match.model';
import { SeasonDraft } from 'src/app/shared/interfaces/season.model';
import { SeasonAdminService } from '../season-admin.service';
import { ArraySorting } from 'src/app/shared/utils/array-sorting';
import { DELETE_SEASON_SUBHEADING, MatchConstants, REVOKE_MATCH_UPDATE_SUBHEADING } from '../../shared/constants/constants';
import { MatDialog } from '@angular/material/dialog';
import { RequestDialogComponent } from '../request-dialog/request-dialog.component';
import { forkJoin, Observable } from 'rxjs';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { GroundPrivateInfo } from 'src/app/shared/interfaces/ground.model';
import { ConfirmationBoxComponent } from '../../shared/components/confirmation-box/confirmation-box.component';
import { UpdateMatchReportComponent } from '../update-match-report/update-match-report.component';
import { ScrollStrategyOptions } from '@angular/cdk/overlay';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BIO } from 'src/app/shared/Constants/REGEX';

@Component({
  selector: 'app-view-season-draft',
  templateUrl: './view-season-draft.component.html',
  styleUrls: ['./view-season-draft.component.css']
})
export class ViewSeasonDraftComponent implements OnInit {

  isEditMode = false;
  isLoaderShown = false;
  seasonDraftData: SeasonDraft;
  seasonFixtures: dummyFixture[] = [];
  lastRegistrationDate = new Date();
  updateEntriesForm = new FormGroup({});

  constructor(
    private route: ActivatedRoute,
    private ngFire: AngularFirestore,
    private seasonAdminService: SeasonAdminService,
    private dialog: MatDialog,
    private snackbarService: SnackbarService,
    private router: Router,
    private readonly sso: ScrollStrategyOptions
  ) { }

  ngOnInit(): void {
    const params = this.route.snapshot.params;
    this.getDraftInfo(params['draftid']);
  }

  initForm() {
    this.updateEntriesForm = new FormGroup({
      description: new FormControl(this.seasonDraftData?.basicInfo?.description, [Validators.required, Validators.pattern(BIO), Validators.maxLength(200)]),
      rules: new FormControl(this.seasonDraftData?.basicInfo?.rules, [Validators.required, Validators.pattern(BIO), Validators.maxLength(500)]),
    })
  }

  getDraftInfo(draftID): void {
    if (draftID) {
      this.isLoaderShown = true;
      forkJoin([this.ngFire.collection('seasonDrafts').doc(draftID).get(), this.getDraftFixtures(draftID)])
        .subscribe((response) => {
          this.seasonDraftData = response[0].data() as SeasonDraft;
          this.setDraftFixtures(response[1], this.seasonDraftData?.grounds);
          this.initForm();
          this.isLoaderShown = false;
          this.lastRegistrationDate = this.maxRegisDate;
        }, (error) => {
          this.isLoaderShown = false;
          this.seasonFixtures = [];
          this.seasonDraftData = null;
        });
    }
  }

  getStatusClass() {
    return this.seasonAdminService.getStatusClass(this.seasonDraftData?.status);
  }

  edit() {
    if (this.isSeasonFinished) {
      return;
    };
    this.isEditMode = true;
  }

  updateSeason() {
    if (this.isSeasonFinished) {
      return;
    }
    const updatedFields: any = {
      ...this.seasonDraftData.basicInfo
    };
    let isUpdate = false;
    for (const control in this.updateEntriesForm.controls) {
      if (this.updateEntriesForm.get(control).valid && this.updateEntriesForm.get(control).dirty && this.updateEntriesForm.get(control).value && this.updateEntriesForm.get(control).value !== this.seasonDraftData?.basicInfo[control]) {
        updatedFields[control] = this.updateEntriesForm.get(control).value;
        isUpdate = true;
      }
    }
    if (isUpdate) {
      this.isLoaderShown = true;
      let allPromises = [];
      allPromises.push(this.ngFire.collection('seasonDrafts').doc(this.seasonDraftData.draftID).update({
        lastUpdated: new Date().getTime(),
        basicInfo: updatedFields
      }))
      allPromises.push(this.ngFire.collection(`seasons/${this.seasonDraftData.draftID}/additionalInfo`).doc('moreInfo').update({
        ...updatedFields
      }))
      return Promise.all(allPromises)
        .then(() => {
          this.isLoaderShown = false;
          this.snackbarService.displayCustomMsg('Info updated successfully!');
          location.reload();
        })
        .catch(() => {
          this.isLoaderShown = false;
          this.snackbarService.displayError();
        });
    }
    this.isEditMode = false;
    this.updateEntriesForm.reset();
  }

  cancel() {
    this.isEditMode = false;
    this.updateEntriesForm.reset();
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
            this.isLoaderShown = true;
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

  async publishSeason() {
    if (this.seasonDraftData?.draftID && !this.isSeasonFinished && !this.isSeasonPublished) {
      this.isLoaderShown = true;
      const fixtures = this.seasonAdminService.getPublishableFixture(this.seasonFixtures);
      if ((await this.seasonAdminService.isAnyGroundBooked(this.seasonDraftData.grounds, fixtures[0].date, fixtures[fixtures.length - 1].date)) === false) {
        this.seasonAdminService.publishSeason(this.seasonDraftData, fixtures, this.lastRegistrationDate.getTime()).then(
          () => {
            this.seasonAdminService.deleteDraft(this.seasonDraftData.draftID, true);
            this.isLoaderShown = false;
            this.goToURL();
            location.reload();
          }, () => {
            this.isLoaderShown = false;
            this.snackbarService.displayError();
          }
        )
      } else {
        this.isLoaderShown = false;
        this.snackbarService.displayCustomMsg('Sorry! One or more grounds you selected is already booked!');
      }
    }
  }

  setDraftFixtures(fixtures: dummyFixture[], groundsList: GroundPrivateInfo[]): void {
    if (fixtures && groundsList && groundsList.length && fixtures.length) {
      const groundsListNames = groundsList.map(ground => ground.name);
      this.seasonFixtures = fixtures.filter(fixture => groundsListNames.indexOf(fixture.stadium) > -1);
    } else if (this.isSeasonFinished || this.isSeasonPublished) {
      this.isLoaderShown = true;
      this.ngFire.collection('allMatches', query => query.where('season', '==', this.seasonDraftData?.basicInfo?.name)).snapshotChanges().subscribe(
        (response) => {
          if (response.length) {
            this.seasonFixtures = response.map(fixture => {
              const fixtureData = fixture.payload.doc.data() as MatchFixture;
              const id = fixture.payload.doc.id;
              return ({
                home: fixtureData.home.name,
                away: fixtureData.away.name,
                date: fixtureData.date,
                concluded: fixtureData.concluded,
                premium: fixtureData.premium,
                season: fixtureData.season,
                type: fixtureData.type,
                locCity: fixtureData.locCity,
                locState: fixtureData.locState,
                stadium: fixtureData.stadium,
                id,
              } as dummyFixture);
            })
            this.isLoaderShown = false;
          }
        });
    } else {
      this.seasonFixtures = [];
    }
  }

  onUpdateMatchData(matchID: any) {
    if (matchID) {
      this.isLoaderShown = true;
      this.isInvalidUpdate(matchID).subscribe(response => {
        if (response === false) {
          this.dialog.open(UpdateMatchReportComponent, {
            panelClass: 'extra-large-dialogs',
            data: matchID,
            disableClose: true,
            scrollStrategy: this.sso.noop()
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

  get maxRegisDate(): Date {
    return this.seasonDraftData && this.seasonDraftData.basicInfo ? new Date(this.seasonDraftData?.basicInfo?.startDate) : new Date();
  }

  get payableFees(): any {
    const fees = (this.seasonDraftData?.basicInfo?.fees - ((this.seasonDraftData?.basicInfo?.discount / 100) * this.seasonDraftData?.basicInfo?.fees));
    if (fees > 0) {
      return fees;
    }
  }
}
