import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { map, share } from 'rxjs/operators';
import { IDummyFixture, MatchFixture } from '@shared/interfaces/match.model';
import { SeasonAbout, SeasonDraft, SeasonParticipants } from '@shared/interfaces/season.model';
import { SeasonAdminService } from '../season-admin.service';
import { ArraySorting } from '@shared/utils/array-sorting';
import {
  DELETE_SEASON_SUBHEADING, DUMMY_FIXTURE_TABLE_COLUMNS, LOADING_STATUS, MatchConstants, REVOKE_MATCH_UPDATE_SUBHEADING
} from '@shared/constants/constants';
import { MatDialog } from '@angular/material/dialog';
import { RequestDialogComponent } from '../request-dialog/request-dialog.component';
import { forkJoin, Observable } from 'rxjs';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { GroundPrivateInfo } from '@shared/interfaces/ground.model';
import { ConfirmationBoxComponent } from '@shared/components/confirmation-box/confirmation-box.component';
import { UpdateMatchReportComponent } from '../update-match-report/update-match-report.component';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { formsMessages } from '@shared/constants/messages';
import { RegexPatterns } from '@shared/Constants/REGEX';

@Component({
  selector: 'app-view-season-draft',
  templateUrl: './view-season-draft.component.html',
  styleUrls: ['./view-season-draft.component.scss']
})
export class ViewSeasonDraftComponent implements OnInit {

  readonly default = LOADING_STATUS.DEFAULT;
  readonly loading = LOADING_STATUS.LOADING;
  readonly done = LOADING_STATUS.DONE;
  readonly descriptionLimit = MatchConstants.LARGE_TEXT_CHARACTER_LIMIT;
  readonly rulesLimit = MatchConstants.LARGE_TEXT_CHARACTER_LIMIT;

