import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';

export interface IPaymentOptionsData {
  amount: number;
  credit: number;
}

export enum IPaymentOption {
  payNow = 0,
  payLater = 1,
  customCode = 2
}

export interface ISelectedPaymentOption {
  mode: IPaymentOption;
  amount: number;
  pointsUsed: number;
}

@Component({
  selector: 'app-payment-options-pickup-game',
  templateUrl: './payment-options-pickup-game.component.html',
  styleUrls: ['./payment-options-pickup-game.component.scss']
})
export class PaymentOptionsPickupGameComponent implements OnInit {

  finalAmount: number = 0;
  isPointsUsed = false;

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<PaymentOptionsPickupGameComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: IPaymentOptionsData
  ) { }

  ngOnInit(): void {
    this.finalAmount = this.data.amount;
  }

  calculateAmount(event) {
    if (event.checked) {
      this.finalAmount = this.data.amount - this.data.credit;
    } else {
      this.finalAmount = this.data.amount;
    }
  }

  confirmPay() {
    this.dismiss({ mode: IPaymentOption.payNow, amount: this.finalAmount, pointsUsed: this.isPointsUsed ? this.data.credit : 0 });
  }

  payLater() {
    this.dismiss({ mode: IPaymentOption.payLater, amount: this.finalAmount, pointsUsed: 0 });
  }

  useCustomCode() {
    this.dismiss({ mode: IPaymentOption.customCode, amount: this.finalAmount, pointsUsed: 0 });
  }

  dismiss(option: ISelectedPaymentOption) {
    this._bottomSheetRef.dismiss(option);
  }

}
