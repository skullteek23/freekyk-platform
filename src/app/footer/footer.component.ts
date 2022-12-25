import { Component, OnInit } from '@angular/core';
import { SOCIAL_MEDIA_PRE } from '@shared/Constants/DEFAULTS';
import { FOOTER } from '@shared/Constants/WEBSITE_CONTENT';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  readonly COPYRIGHT = FOOTER.copyright;
  readonly ig = SOCIAL_MEDIA_PRE.ig;
  readonly fb = SOCIAL_MEDIA_PRE.fb;
  readonly tw = SOCIAL_MEDIA_PRE.tw;
  readonly yt = SOCIAL_MEDIA_PRE.yt;
  readonly linkedIn = SOCIAL_MEDIA_PRE.linkedIn;

  productLinks = FOOTER.product;
  aboutLinks = FOOTER.about;

  constructor() { }

  ngOnInit(): void { }
}
