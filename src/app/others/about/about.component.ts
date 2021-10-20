import { Component, OnInit } from '@angular/core';
import { ABOUT_PAGE } from 'src/app/shared/Constants/WEBSITE_CONTENT';
import { profile } from 'src/app/shared/interfaces/others.model';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css'],
})
export class AboutComponent implements OnInit {
  prateek: profile;
  ankit: profile;
  constructor() {}

  ngOnInit(): void {
    this.prateek = ABOUT_PAGE.prateek;
    this.ankit = ABOUT_PAGE.ankit;
  }
}
