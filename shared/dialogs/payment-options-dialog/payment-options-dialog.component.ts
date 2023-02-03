import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FeatureInfoComponent, IFeatureInfoOptions } from '../feature-info/feature-info.component';

export interface IPaymentOptions {
  subheading: string;
  cta: { primary: boolean, text: string, disabled: boolean }[];
  payAmount: number;
  offerExpiry: number;
  offerText: string;
  readMoreData: IFeatureInfoOptions;
}

@Component({
  selector: 'app-payment-options-dialog',
  templateUrl: './payment-options-dialog.component.html',
  styleUrls: ['./payment-options-dialog.component.scss']
})
export class PaymentOptionsDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PaymentOptionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IPaymentOptions[],
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
  }

  onCloseDialog(): void {
    this.dialogRef.close();
  }

  onReadMore(content: IFeatureInfoOptions) {
    this.dialog.open(FeatureInfoComponent, {
      data: content,
      panelClass: 'large-dialogs',
    })
  }

  onPayNow(selectedOption: IPaymentOptions) {
    this.dialogRef.close(selectedOption)
  }
}
