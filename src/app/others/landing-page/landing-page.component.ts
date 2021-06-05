import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css'],
})
export class LandingPageComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
  otherServices = [
    { name: 'Video Editing Services', route: '/veservices' },
    { name: 'Tournament Org. (Coming Soon)', route: '/service' },
    { name: 'Ground Booking (Coming Soon)', route: '/service' },
  ];
  communityNumbers = [
    { name: 'Players', number: '400+' },
    { name: 'Freestylers', number: '200+' },
    { name: 'Teams', number: '20+' },
    { name: 'Matches', number: '150+' },
  ];
}
