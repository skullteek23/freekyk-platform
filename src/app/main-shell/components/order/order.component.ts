import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SnackbarService } from '@app/services/snackbar.service';
import { RazorPayOrder } from '@shared/interfaces/order.model';
import { ApiGetService } from '@shared/services/api.service';
import { SelectQuantityComponent } from '../select-quantity/select-quantity.component';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {

  gstAmount = 0;
  amount = 0;
  order: Partial<RazorPayOrder>;
  showSuccess = false;

  constructor(
    public dialogRef: MatDialogRef<OrderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string,
    private router: Router,
    private apiService: ApiGetService,
    private snackbarService: SnackbarService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.getOrder();
  }

  getOrder() {
    if (this.data) {
      this.apiService.getOrder(this.data)
        .subscribe({
          next: response => {
            if (response) {
              this.order = response;
              this.calculateGst();
              this.showSuccess = true;
            }
          },
          error: (error) => {
            this.snackbarService.displayError();
            this.onCloseDialog();
          }
        })
    }
  }

  calculateGst() {
    const amountTemp = (this.order?.amount / 100);
    this.gstAmount = 0.18 * amountTemp;
    this.amount = amountTemp - this.gstAmount;
  }

  openSeason() {
    if (this.order?.seasonID) {
      this.apiService.getSeasonType(this.order?.seasonID)
        .subscribe({
          next: (response) => {
            if (response === 'FCP') {
              this.router.navigate(['/pickup-game', this.order.seasonID]);
            } else {
              this.router.navigate(['/game', this.order.seasonID]);
            }
            this.onCloseDialog();
          }
        })
    }
  }

  onCloseDialog() {
    this.dialogRef.close();
  }

  needHelp() {
    this.router.navigate(['/support/faqs']);
    this.onCloseDialog();
  }

  cancelOrder() {
    this.dialog.open(SelectQuantityComponent).afterClosed()
      .subscribe({
        next: response => {
          if (response > 0) {

          }
        }
      })
  }

}
