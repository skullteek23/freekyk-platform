import { Component, OnInit } from '@angular/core';
import { MatchConstants } from '@shared/constants/constants';
import { FOOTER } from '@shared/Constants/WEBSITE_CONTENT';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  readonly COPYRIGHT = FOOTER.copyright;
  readonly ig = MatchConstants.SOCIAL_MEDIA_PRE.ig;
  readonly fb = MatchConstants.SOCIAL_MEDIA_PRE.fb;
  readonly tw = MatchConstants.SOCIAL_MEDIA_PRE.tw;
  readonly yt = MatchConstants.SOCIAL_MEDIA_PRE.yt;
  readonly linkedIn = MatchConstants.SOCIAL_MEDIA_PRE.linkedIn;

  productLinks = FOOTER.product;
  aboutLinks = FOOTER.about;

  constructor() { }

  ngOnInit(): void { }
}
