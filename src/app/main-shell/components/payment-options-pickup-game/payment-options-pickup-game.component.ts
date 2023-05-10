import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatTreeNestedDataSource } from '@angular/material/tree';

export enum IPaymentOptionModes {
  freekykPoints = 0,
  payNow = 1,
  bookWithCash = 2,
  bookOnline = 3
}

export interface IPaymentOptions {
  mode: IPaymentOptionModes;
  label: string;
  icon: string;
  amount: number;
  disabled?: boolean;
  subOption?: IPaymentOptions[]
}

export interface IPaymentOptionsDialogData {
  options: IPaymentOptions[];
  slotsCount: number;
  amount: number;
}

@Component({
  selector: 'app-payment-options-pickup-game',
  templateUrl: './payment-options-pickup-game.component.html',
  styleUrls: ['./payment-options-pickup-game.component.scss']
})
export class PaymentOptionsPickupGameComponent implements OnInit {

  treeControl = new NestedTreeControl<IPaymentOptions>(node => node.subOption);
  dataSource = new MatTreeNestedDataSource<IPaymentOptions>();

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<PaymentOptionsPickupGameComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public dialogData: IPaymentOptionsDialogData
  ) { }

  ngOnInit(): void {
    this.dataSource.data = this.dialogData.options;
  }

  openInfo() { }

  dismiss(option?: IPaymentOptions) {
    this._bottomSheetRef.dismiss(option);
  }

  hasChild = (_: number, node: IPaymentOptions) => !!node.subOption && node.subOption.length > 0;

}
