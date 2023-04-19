import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { SnackbarService } from '@app/services/snackbar.service';
import { UNIVERSAL_OPTIONS } from '@shared/Constants/RAZORPAY';
import { IPickupGameSlot } from '@shared/interfaces/game.model';
import { OrderTypes, RazorPayOrder } from '@shared/interfaces/order.model';
import { ListOption } from '@shared/interfaces/others.model';
import { ApiGetService, ApiPostService } from '@shared/services/api.service';
import { ICheckoutOptions, PaymentService } from '@shared/services/payment.service';
import { SeasonAllInfo } from '@shared/utils/pipe-functions';

@Component({
  selector: 'app-waiting-list-dialog',
  templateUrl: './waiting-list-dialog.component.html',
  styleUrls: ['./waiting-list-dialog.component.scss'],
  providers: [DatePipe]
})
export class WaitingListDialogComponent implements OnInit {

  list: ListOption[] = [];
  isUserAlreadyWaiting = false;
  isLoaderShown = false;

  constructor(
    public dialogRef: MatDialogRef<WaitingListDialogComponent>,
    private apiService: ApiGetService,
    private apiPostService: ApiPostService,
    private snackbarService: SnackbarService,
    private paymentService: PaymentService,
    private authService: AuthService,
    private router: Router,
    private datePipe: DatePipe,
    @Inject(MAT_DIALOG_DATA) public data: Partial<SeasonAllInfo>
  ) { }

  ngOnInit(): void {
    this.getWaitingList();
  }

  onCloseDialog() {
    this.dialogRef.close()
  }

  getWaitingList() {
    this.showLoader();
    this.apiService.getSeasonWaitingList(this.data.id)
      .subscribe({
        next: (response) => {
          if (response) {
            this.list = response;
            const user = this.authService.getUser();
            if (user) {
              this.isUserAlreadyWaiting = this.list?.findIndex(val => val.value === user.uid) > -1
            } else {
              this.isUserAlreadyWaiting = false;
            }
          }
          this.hideLoader();
        },
        error: (error) => {
          this.snackbarService.displayError('Error getting waiting list!');
          this.hideLoader();
        }
      });
  }

  redirectToUrl(path: string): void {
    const encodedString = encodeURIComponent(`/pickup-game/${this.data.id}/pay`);
    this.router.navigate([path], { queryParams: { callback: encodedString } });
  }

  async addToWaitingList(): Promise<any> {
    const user = this.authService.getUser();
    if (!this.isUserAlreadyWaiting && user) {
      this.showLoader();
      const order = await this.paymentService.getNewOrder(user.uid, this.data.fees.toString());
      if (order) {
        const options: Partial<ICheckoutOptions> = {
          ...UNIVERSAL_OPTIONS,
          description: `1 Waiting List Entry`,
          order_id: order.id,
          amount: this.data.fees * 100,
          handler: this.handlePaymentSuccess.bind(this),
          modal: {
            backdropclose: false,
            escape: false,
            confirm_close: true,
            ondismiss: this.dismissDialog.bind(this)
          }
        }
        this.paymentService.openCheckoutPage(options);
      } else {
        this.hideLoader();
      }
    } else {
      this.hideLoader();
      this.snackbarService.displayCustomMsg('You are already added to waiting list!');
    }
  }

  handlePaymentSuccess(response) {
    if (response) {
      this.showLoader();
      this.paymentService.verifyPayment(response)
        .subscribe({
          next: () => {
            const allPromises = [];
            const options: Partial<RazorPayOrder> = {
              description: '1',
              notes: [`Purchased 1 waiting list slot on ${this.datePipe.transform(new Date(), 'short')}`]
            }
            allPromises.push(this.paymentService.saveOrder(this.data.id, OrderTypes.season, options, response).toPromise());
            allPromises.push(this.saveToWaitingList(response['razorpay_order_id']));

            Promise.all(allPromises)
              .then(() => {
                this.snackbarService.displayCustomMsg('You have been added to the waiting list!');
              })
              .catch((error) => {
                this.snackbarService.displayError(error?.message);
              })
              .finally(() => {
                this.getWaitingList();
              })
          },
          error: (error) => {
            this.hideLoader();
            this.snackbarService.displayError(error?.message);
          }
        });
    } else {
      this.hideLoader();
      this.snackbarService.displayError();
    }
  }

  saveToWaitingList(orderID: string) {
    const data: IPickupGameSlot = {
      slots: [],
      uid: this.authService.getUser().uid,
      timestamp: new Date().getTime(),
      orderID,
      seasonID: this.data.id
    }
    return this.apiPostService.saveWaitingListEntry(data);
  }

  dismissDialog() {
    this.getWaitingList();
  }

  showLoader() {
    this.isLoaderShown = true;
  }

  hideLoader() {
    this.isLoaderShown = false;
  }

}
