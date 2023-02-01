import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { SnackbarService } from '@app/services/snackbar.service';
import { LOADING_STATUS, MatchConstants, DUMMY_FIXTURE_TABLE_COLUMNS, DELETE_SEASON_SUBHEADING, REVOKE_MATCH_UPDATE_SUBHEADING, MATCH_CANCELLATION_REASONS, SEASON_CANCELLATION_REASONS } from '@shared/constants/constants';
import { formsMessages } from '@shared/constants/messages';
import { ConfirmationBoxComponent } from '@shared/dialogs/confirmation-box/confirmation-box.component';
import { IDummyFixture, MatchCancelData, MatchFixture, MatchStatus } from '@shared/interfaces/match.model';
import { SeasonParticipants, SeasonAbout, SeasonBasicInfo, ISeasonPartner } from '@shared/interfaces/season.model';
import { PaymentService } from '@shared/services/payment.service';
import { ArraySorting } from '@shared/utils/array-sorting';
import { environment } from 'environments/environment';
import { forkJoin, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { IRequestData, RequestDialogComponent } from '../request-dialog/request-dialog.component';
import { SeasonAdminService } from '../../../services/season-admin.service';
import { AddGalleryDialogComponent } from '../add-gallery-dialog/add-gallery-dialog.component';
import { ISupportTicket } from '@shared/interfaces/ticket.model';
import { PhotoUploaderComponent } from '@shared/components/photo-uploader/photo-uploader.component';
import { AbortDialogComponent } from '../abort-dialog/abort-dialog.component';
import { CancelDialogComponent, ICancellationDialogData } from '../cancel-dialog/cancel-dialog.component';
import { RescheduleMatchDialogComponent } from '../reschedule-match-dialog/reschedule-match-dialog.component';
import { UpdateMatchReportComponent } from '../update-match-report/update-match-report.component';
import { AddSponsorComponent, ISponsorDialogData } from '../add-sponsor/add-sponsor.component';

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
    DUMMY_FIXTURE_TABLE_COLUMNS.STATUS,
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
  partners: ISeasonPartner[] = [];

  @ViewChild(PhotoUploaderComponent) photoUploaderComponent: PhotoUploaderComponent;

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
        [Validators.maxLength(this.descriptionLimit)]
      ),
      rules: new FormControl(this.seasonMoreData?.rules,
        [Validators.maxLength(this.rulesLimit)]
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
            this.getParticipants();
            this.getPartners();
            this.initForm();
            this.isLoaderShown = false;
          }
        },
        error: () => {
          this.isLoaderShown = false;
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

  getPartners() {
    this.ngFire.collection('partners', query => query.where('seasonID', '==', this.seasonID)).snapshotChanges().subscribe({
      next: (response) => {
        if (response) {
          this.partners = response.map(el => ({ id: el.payload.doc.id, ...el.payload.doc.data() as ISeasonPartner }));
        }
      },
      error: (error) => {
        this.snackbarService.displayError('Unable to get season partners!');
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
    if (this.isSeasonPublished) {
      const data: IRequestData = {
        seasonID: this.seasonID,
        heading: isDeleteRequest ? DELETE_SEASON_SUBHEADING : REVOKE_MATCH_UPDATE_SUBHEADING,
        isShowMatch: !isDeleteRequest
      }

      const dialogRef = this.dialog.open(RequestDialogComponent, {
        panelClass: 'fk-dialogs',
        data
      });

      dialogRef.afterClosed().subscribe((ticket: ISupportTicket) => {
        if (ticket) {
          this.isLoaderShown = true;
          this.ngFire.collection('tickets').add(ticket)
            .then(
              () => {
                this.isLoaderShown = false;
                const message = (isDeleteRequest ? 'Delete' : 'Revoke') + ' Request Submitted!';
                this.snackbarService.displayCustomMsg(message);
              }, err => {
                this.isLoaderShown = false;
                this.snackbarService.displayError('Request raise failed!');
              }
            )
            .catch(err => this.snackbarService.displayError());
        }
      });
    }
  }

  onChangeMatchStatus(event: { status: MatchStatus, matchID: string }) {
    this.changeStatus(event.status, event.matchID);
  }

  changeStatus(status: MatchStatus, matchID: string) {
    switch (status) {
      case MatchStatus.CAN:
        this.openCancelDialog(matchID);
        break;

      case MatchStatus.ABT:
        this.abortMatch(matchID);
        break;

      case MatchStatus.RES:
        this.rescheduleMatch(matchID);
        break;

      case MatchStatus.STU:
        this.onUpdateMatchData(matchID);
        break;
    }
  }

  abortMatch(matchID: string) {
    this.dialog.open(AbortDialogComponent, {
      panelClass: 'fk-dialogs',
      data: matchID,
    });
  }

  rescheduleMatch(matchID: string) {
    this.dialog.open(RescheduleMatchDialogComponent, {
      panelClass: 'extra-large-dialogs',
      data: matchID,
      disableClose: true
    });
  }

  onUpdateMatchData(matchID: string) {
    this.dialog.open(UpdateMatchReportComponent, {
      panelClass: 'extra-large-dialogs',
      data: matchID,
      disableClose: true
    });
  }

  openCancelDialog(matchID: string) {
    const data: ICancellationDialogData = {
      reasonsList: MATCH_CANCELLATION_REASONS,
      showConfirmation: false
    }
    this.dialog.open(CancelDialogComponent, {
      panelClass: 'fk-dialogs',
      data,
    }).afterClosed()
      .subscribe((response) => {
        if (response?.hasOwnProperty('reason') && response?.hasOwnProperty('description')) {
          this.cancelMatch(response, matchID);
        }
      });
  }

  openCancelSeasonDialog() {
    const data: ICancellationDialogData = {
      reasonsList: SEASON_CANCELLATION_REASONS,
      showConfirmation: true,
      confirmationName: this.seasonData.name
    }
    this.dialog.open(CancelDialogComponent, {
      panelClass: 'fk-dialogs',
      data,
    }).afterClosed()
      .subscribe((response) => {
        if (response?.hasOwnProperty('reason') && response?.hasOwnProperty('description')) {
          this.isLoaderShown = true;
          const data = {
            ...response,
            seasonID: this.seasonID
          }
          this.seasonAdminService.cancelSeason(data)
            .then(() => {
              this.snackbarService.displayCustomMsg('Season cancelled successfully!');
              this.getSeasonInfo();
            })
            .catch((error) => {
              this.snackbarService.displayError(error?.message);
            })
            .finally(() => this.isLoaderShown = false)
        }
      });
  }

  isValidCancellation() {
    if (this.seasonFixtures.length) {
      let conditionOne = false;
      let conditionTwo = false;
      const comparator = this.seasonFixtures.length * MatchConstants.SEASON_CANCELLATION_ONT_PERCENTAGE_MODIFIER;
      const onTimeMatchesLength = this.seasonFixtures.filter(el => el.status === MatchStatus.ONT).length;
      const isInitialMatchCancelledOrAborted = this.seasonFixtures.slice(0, this.seasonFixtures.length > 3 ? 3 : 1).every(el => el.status === MatchStatus.CAN || el.status === MatchStatus.ABT);
      if ((onTimeMatchesLength >= comparator) || isInitialMatchCancelledOrAborted) {
        conditionOne = true;
      }
      conditionTwo = this.seasonFixtures.some(el => el.status === MatchStatus.STU);
      return conditionOne && conditionTwo;
    }
    return false;
  }

  cancelMatch(data: any, mid: string) {
    this.isLoaderShown = true;
    const update: Partial<MatchFixture> = {
      status: MatchStatus.CAN
    }
    const allPromises = [];
    const uid = sessionStorage.getItem('uid');
    const cancellationData: MatchCancelData = {
      reason: data['reason'].trim(),
      description: data['description'].trim(),
      mid,
      uid,
      type: 'match',
      operation: MatchStatus.CAN,
      date: new Date().getTime()
    }

    allPromises.push(this.ngFire.collection('allMatches').doc(mid).update({ ...update }));
    allPromises.push(this.ngFire.collection('cancellations').doc(mid).set(cancellationData));

    Promise.all(allPromises)
      .then(() => {
        this.snackbarService.displayCustomMsg('Match Cancelled Successfully!');
      })
      .catch(() => this.snackbarService.displayError())
      .finally(() => {
        this.isLoaderShown = false;
      })
  }

  onChangeSeasonPhoto(newFileEvent: File) {
    this.dialog.open(ConfirmationBoxComponent)
      .afterClosed()
      .subscribe({
        next: (response) => {
          if (response) {
            this.isLoaderShown = true;
            this.seasonAdminService.uploadSeasonPhoto(this.seasonID, newFileEvent)
              .then(() => {
                this.snackbarService.displayCustomMsg('Season Photo updated successfully!');
              })
              .catch(() => {
                this.snackbarService.displayError('Error Updating Season Photo')
                this.photoUploaderComponent.setManualPreview(this.seasonData.imgpath);
              })
              .finally(() => this.isLoaderShown = false)
          } else {
            this.photoUploaderComponent.setManualPreview(this.seasonData.imgpath);
          }
        },
      })
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
          ground: data.ground,
          status: data.status,
          id: data.id,
        } as IDummyFixture)
        )),
        map(response => response.sort(ArraySorting.sortObjectByKey('date'))),
      ).subscribe(response => {
        this.seasonFixtures = response;
      });
  }

  onAddGallery() {
    if (this.seasonID) {
      this.dialog.open(AddGalleryDialogComponent, {
        panelClass: 'large-dialogs',
        data: this.seasonID
      })
    }
  }

  onAddPartner() {
    const data: ISponsorDialogData = {
      editMode: false,
      documentID: this.seasonID
    };
    if (this.seasonID) {
      this.dialog.open(AddSponsorComponent, {
        panelClass: 'fk-dialogs',
        data
      })
    }
  }

  onEditPartner(partnerID: string) {
    const data: ISponsorDialogData = {
      editMode: true,
      documentID: partnerID
    };
    if (partnerID) {
      this.dialog.open(AddSponsorComponent, {
        panelClass: 'fk-dialogs',
        data
      })
    }
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

  get payableFees(): number {
    return Number(this.paymentService.getFeesAfterDiscount(this.seasonData?.feesPerTeam, this.seasonData?.discount));
  }

  get description(): AbstractControl {
    return this.updateEntriesForm.get('description');
  }

  get rules(): AbstractControl {
    return this.updateEntriesForm.get('rules');
  }
}
