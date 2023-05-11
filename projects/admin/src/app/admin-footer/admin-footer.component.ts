import { Component, OnInit } from '@angular/core';
import { MatchConstants } from '@shared/constants/constants';
import { FOOTER } from '@shared/web-content/WEBSITE_CONTENT';
import { environment } from 'environments/environment.dev';

@Component({
  selector: 'app-admin-footer',
  templateUrl: './admin-footer.component.html',
  styleUrls: ['./admin-footer.component.scss']
})
export class AdminFooterComponent implements OnInit {
  readonly adminURL = environment?.firebase?.adminRegister || '';
  readonly COPYRIGHT = FOOTER.copyright;
  readonly ig = MatchConstants.SOCIAL_MEDIA_PRE.ig;
  readonly fb = MatchConstants.SOCIAL_MEDIA_PRE.fb;
  readonly tw = MatchConstants.SOCIAL_MEDIA_PRE.tw;
  readonly yt = MatchConstants.SOCIAL_MEDIA_PRE.yt;
  readonly linkedIn = MatchConstants.SOCIAL_MEDIA_PRE.linkedIn;

  productLinks = FOOTER.product;
  aboutLinks = FOOTER.about;

  constructor() { }

  ngOnInit(): void {
  }

}
