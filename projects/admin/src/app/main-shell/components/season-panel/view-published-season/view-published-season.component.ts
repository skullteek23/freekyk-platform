import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackbarService } from '@app/services/snackbar.service';
import { LOADING_STATUS, MatchConstants, DUMMY_FIXTURE_TABLE_COLUMNS, DELETE_SEASON_SUBHEADING, REVOKE_MATCH_UPDATE_SUBHEADING } from '@shared/constants/constants';
import { formsMessages } from '@shared/constants/messages';
import { RegexPatterns } from '@shared/Constants/REGEX';
import { ConfirmationBoxComponent } from '@shared/dialogs/confirmation-box/confirmation-box.component';
import { GroundPrivateInfo } from '@shared/interfaces/ground.model';
import { IDummyFixture, MatchFixture } from '@shared/interfaces/match.model';
import { SeasonDraft, SeasonParticipants, SeasonAbout, SeasonBasicInfo } from '@shared/interfaces/season.model';
import { PaymentService } from '@shared/services/payment.service';
import { ArraySorting } from '@shared/utils/array-sorting';
import { environment } from 'environments/environment.dev';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { RequestDialogComponent } from '../request-dialog/request-dialog.component';
import { SeasonAdminService } from '../season-admin.service';
import { UpdateMatchReportComponent } from '../update-match-report/update-match-report.component';

@Component({
  selector: 'app-view-published-season',
  templateUrl: './view-published-season.component.html',
  styleUrls: ['./view-published-season.component.scss']
})
export class ViewPublishedSeasonComponent implements OnInit, OnDestroy {

  readonly default = LOADING_STATUS.DEFAULT;
  readonly loading = LOADING_STATUS.LOADING;
  readonly done = LOADING_STATUS.DONE;
  readonly descriptionLimit = MatchConstants.LARGE_TEXT_CHARACTER_LIMIT;
  readonly rulesLimit = MatchConstants.LARGE_TEXT_CHARACTER_LIMIT;

  seasonID: string = null;
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
  isLoaderShown: boolean = false;
  messages = formsMessages;
  seasonData: SeasonBasicInfo;
  subscriptions = new Subscription();
  seasonMoreData: SeasonAbout;
  seasonFixtures: IDummyFixture[] = [];
  seasonParticipants: SeasonParticipants[] = [];
  updateEntriesForm = new FormGroup({});
  isRestrictedParticipants: string[];

  constructor(
    private route: ActivatedRoute,
    private ngFire: AngularFirestore,
    private seasonAdminService: SeasonAdminService,
    private dialog: MatDialog,
    private snackbarService: SnackbarService,
    private paymentService: PaymentService
  ) { }

