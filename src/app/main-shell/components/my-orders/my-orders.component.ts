import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { RazorPayOrder } from '@shared/interfaces/order.model';
import { ApiGetService } from '@shared/services/api.service';
import { Subscription } from 'rxjs';
import { OrderComponent } from '../order/order.component';

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.scss']
})
export class MyOrdersComponent implements OnInit, OnDestroy {

  orders: Partial<RazorPayOrder>[] = [];
  isLoaderShown = false;
  selectedOrderID = null;
  subscriptions = new Subscription();

  constructor(
    private authService: AuthService,
    private apiService: ApiGetService,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.getOrders();
    this.subscriptions.add(this.route.params.subscribe({
      next: (params) => {
        if (params && params.hasOwnProperty('orderid')) {
          this.openOrder(params['orderid']);
        }
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getOrders() {
    this.authService.isLoggedIn().subscribe({
      next: user => {
        if (user?.uid) {
          this.showLoader();
          this.apiService.getUserOrders(user.uid)
            .subscribe({
              next: response => {
                this.orders = response;
                this.hideLoader();
              },
              error: () => {
                this.hideLoader();
              }
            })
        }
      }
    })
  }

  openOrder(orderID: string) {
    if (orderID) {
      this.selectedOrderID = orderID;
      this.dialog.open(OrderComponent, {
        panelClass: 'large-dialogs',
        data: this.selectedOrderID
      })
    }
  }

  showLoader() {
    this.isLoaderShown = true;
  }

  hideLoader() {
    this.isLoaderShown = false;
  }

}
