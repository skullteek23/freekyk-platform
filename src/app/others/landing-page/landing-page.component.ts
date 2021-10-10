import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
})
export class LandingPageComponent implements OnInit {
  communityNumbers = [
    { name: 'Players', number: '400+' },
    { name: 'Freestylers', number: '200+' },
    { name: 'Teams', number: '20+' },
    { name: 'Matches', number: '150+' },
  ];
  constructor() {}

  ngOnInit(): void {}
}
