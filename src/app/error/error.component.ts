import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.css'],
})
export class ErrorComponent implements OnInit {
  errorMessage: string;
  errorCode: string;
  constructor(private route: ActivatedRoute, private location: Location) {}

  ngOnInit(): void {
    this.errorMessage = this.route.snapshot.data.message;
    this.errorCode = this.route.snapshot.data.code;
    if (!this.errorMessage && !this.errorCode) {
      this.errorMessage = (this.location.getState() as any).message;
      this.errorCode = (this.location.getState() as any).code;
    }
    if (!this.errorMessage && !this.errorCode) {
      this.errorMessage = 'Service Unavailable! Please come back later.';
      this.errorCode = '503';
    }
  }
}
