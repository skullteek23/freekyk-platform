import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProfileConstants } from '@shared/constants/constants';
import { formsMessages } from '@shared/constants/messages';
import { RegexPatterns } from '@shared/Constants/REGEX';
import { FeatureInfoComponent, IFeatureInfoOptions } from '@shared/dialogs/feature-info/feature-info.component';
import { RULES } from '@shared/web-content/MATCH-RELATED';

export interface ICancellationDialogData {
  reasonsList: string[];
  showConfirmation: boolean;
  confirmationName?: string;
}

@Component({
  selector: 'app-cancel-dialog',
  templateUrl: './cancel-dialog.component.html',
  styleUrls: ['./cancel-dialog.component.scss']
})
export class CancelDialogComponent implements OnInit {

  readonly queryLimit = ProfileConstants.SUPPORT_QUERY_LIMIT;

  cancelForm: FormGroup;
  messages = formsMessages;

  constructor(
    public dialogRef: MatDialogRef<CancelDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ICancellationDialogData,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.cancelForm = new FormGroup({
      reason: new FormControl(null, Validators.required),
      description: new FormControl(null, [Validators.required, Validators.maxLength(this.queryLimit), Validators.pattern(RegexPatterns.query)]),
      confirmName: new FormControl(null, [this.confirmName.bind(this)])
    })
  }

  confirmName(control: AbstractControl): ValidationErrors {
    if (this.data?.showConfirmation && this.data?.confirmationName) {
      return control?.value?.trim() !== this.data?.confirmationName?.trim() ? { invalidName: true } : null;
    }
    return null;
  }

  onCloseDialog() {
    this.dialogRef.close();
  }

  submit() {
    if (this.cancelForm.invalid) {
      return;
    }
    this.dialogRef.close(this.cancelForm.value);
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