  draftID: string = null;
  currentDate = new Date();
  cols = [
    DUMMY_FIXTURE_TABLE_COLUMNS.MATCH_ID,
    DUMMY_FIXTURE_TABLE_COLUMNS.HOME,
    DUMMY_FIXTURE_TABLE_COLUMNS.AWAY,
    DUMMY_FIXTURE_TABLE_COLUMNS.DATE,
    DUMMY_FIXTURE_TABLE_COLUMNS.LOCATION,
    DUMMY_FIXTURE_TABLE_COLUMNS.GROUND,
    DUMMY_FIXTURE_TABLE_COLUMNS.ACTIONS,
  ];
  isEditMode = false;
  loadingStatus = 0;
  lastRegistrationDate = new Date();
  messages = formsMessages;
  seasonDraftData: SeasonDraft;
  seasonFixtures: IDummyFixture[] = [];
  seasonParticipants: SeasonParticipants[] = [];
  updateEntriesForm = new FormGroup({});

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
    this.draftID = params.draftid;
    if (this.draftID) {
      this.getDraftInfo();
      this.getParticipants();
    }
  }

  initForm() {
    this.updateEntriesForm = new FormGroup({
      description: new FormControl(this.seasonDraftData?.basicInfo?.description,
        [Validators.required, Validators.pattern(RegexPatterns.bio), Validators.maxLength(this.descriptionLimit)]
      ),
      rules: new FormControl(this.seasonDraftData?.basicInfo?.rules,
        [Validators.required, Validators.pattern(RegexPatterns.bio), Validators.maxLength(this.rulesLimit)]
      ),
    });
  }

  getDraftInfo(): void {
    this.setLoadingStatus(LOADING_STATUS.LOADING);
    forkJoin([this.ngFire.collection('seasonDrafts').doc(this.draftID).get(), this.getDraftFixtures(this.draftID)])
      .subscribe({
        next: (response) => {
          if (response && response[0].exists && response[1]) {
            this.seasonDraftData = response[0].data() as SeasonDraft;
            this.setDraftFixtures(response[1], this.seasonDraftData?.grounds);
            this.initForm();
            this.setLoadingStatus(LOADING_STATUS.DEFAULT);
            this.lastRegistrationDate = this.maxRegisDate;
          }
        },
        error: () => {
          this.setLoadingStatus(LOADING_STATUS.DEFAULT);
          this.seasonFixtures = [];
          this.seasonDraftData = null;
        }
      });
  }

  getParticipants() {
    this.ngFire.collection('seasons').doc(this.draftID).collection('participants').get().subscribe({
      next: (response) => {
        if (response) {
          this.seasonParticipants = response.docs.map(el => el.data() as SeasonParticipants);
        }
      },
      error: (error) => {
        this.snackbarService.displayError('Unable to get participants!');
      },
    });
  }

  getStatusClass() {
    return this.seasonAdminService.getStatusClass(this.seasonDraftData?.status);
  }

  edit() {
    if (this.isSeasonFinished) {
      return;
    };
    this.isEditMode = true;
    this.updateEntriesForm.setValue({
      description: this.seasonDraftData?.basicInfo?.description,
      rules: this.seasonDraftData?.basicInfo?.rules
    });
  }

  updateSeason() {
    if (this.isSeasonFinished || this.updateEntriesForm.invalid) {
      return;
    }
    const updatedTextFields: Partial<SeasonAbout> = {};
    if (this.description.valid && this.description.dirty && this.description.value
      && (this.description.value !== this.seasonDraftData?.basicInfo?.description)) {
      updatedTextFields.description = this.description.value.trim();
    }
    if (this.rules.valid && this.rules.dirty && this.rules.value && (this.rules.value !== this.seasonDraftData?.basicInfo?.rules)) {
      updatedTextFields.rules = this.rules.value.trim();
    }
    if (Object.keys(updatedTextFields).length) {
      this.setLoadingStatus(LOADING_STATUS.LOADING);
      const allPromises = [];
      allPromises.push(this.ngFire.collection('seasonDrafts').doc(this.seasonDraftData.draftID).update({
        lastUpdated: new Date().getTime(),
        basicInfo: {
          ...this.seasonDraftData?.basicInfo,
          ...updatedTextFields
        }
      }));
      if (this.isSeasonPublished) {
        allPromises.push(this.ngFire.collection(`seasons/${this.seasonDraftData.draftID}/additionalInfo`).doc('moreInfo').update({
          ...updatedTextFields
        }));
      }
      Promise.all(allPromises)
        .then(() => {
          this.setLoadingStatus(LOADING_STATUS.DEFAULT);
          this.snackbarService.displayCustomMsg('Info updated successfully!');
          this.getDraftInfo();
          this.isEditMode = false;
        })
        .catch(() => {
          this.setLoadingStatus(LOADING_STATUS.DEFAULT);
          this.snackbarService.displayError('Update failed.');
          this.isEditMode = false;
        });
    } else {
      this.isEditMode = false;
    }
  }

  cancel() {
    this.isEditMode = false;
    this.updateEntriesForm.reset();
  }

  onRaiseRequest(isDeleteRequest = false) {
    this.setLoadingStatus(LOADING_STATUS.LOADING);
    this.isRequestExists$.subscribe(response => {
      if (!response && this.isSeasonPublished) {
        this.setLoadingStatus(LOADING_STATUS.DEFAULT);
        this.dialog.open(RequestDialogComponent, {
          panelClass: 'fk-dialogs',
          data: {
            season: this.seasonDraftData?.draftID,
            heading: isDeleteRequest ? DELETE_SEASON_SUBHEADING : REVOKE_MATCH_UPDATE_SUBHEADING,
            isShowMatch: !isDeleteRequest
          }
        }).afterClosed().subscribe(userResponse => {
          if (userResponse && Object.keys(userResponse).length === 4) {
            this.setLoadingStatus(LOADING_STATUS.LOADING);
            this.ngFire.collection('adminRequests').doc(userResponse.id).set(userResponse)
              .then(
                () => {
                  this.setLoadingStatus(LOADING_STATUS.DEFAULT);
                  const message = (isDeleteRequest ? 'Delete' : 'Revoke') + ' Request Submitted!';
                  this.snackbarService.displayCustomMsg(message);
                }, err => {
                  this.setLoadingStatus(LOADING_STATUS.DEFAULT);
                  this.snackbarService.displayError('Request raise failed!');
                }
              );
          }
        });
      } else {
        this.setLoadingStatus(LOADING_STATUS.DEFAULT);
        this.snackbarService.displayCustomMsg('Request already submitted!');
      }
    });
  }

  onConfirmDelete() {
    this.onConfirm()
      .subscribe(response => {
        if (response) {
          this.router.navigate(['/seasons/list']);
          this.seasonAdminService.deleteDraft(this.seasonDraftData.draftID)
            .then(() => this.snackbarService.displayCustomMsg('Draft deleted successfully!'))
            .catch(err => this.snackbarService.displayCustomMsg(err));
        }
      });
  }

  onConfirmPublish() {
    this.onConfirm()
      .subscribe(response => {
        if (response && this.seasonDraftData?.draftID && !this.isSeasonFinished && !this.isSeasonPublished) {
          this.setLoadingStatus(LOADING_STATUS.LOADING);
          const data = {
            seasonDraft: this.seasonDraftData,
            fixturesDraft: this.seasonFixtures,
            lastRegTimestamp: this.lastRegistrationDate.getTime()
          };
          this.seasonAdminService.publishSeason(data)
            .then(() => {
              this.setLoadingStatus(LOADING_STATUS.DONE);
              setTimeout(() => {
                this.getDraftInfo();
              }, 5000);
            })
            .catch(error => {
              this.snackbarService.displayError(error?.message);
              this.setLoadingStatus(LOADING_STATUS.DEFAULT);
            });
        }
      });
  }

  onConfirm(): Observable<any> {
    return this.dialog.open(ConfirmationBoxComponent).afterClosed();
  }

  setDraftFixtures(fixtures: IDummyFixture[], groundsList: GroundPrivateInfo[]): void {
    // if (fixtures && groundsList && groundsList.length && fixtures.length) {
    //   const groundsListNames = groundsList.map(ground => ground.name);
    //   this.seasonFixtures = fixtures.filter(fixture => groundsListNames.indexOf(fixture.stadium) > -1);
    // } else if (this.isSeasonFinished || this.isSeasonPublished) {
    //   this.setLoadingStatus(LOADING_STATUS.LOADING);
    //   this.ngFire.collection('allMatches', query => query.where('season', '==', this.seasonDraftData?.basicInfo?.name))
    //     .snapshotChanges()
    //     .subscribe({
    //       next: (response) => {
    //         if (response.length) {
    //           this.seasonFixtures = response.map(fixture => {
    //             const fixtureData = fixture.payload.doc.data() as MatchFixture;
    //             const id = fixture.payload.doc.id;
    //             return ({
    //               home: fixtureData.home.name,
    //               away: fixtureData.away.name,
    //               date: fixtureData.date,
    //               concluded: fixtureData.concluded,
    //               premium: fixtureData.premium,
    //               season: fixtureData.season,
    //               type: fixtureData.type,
    //               locCity: fixtureData.locCity,
    //               locState: fixtureData.locState,
    //               stadium: fixtureData.stadium,
    //               id,
    //             } as IDummyFixture);
    //           });
    //           this.setLoadingStatus(LOADING_STATUS.DEFAULT);
    //         }
    //       },
    //       error: () => {
    //         this.seasonFixtures = [];
    //         this.snackbarService.displayError();
    //       }
    //     });
    // } else {
    //   this.seasonFixtures = [];
    // }
  }

  onUpdateMatchData(matchID: any) {
    if (matchID) {
      this.setLoadingStatus(LOADING_STATUS.LOADING);
      this.isInvalidUpdate(matchID).subscribe(response => {
        if (response === false) {
          this.dialog.open(UpdateMatchReportComponent, {
            panelClass: 'extra-large-dialogs',
            data: matchID,
            disableClose: true
          });
        }
        this.setLoadingStatus(LOADING_STATUS.DEFAULT);
      });
    }
  }

  isInvalidUpdate(matchID: string): Observable<boolean> {
    if (matchID) {
      return this.ngFire.collection('allMatches')
        .doc(matchID)
        .get()
        .pipe(map(resp => resp.exists ? (resp.data() as MatchFixture).concluded === true : true));
    }
  }

  getDraftFixtures(draftID): Observable<IDummyFixture[]> {
    return this.ngFire.collection('seasonFixturesDrafts', query => query.where('draftID', '==', draftID)).get()
      .pipe(
        map(response => response.docs.map(doc => doc.data() as IDummyFixture)),
        map(response => response.sort(ArraySorting.sortObjectByKey('date'))),
        map(response => response as IDummyFixture[])
      );
  }

  setLoadingStatus(value: LOADING_STATUS) {
    this.loadingStatus = value;
  }

  goToURL() {
    if (this.seasonDraftData?.basicInfo?.name) {
      window.open(`${MatchConstants.SEASON_URL}${this.seasonDraftData.basicInfo.name}`, '_blank');
    }
  }

  get containingTournaments(): string {
    return this.seasonDraftData?.basicInfo?.containingTournaments.join(', ');
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
      return this.ngFire.collection('adminRequests', query => query.where('seasonId', '==', this.seasonDraftData.draftID))
        .get()
        .pipe(map(resp => !resp.empty), share());
    }
  }

  get maxRegisDate(): Date {
    const config = this.seasonAdminService.getAdminConfig();
    return new Date(this.seasonAdminService.getMappedDateRange(this.seasonDraftData?.basicInfo?.startDate));
  }

  get payableFees(): number {
    const feesTemp = this.seasonDraftData?.basicInfo?.fees;
    const fees = (feesTemp - ((this.seasonDraftData?.basicInfo?.discount / 100) * feesTemp));
    return fees || 0;
  }

  get description(): AbstractControl {
    return this.updateEntriesForm.get('description');
  }

  get rules(): AbstractControl {
    return this.updateEntriesForm.get('rules');
  }
}
