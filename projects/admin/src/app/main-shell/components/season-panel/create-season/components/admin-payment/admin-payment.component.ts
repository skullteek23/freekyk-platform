import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { SnackbarService } from '@app/services/snackbar.service';
import { ISelectMatchType } from '@shared/interfaces/season.model';
import { PaymentService } from '@shared/services/payment.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-payment',
  templateUrl: './admin-payment.component.html',
  styleUrls: ['./admin-payment.component.scss']
})
export class AdminPaymentComponent implements OnInit {

  isLoaderShown = true;
  isPaymentDone = false;
  paymentForm: FormGroup;
  subscriptions = new Subscription();
  totalAmount = 0;

  constructor(
    private snackbarService: SnackbarService,
    private paymentService: PaymentService,
    private ref: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.addPaymentEventListener();
    this.calculatePayment();
    this.intiPayment();
  }

  addPaymentEventListener() {
    this.subscriptions.add(this.paymentService._paymentStatusAdmin.subscribe(response => {
      if (response['status']) {
        this.success();
      } else {
        this.reset();
      }
      this.ref.detectChanges();
    }))
  }

  initForm() {
    this.paymentForm = new FormGroup({
      amount: new FormControl(null, [Validators.required, Validators.min(0)]),
      isSuccess: new FormControl(null, Validators.requiredTrue),
    })
  }

  calculatePayment(): void {
    const selectMatchTypeFormData: ISelectMatchType = JSON.parse(JSON.stringify(sessionStorage.getItem('selectMatchType')));
    if (selectMatchTypeFormData) {
      // pricing model calculations
      const totalAmount = 1000;
      this.amount.setValue(totalAmount);
    }
  }

  intiPayment(): void {
    this.paymentService.generateOrder(Number(this.amount.value))
      .then((response) => {
        if (response) {
          this.paymentService.openAdminCheckoutPage(response.id);
        } else {
          this.reset();
        }
      })
      .catch((err) => {
        this.reset();
        this.snackbarService.displayError('Order not generated due to an error');
      })
  }

  reset() {
    this.isPaymentDone = false;
    this.isLoaderShown = false;
    this.isSuccess.setValue(false);
  }

  success() {
    this.isLoaderShown = false;
    this.isPaymentDone = true;
    this.isSuccess.setValue(true);
  }

  get amount(): AbstractControl {
    return this.paymentForm.get('amount');
  }

  get isSuccess(): AbstractControl {
    return this.paymentForm.get('isSuccess');
  }

}
