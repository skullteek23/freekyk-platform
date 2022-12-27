import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-error',
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss'],
})
export class ErrorComponent implements OnInit {

  errorMessage: string;
  errorCode: string;

  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.errorMessage = this.route?.snapshot?.data?.message;
    this.errorCode = this.route?.snapshot?.data?.code;
  }
}
