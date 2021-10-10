import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-da-ho-all-contests',
  templateUrl: './da-ho-all-contests.component.html',
  styleUrls: ['./da-ho-all-contests.component.css'],
})
export class DaHoAllContestsComponent implements OnInit {
  isLoading = true;
  constructor() {}

  ngOnInit(): void {
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }
}
