import { Component, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { CheckoutService } from 'src/app/services/checkout.service';

@Component({
  selector: 'app-complete-payment',
  templateUrl: './complete-payment.component.html',
  styleUrls: ['./complete-payment.component.css'],
})
export class CompletePaymentComponent implements OnInit {
  @Output('paymentComplete') viewOrders = new Subject<boolean>();
  isProcessing: boolean = true;
  constructor(private checkServ: CheckoutService) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.isProcessing = false;
    }, 3000);
  }
  onViewOrders() {
    this.viewOrders.next(true);
  }
}
