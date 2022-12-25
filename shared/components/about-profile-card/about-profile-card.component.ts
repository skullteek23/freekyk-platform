import { Component, Input, OnInit } from '@angular/core';
import { profile } from '../../interfaces/others.model';

@Component({
  selector: 'app-about-profile-card',
  templateUrl: './about-profile-card.component.html',
  styleUrls: ['./about-profile-card.component.scss'],
})
export class AboutProfileCardComponent implements OnInit {

  @Input('data') profile: profile;

  constructor() { }

  ngOnInit(): void { }
}
