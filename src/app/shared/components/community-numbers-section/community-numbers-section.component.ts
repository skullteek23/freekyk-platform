import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-community-numbers-section',
  templateUrl: './community-numbers-section.component.html',
  styleUrls: ['./community-numbers-section.component.css'],
})
export class CommunityNumbersSectionComponent implements OnInit {
  @Input() content: { heading: string; desc: string } = {
    heading: 'A Powerful Community',
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
  };
  @Input('data') commNumbers: { name: string; number: string }[] = [];
  constructor() {}

  ngOnInit(): void {}
}
