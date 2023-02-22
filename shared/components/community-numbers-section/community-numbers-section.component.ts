import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

export interface ICommunityNumberData {
  heading: string,
  desc: string,
  numbers: { label: string, value: string, route: string }[]
};

@Component({
  selector: 'app-community-numbers-section',
  templateUrl: './community-numbers-section.component.html',
  styleUrls: ['./community-numbers-section.component.scss'],
})
export class CommunityNumbersSectionComponent implements OnInit {

  @Input() content: ICommunityNumberData = null;

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void { }

  onNavigate() {
    this.router.navigate(['/signup']);
  }

  onLearnMore(route: string) {
    this.router.navigate([route]);
  }
}
