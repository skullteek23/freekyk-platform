import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dash-premium',
  templateUrl: './dash-premium.component.html',
  styleUrls: ['./dash-premium.component.css'],
})
export class DashPremiumComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
  getDate() {
    return new Date();
  }
}
