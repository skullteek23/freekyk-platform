import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-bar-loading-shimmer',
  templateUrl: './bar-loading-shimmer.component.html',
  styleUrls: ['./bar-loading-shimmer.component.css'],
})
export class BarLoadingShimmerComponent implements OnInit {
  dummies = [1, 1, 1, 1, 1, 1, 1, 1, 1];
  constructor() {}

  ngOnInit(): void {}
}
