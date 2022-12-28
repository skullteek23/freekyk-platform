import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatchConstants } from '@shared/constants/constants';
import { SocialMediaLinks } from '../../interfaces/user.model';

@Component({
  selector: 'app-social-media-links',
  templateUrl: './social-media-links.component.html',
  styleUrls: ['./social-media-links.component.scss'],
})
export class SocialMediaLinksComponent implements OnInit {

  @Input('links') socials: SocialMediaLinks | null;
  @Input('mode') type: 'player' | 'freestyler' | 'team' = 'player';
  @Output('addLink') Addlink = new EventEmitter<true>();

  readonly facebookUrl = MatchConstants.SOCIAL_MEDIA_PRE.fb;
  readonly InstaUrl = MatchConstants.SOCIAL_MEDIA_PRE.ig;
  readonly TwitterUrl = MatchConstants.SOCIAL_MEDIA_PRE.tw;
  readonly youtubeUrl = MatchConstants.SOCIAL_MEDIA_PRE.yt;
  readonly ADD_THIS_LINK = MatchConstants.LINK_NOT_ADDED;

  constructor() { }

  ngOnInit(): void { }

  onAddLinks(): void {
    this.Addlink.emit(true);
  }

  onOpenSocialMedia(sm: string): void {
    switch (sm) {
      case 'facebook':
        window.open(this.facebookUrl + this.socials?.fb, '_blank');

        break;
      case 'instagram':
        window.open(this.InstaUrl + this.socials?.ig, '_blank');
        break;
      case 'twitter':
        window.open(this.TwitterUrl + this.socials?.tw, '_blank');
        break;
      case 'youtube':
        window.open(this.youtubeUrl + this.socials?.yt, '_blank');
        break;
    }
  }
}
