import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-pricing-template',
  templateUrl: './pricing-template.component.html',
  styleUrls: ['./pricing-template.component.css'],
})
export class PricingTemplateComponent implements OnInit {
  @Input('outer') notOnDash: boolean = true;
  constructor(private router: Router) {}
  ngOnInit(): void {}
  onBuyPremium() {
    if (this.notOnDash) this.onGotoDashboard();
    else {
      // this.cartServ.addMembership();
      // add membership on cart here
    }
  }
  onGotoDashboard() {
    this.router.navigate(['/dashboard', 'premium']);
  }
  onContactSales() {
    this.router.navigate(['/support']);
  }
}
