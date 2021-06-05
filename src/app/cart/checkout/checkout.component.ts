import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { CheckoutService } from 'src/app/services/checkout.service';
import {
  OrderBasic,
  OrderAdditionalDetails,
} from 'src/app/shared/interfaces/order.model';
import { cartItem } from 'src/app/shared/interfaces/product.model';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
  providers: [CheckoutService],
})
export class CheckoutComponent implements OnInit {
  @ViewChild(MatStepper) stepper: MatStepper;
  constructor(
    public dialogRef: MatDialogRef<CheckoutComponent>,
    private checkoutServ: CheckoutService,
    @Inject(MAT_DIALOG_DATA) public data: cartItem[]
  ) {}
  ngOnInit(): void {
    this.checkoutServ.stepChanged.subscribe((step) =>
      step ? this.stepper.next() : this.stepper.previous
    );
  }
  onCloseDialog() {
    this.dialogRef.close();
  }
  onCompPayment() {
    const addr = this.checkoutServ.getAddr();
    this.dialogRef.close(addr);
  }
}
