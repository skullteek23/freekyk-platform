import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-pl-home',
  templateUrl: './pl-home.component.html',
  styleUrls: ['./pl-home.component.css'],
})
export class PlHomeComponent implements OnInit {
  constructor() {}
  ngOnInit(): void {}
  communityNumbers = [
    { name: 'Players', number: '400+' },
    { name: 'Tournaments', number: '5+' },
    { name: 'Teams', number: '20+' },
    { name: 'Matches', number: '150+' },
  ];
}
