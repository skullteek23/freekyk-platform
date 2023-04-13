import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { RazorPayOrder } from '@shared/interfaces/order.model';
import { ApiGetService } from '@shared/services/api.service';

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.scss']
})
export class MyOrdersComponent implements OnInit {

  orders: Partial<RazorPayOrder>[] = [];
  isLoaderShown = false;

  constructor(
    private authService: AuthService,
    private apiService: ApiGetService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getOrders();
  }

  getOrders() {
    this.authService.isLoggedIn().subscribe({
      next: user => {
        if (user?.uid) {
          this.apiService.getUserOrders(user.uid)
            .subscribe({
              next: response => {
                this.orders = response;
              }
            })
        }
      }
    })
  }

  openOrder(order: Partial<RazorPayOrder>) {
    this.router.navigate(['/order', order.id]);
  }

  showLoader() {
    this.isLoaderShown = true;
  }

  hideLoader() {
    this.isLoaderShown = false;
  }

}
