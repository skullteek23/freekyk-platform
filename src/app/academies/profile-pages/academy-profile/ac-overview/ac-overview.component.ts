import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-ac-overview',
  templateUrl: './ac-overview.component.html',
  styleUrls: ['./ac-overview.component.css'],
})
export class AcOverviewComponent implements OnInit {
  constructor() {}
  ngOnInit(): void {}
  getDate() {
    return new Date();
  }
  onRedirectSocialMedia(loc: string) {
    switch (loc) {
      case 'facebook':
        window.location.href = 'https://www.facebook.com/';
        break;
      case 'instagram':
        window.location.href = 'https://www.instagram.com/';
        break;
      case 'youtube':
        window.location.href = 'https://www.youtube.com/channel/';
        break;
      case 'twitter':
        window.location.href = 'https://www.twitter.com/';
        break;
    }
  }
}
