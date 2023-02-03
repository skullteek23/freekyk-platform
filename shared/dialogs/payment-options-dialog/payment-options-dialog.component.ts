import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface IPaymentOptions {
  subheading: string;
  cta: { primary: boolean, text: string, disabled: boolean }[];
  payAmount: number;
  offerExpiry: number;
}

@Component({
  selector: 'app-payment-options-dialog',
  templateUrl: './payment-options-dialog.component.html',
  styleUrls: ['./payment-options-dialog.component.scss']
})
export class PaymentOptionsDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PaymentOptionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IPaymentOptions[]
  ) { }

  ngOnInit(): void {
  }
}
