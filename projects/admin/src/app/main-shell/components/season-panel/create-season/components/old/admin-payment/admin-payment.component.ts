import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { SnackbarService } from '@shared/services/snackbar.service';
import { UNIVERSAL_OPTIONS } from '@shared/constants/RAZORPAY';
import { RegexPatterns } from '@shared/constants/REGEX';
import { ICheckoutOptions } from '@shared/interfaces/order.model';
import { ISelectMatchType } from '@shared/interfaces/season.model';
import { PaymentService } from '@shared/services/payment.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-payment',
  templateUrl: './admin-payment.component.html',
  styleUrls: ['./admin-payment.component.scss']
})
export class AdminPaymentComponent implements OnInit {

  // readonly loadingStatus = LoadingStatus;

  paymentForm: FormGroup;
  subscriptions = new Subscription();
  errorMessage = '';

  constructor(
    private paymentService: PaymentService,
    private snackBarService: SnackbarService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.calculatePayment();
    this.initPayment();
  }

  initForm() {
    this.paymentForm = new FormGroup({
      amount: new FormControl(null, [Validators.required, Validators.min(0), Validators.max(50000), Validators.pattern(RegexPatterns.num)]),
      isSuccess: new FormControl(null, Validators.requiredTrue),
    })
  }

  calculatePayment(): void {
    const selectMatchTypeFormData: ISelectMatchType = JSON.parse(JSON.stringify(sessionStorage.getItem('selectMatchType')));
    if (selectMatchTypeFormData) {
      // pricing model calculations
      const totalAmount = 1;
      this.amount.setValue(totalAmount);
    } else {
      this.snackBarService.displayCustomMsg('Please finish previous steps');
    }
  }

  initPayment(): void {
    this.isSuccess.setValue(false);
    const fees = this.amount.value;
    if (fees) {
      this.paymentService.generateOrder(Number(fees), null)
        .then((response) => {
          if (response) {
            const options: Partial<ICheckoutOptions> = this.getSeasonCreationCheckoutOptions(fees);
            options.order_id = response['id'];
            options.modal = {
              ondismiss: () => {
                this.failure();
                this.errorMessage = 'To proceed further, payment must be done!';
                return 0;
              }
            }
            this.paymentService.openCheckoutPage(options);
          }
        })
        .catch((err) => {
          this.failure();
          this.errorMessage = 'Error generating order from RazorPay! Pls try again later';
        })
    } else if (fees === 0) {
      // case for 0 participation fees
      this.success();
    } else {
      this.snackBarService.displayError('Please finish previous steps!');
    }
  }

  getSeasonCreationCheckoutOptions(fees: string): Partial<ICheckoutOptions> {
    const options = {
      ...UNIVERSAL_OPTIONS,
      description: `Season Creation Fees`,
      handler: this.onSuccessSeasonPayment.bind(this),
      amount: Number(fees),
    };
    return options;
  }

  onSuccessSeasonPayment(response: any) {
    this.paymentService.verifyPayment(response).subscribe({
      next: (response) => {
        this.success();
      },
      error: (err) => {
        this.failure();
        this.errorMessage = 'Payment Verification Failed!';
      }
    })
  }

  failure() {
    this.isSuccess.setValue(false);
  }

  success() {
    this.isSuccess.setValue(true);
  }

  get amount(): AbstractControl {
    return this.paymentForm.get('amount');
  }

  get isSuccess(): AbstractControl {
    return this.paymentForm.get('isSuccess');
  }

}
