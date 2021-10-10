import { Component, OnInit } from '@angular/core';
import { FOUNDERS_INFO } from 'src/app/shared/Constants/DEFAULTS';
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
    this.prateek = FOUNDERS_INFO.prateek;
    this.ankit = FOUNDERS_INFO.ankit;
  }
}
