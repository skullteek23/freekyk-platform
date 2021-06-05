import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-fs-home',
  templateUrl: './fs-home.component.html',
  styleUrls: ['./fs-home.component.css'],
})
export class FsHomeComponent implements OnInit {
  communityNumbers = [
    { name: 'Freestylers', number: '200+' },
    { name: 'Contests', number: '20+' },
    { name: 'Levels', number: '5' },
    { name: 'Tricks', number: '50+' },
  ];
  constructor() {}
  ngOnInit(): void {}
}
