import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RazorPayOrder } from '@shared/interfaces/order.model';

@Component({
  selector: 'app-pending-payment',
  templateUrl: './pending-payment.component.html',
  styleUrls: ['./pending-payment.component.scss']
})
export class PendingPaymentComponent implements OnInit {

  @Input() data: Partial<RazorPayOrder>[] = [];

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  openCheckoutFlow(order: Partial<RazorPayOrder>) {
    this.router.navigate(['/dashboard/participate', order.seasonID]);
  }
}
