import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  DELIVERED,
  FAILED,
  OrderBasic,
  PLACED,
  TRANSIT,
} from 'src/app/shared/interfaces/order.model';

@Component({
  selector: 'app-acc-orders',
  templateUrl: './acc-orders.component.html',
  styleUrls: ['./acc-orders.component.css'],
})
export class AccOrdersComponent implements OnInit {
  Orders$: Observable<OrderBasic[]>;
  isLoading = true;
  noOrders: boolean = false;
  constructor(private ngFire: AngularFirestore) {}
  ngOnInit(): void {
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
    this.onGetOrders();
  }
  onGetOrders() {
    const uid = localStorage.getItem('uid');
    this.Orders$ = this.ngFire
      .collection('orders', (query) => query.where('orderedByUID', '==', uid))
      .get()
      .pipe(
        tap((resp) => (this.noOrders = resp.empty)),
        map((resp) => resp.docs.map((doc) => <OrderBasic>doc.data()))
      );
  }
  getColor(status: DELIVERED | TRANSIT | PLACED | FAILED) {
    switch (status) {
      case 'order is delivered':
        return 'var(--primaryColor)';
      case 'order in transit':
        return 'var(--premiumServiceColor)';
      case 'order is placed':
        return 'grey';
      case 'order error':
        return 'var(--red)';
      default:
        return 'var(--secondaryColor)';
    }
  }
  onViewOrderDetails() {}
  onDownloadInvoice() {}
}