  ngOnInit(): void {
    const params = this.route.snapshot.params;
    this.seasonID = params['seasonid'];
    if (this.seasonID) {
      this.getSeasonInfo();
      this.getParticipants();
    }
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  initForm() {
    this.updateEntriesForm = new FormGroup({
      description: new FormControl(this.seasonMoreData?.description,
        [Validators.required, Validators.pattern(RegexPatterns.bio), Validators.maxLength(this.descriptionLimit)]
      ),
      rules: new FormControl(this.seasonMoreData?.rules,
        [Validators.required, Validators.pattern(RegexPatterns.bio), Validators.maxLength(this.rulesLimit)]
      ),
    });
  }

  getSeasonInfo(): void {
    this.isLoaderShown = true;
    forkJoin([
      this.ngFire.collection('seasons').doc(this.seasonID).get(),
      this.ngFire.collection(`seasons/${this.seasonID}/additionalInfo`).doc('moreInfo').get()
    ])
      .subscribe({
        next: (response) => {
          if (response && response[0]?.exists && response[1]?.exists) {
            this.seasonData = response[0].data() as SeasonBasicInfo;
            this.seasonMoreData = response[1].data() as SeasonAbout;
            this.isRestrictedParticipants = this.seasonMoreData.allowedParticipants;
            this.getFixtures();
            this.initForm();
            this.isLoaderShown = false;
          }
        },
        error: () => {
          this.isLoaderShown = false;
          this.seasonFixtures = [];
        }
      });
  }

  getParticipants() {
    this.ngFire.collection('seasons').doc(this.seasonID).collection('participants').get().subscribe({
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
    return this.seasonAdminService.getStatusClass(this.seasonData?.status);
  }

  edit() {
    if (this.isSeasonFinished) {
      return;
    };
    this.isEditMode = true;
    this.updateEntriesForm.setValue({
      description: this.seasonMoreData?.description,
      rules: this.seasonMoreData?.rules
    });
  }

  updateSeason() {
    if (this.isSeasonFinished || this.updateEntriesForm.invalid) {
      return;
    }
    const updatedTextFields: Partial<SeasonAbout> = {};
    if (this.description.valid && this.description.dirty && this.description.value
      && (this.description.value !== this.seasonMoreData?.description)) {
      updatedTextFields.description = this.description.value.trim();
    }
    if (this.rules.valid && this.rules.dirty && this.rules.value && (this.rules.value !== this.seasonMoreData?.rules)) {
      updatedTextFields.rules = this.rules.value.trim();
    }
    if (Object.keys(updatedTextFields).length) {
      this.isLoaderShown = true;
      this.ngFire.collection(`seasons/${this.seasonID}/additionalInfo`).doc('moreInfo').update({
        ...updatedTextFields
      })
        .then(() => {
          this.isLoaderShown = false;
          this.snackbarService.displayCustomMsg('Info updated successfully!');
          this.getSeasonInfo();
          this.isEditMode = false;
        })
        .catch(() => {
          this.isLoaderShown = false;
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
    this.isLoaderShown = true
    this.isRequestExists$.subscribe(response => {
      if (!response && this.isSeasonPublished) {
        this.isLoaderShown = false;
        this.dialog.open(RequestDialogComponent, {
          panelClass: 'fk-dialogs',
          data: {
            season: this.seasonID,
            heading: isDeleteRequest ? DELETE_SEASON_SUBHEADING : REVOKE_MATCH_UPDATE_SUBHEADING,
            isShowMatch: !isDeleteRequest
          }
        }).afterClosed().subscribe(userResponse => {
          if (userResponse && Object.keys(userResponse).length === 4) {
            this.isLoaderShown = true;
            this.ngFire.collection('adminRequests').doc(userResponse.id).set(userResponse)
              .then(
                () => {
                  this.isLoaderShown = false;
                  const message = (isDeleteRequest ? 'Delete' : 'Revoke') + ' Request Submitted!';
                  this.snackbarService.displayCustomMsg(message);
                }, err => {
                  this.isLoaderShown = false;
                  this.snackbarService.displayError('Request raise failed!');
                }
              );
          }
        });
      } else {
        this.isLoaderShown = false;
        this.snackbarService.displayCustomMsg('Request already submitted!');
      }
    });
  }

  onConfirm(): Observable<any> {
    return this.dialog.open(ConfirmationBoxComponent).afterClosed();
  }

  onUpdateMatchData(matchID: any) {
    if (matchID) {
      this.isLoaderShown = true;
      this.isValidUpdate(matchID).subscribe(response => {
        if (response === true) {
          this.dialog.open(UpdateMatchReportComponent, {
            panelClass: 'extra-large-dialogs',
            data: matchID,
            disableClose: true
          });
        }
        this.isLoaderShown = false;
      });
    }
  }

  isValidUpdate(matchID: string): Observable<boolean> {
    if (matchID) {
      return this.ngFire.collection('allMatches')
        .doc(matchID)
        .get()
        .pipe(map(resp => resp.exists && (resp.data() as MatchFixture).concluded === false));
    }
  }

  getFixtures(): void {
    this.ngFire.collection('allMatches', query => query.where('season', '==', this.seasonData?.name))
      .snapshotChanges()
      .pipe(
        map(response => response.map(doc => ({ id: doc.payload.doc.id, ...doc.payload.doc.data() as MatchFixture }) as MatchFixture)),
        map(fixtureData => fixtureData.map(data =>
        ({
          home: data.home.name,
          away: data.away.name,
          date: data.date,
          concluded: data.concluded,
          premium: data.premium,
          season: data.season,
          type: data.type,
          locCity: data.locCity,
          locState: data.locState,
          stadium: data.stadium,
          id: data.id,
        } as IDummyFixture)
        )),
        map(response => response.sort(ArraySorting.sortObjectByKey('date'))),
      ).subscribe(response => {
        this.seasonFixtures = response;
      });
  }

  goToURL() {
    if (this.seasonData?.name && environment) {
      const SEASON_URL = environment?.firebase?.url + '/s/';
      window.open(`${SEASON_URL}${this.seasonData?.name}`, '_blank');
    }
  }

  get containingTournaments(): string {
    return this.seasonData?.cont_tour.join(', ');
  }

  get isSeasonPublished(): boolean {
    return this.seasonData?.status === 'PUBLISHED';
  }

  get isSeasonFinished(): boolean {
    return this.seasonData?.status === 'FINISHED';
  }

  get isRequestExists$(): Observable<boolean> {
    if (this.seasonID) {
      return this.ngFire.collection('adminRequests', query => query.where('seasonId', '==', this.seasonID))
        .get()
        .pipe(map(resp => !resp.empty), share());
    }
  }

  get payableFees(): number {
    return this.paymentService.getFeesAfterDiscount(this.seasonData?.feesPerTeam, this.seasonData?.discount);
  }

  get description(): AbstractControl {
    return this.updateEntriesForm.get('description');
  }

  get rules(): AbstractControl {
    return this.updateEntriesForm.get('rules');
  }
}
