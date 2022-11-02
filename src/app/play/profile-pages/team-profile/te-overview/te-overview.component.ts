import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TeamMoreInfo } from '@shared/interfaces/team.model';

@Component({
  selector: 'app-te-overview',
  templateUrl: './te-overview.component.html',
  styleUrls: ['./te-overview.component.scss'],
})
export class TeOverviewComponent implements OnInit {
  @Input() data: TeamMoreInfo;
  @Input() loc: { city: string; state: string };
  constructor() { }

  ngOnInit(): void { }
  onRedirectSocialMedia(loc: string): void {
    if (loc != null) {
      window.location.href = loc;
    }
  }
}
