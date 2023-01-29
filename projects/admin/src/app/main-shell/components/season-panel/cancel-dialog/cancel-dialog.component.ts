import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SnackbarService } from '@app/services/snackbar.service';
import { MatchConstants, MATCH_CANCELLATION_REASONS, ProfileConstants } from '@shared/constants/constants';
import { formsMessages } from '@shared/constants/messages';
import { RegexPatterns } from '@shared/Constants/REGEX';
import { FeatureInfoComponent, IFeatureInfoOptions } from '@shared/dialogs/feature-info/feature-info.component';
import { MatchCancelData, MatchFixture, MatchStatus } from '@shared/interfaces/match.model';
import { RULES } from '@shared/web-content/MATCH-RELATED';

@Component({
  selector: 'app-cancel-dialog',
  templateUrl: './cancel-dialog.component.html',
  styleUrls: ['./cancel-dialog.component.scss']
})
export class CancelDialogComponent implements OnInit {

  readonly reasonsList = MATCH_CANCELLATION_REASONS;
  readonly queryLimit = ProfileConstants.SUPPORT_QUERY_LIMIT;

  cancelForm: FormGroup;
  messages = formsMessages;
  isLoaderShown = false;
  isSuccess = false;

  constructor(
    public dialogRef: MatDialogRef<CancelDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public matchID: string,
    private dialog: MatDialog,
    private ngFire: AngularFirestore,
    private snackBarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.initForm()
  }

  initForm() {
    this.cancelForm = new FormGroup({
      reason: new FormControl(null, Validators.required),
      description: new FormControl(null, [Validators.required, Validators.maxLength(this.queryLimit), Validators.pattern(RegexPatterns.query)]),
    })
  }

  onCloseDialog() {
    this.dialogRef.close();
  }

  cancelMatch() {
    if (this.cancelForm.invalid) {
      return;
    }
    this.isLoaderShown = true;
    const update: Partial<MatchFixture> = {
      status: MatchStatus.CAN
    }
    const allPromises = [];
    const uid = sessionStorage.getItem('uid');
    const cancellationData: MatchCancelData = {
      reason: this.cancelForm.value.reason.trim(),
      description: this.cancelForm.value.description.trim(),
      mid: this.matchID,
      uid,
      type: 'match',
      operation: MatchStatus.CAN,
      date: new Date().getTime()
    }

    allPromises.push(this.ngFire.collection('allMatches').doc(this.matchID).update({ ...update }));
    allPromises.push(this.ngFire.collection('cancellations').doc(this.matchID).set(cancellationData));

    Promise.all(allPromises)
      .then(() => {
        this.snackBarService.displayCustomMsg('Match Cancelled Successfully!');
        this.isSuccess = true;
      })
      .catch(() => this.snackBarService.displayError())
      .finally(() => {
        this.isLoaderShown = false;
      })
  }

  openRules() {
    const data: IFeatureInfoOptions = {
      heading: 'Freekyk Rules & Regulations',
      description: RULES
    }
    this.dialog.open(FeatureInfoComponent, {
      panelClass: 'fk-dialogs',
      data
    })
  }
}
