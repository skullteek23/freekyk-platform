import { Component, Inject, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { SnackbarService } from '@shared/services/snackbar.service';
import { MATCH_ABORT_REASONS, ProfileConstants } from '@shared/constants/constants';
import { formsMessages } from '@shared/constants/messages';
import { RegexPatterns } from '@shared/constants/REGEX';
import { IFeatureInfoOptions, FeatureInfoComponent } from '@shared/dialogs/feature-info/feature-info.component';
import { ICancelData, MatchFixture, MatchStatus } from '@shared/interfaces/match.model';
import { RULES } from '@shared/web-content/MATCH-RELATED';

@Component({
  selector: 'app-abort-dialog',
  templateUrl: './abort-dialog.component.html',
  styleUrls: ['./abort-dialog.component.scss']
})
export class AbortDialogComponent implements OnInit {

  readonly reasonsList = MATCH_ABORT_REASONS;
  readonly queryLimit = ProfileConstants.SUPPORT_QUERY_LIMIT;

  cancelForm: FormGroup;
  messages = formsMessages;
  isLoaderShown = false;
  isSuccess = false;

  constructor(
    public dialogRef: MatDialogRef<AbortDialogComponent>,
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

  abortMatch() {
    if (this.cancelForm.invalid) {
      return;
    }
    this.isLoaderShown = true;
    const update: Partial<MatchFixture> = {
      status: MatchStatus.ABT
    }
    const allPromises = [];
    const uid = sessionStorage.getItem('uid');
    const cancellationData: ICancelData = {
      reason: this.cancelForm.value.reason.trim(),
      description: this.cancelForm.value.description.trim(),
      docID: this.matchID,
      uid,
      type: 'abort-match',
      date: new Date().getTime()
    }

    allPromises.push(this.ngFire.collection('allMatches').doc(this.matchID).update({ ...update }));
    allPromises.push(this.ngFire.collection('cancellations').doc(this.matchID).set(cancellationData));

    Promise.all(allPromises)
      .then(() => {
        this.snackBarService.displayCustomMsg('Match Aborted Successfully!');
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
