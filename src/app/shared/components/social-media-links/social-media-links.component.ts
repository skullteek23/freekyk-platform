import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { SocialMediaLinks } from '../../interfaces/user.model';

@Component({
  selector: 'app-social-media-links',
  templateUrl: './social-media-links.component.html',
  styleUrls: ['./social-media-links.component.css'],
})
export class SocialMediaLinksComponent implements OnInit {
  @Input('links') socials: SocialMediaLinks | null;
  @Input('mode') type: 'player' | 'freestyler' | 'team' = 'player';
  @Input('showShare') onShowShareBtn: boolean = true;
  @Output('addLink') onAddlink = new EventEmitter<true>();
  @Output('shareProfile') onShareProfile = new EventEmitter<true>();
  facebookUrl = 'https://www.facebook.com/';
  InstaUrl = 'https://www.instagram.com/';
  TwitterUrl = 'https://www.twitter.com/';
  youtubeUrl = 'https://www.youtube.com/c/';
  constructor(private snackServ: SnackbarService) {}

  ngOnInit(): void {}
  onAddLinks() {
    this.onAddlink.emit(true);
  }
  onShare() {
    this.onShareProfile.emit(true);
  }
  onOpenSocialMedia(sm: string) {
    switch (sm) {
      case 'facebook':
        window.open(this.socials?.fb, '_blank');

        break;
      case 'instagram':
        window.open(this.socials?.ig, '_blank');
        break;
      case 'twitter':
        window.open(this.socials?.tw, '_blank');
        break;
      case 'youtube':
        window.open(this.socials?.yt, '_blank');
        break;
    }
  }
}
