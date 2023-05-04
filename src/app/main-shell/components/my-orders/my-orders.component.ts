import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { IItemType, RazorPayOrder } from '@shared/interfaces/order.model';
import { ApiGetService } from '@shared/services/api.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.scss']
})
export class MyOrdersComponent implements OnInit, OnDestroy {

  readonly type = IItemType;

  orders: Partial<RazorPayOrder>[] = [];
  isLoaderShown = false;
  selectedOrderID = null;
  subscriptions = new Subscription();

  constructor(
    private authService: AuthService,
    private apiService: ApiGetService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getOrders();
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
    this.router.navigate(['order', orderID]);
  }

  showLoader() {
    this.isLoaderShown = true;
  }

  hideLoader() {
    this.isLoaderShown = false;
  }

}
