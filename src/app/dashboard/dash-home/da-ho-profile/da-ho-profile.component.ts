import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { SocialMediaLinks } from '@shared/interfaces/user.model';
import { UploadphotoComponent } from '../../dialogs/uploadphoto/uploadphoto.component';
import { DashState } from '../../store/dash.reducer';
import { EnlargeService } from 'src/app/services/enlarge.service';
import { ShareData, SocialShareService } from '@app/services/social-share.service';
@Component({
  selector: 'app-da-ho-profile',
  templateUrl: './da-ho-profile.component.html',
  styleUrls: ['./da-ho-profile.component.scss'],
})
export class DaHoProfileComponent implements OnInit, OnDestroy {

  @Input() profile: 'player' | 'freestyler' = 'player';

  playerName = 'Your Name';
  isLoading = true;
  defaultString = '-';
  mainProperties: {};
  smLinks: SocialMediaLinks;
  profilePhoto: string;
  nickname: string;
  subscriptions = new Subscription();

  constructor(
    private enlargeService: EnlargeService,
    private dialog: MatDialog,
    private router: Router,
    private socialShareService: SocialShareService,
    private store: Store<{ dash: DashState; }>
  ) { }

  ngOnInit(): void {
    this.subscriptions.add(
      this.store
        .select('dash')
        .pipe(
          tap((val) => {
            if (val.playerBasicInfo.name != null && this.profile === 'player') {
              this.isLoading = false;
            } else if (
              val.fsInfo.name != null &&
              this.profile === 'freestyler'
            ) {
              this.isLoading = false;
            }
          }),
          map((info) => {
            this.playerName = info.playerBasicInfo.name;
            this.profilePhoto = info.playerMoreInfo.imgpath_lg;
            this.nickname = info.playerMoreInfo.nickname;
            this.smLinks = info.socials;
            if (this.profile === 'player') {
              return {
                Age: this.getAge(info.playerMoreInfo.born),
                Gender: this.getGender(info.playerBasicInfo.gen),
                Height: this.getHeight(info.playerMoreInfo.height),
                Team: this.getTeam(info.playerBasicInfo.team),
                Weight: this.getWeight(info.playerMoreInfo.weight),
                'Playing Position': info.playerBasicInfo.pl_pos,
                'Lives in': this.getLocation(
                  info.playerBasicInfo.locCity,
                  info.playerMoreInfo.locState
                ),
                'Strong Foot': this.getStrongFoot(info.playerMoreInfo.str_ft),
              };
            } else {
              return {
                Age: this.getAge(info.playerMoreInfo.born),
                Country: info.playerMoreInfo.locCountry,
                bio: info.playerMoreInfo.bio?.slice(0, 30).concat('...'),
              };
            }
          })
        )
        .subscribe((data) => {
          this.mainProperties = data;
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getTeam(team: { name: string; id: string; capId: string } | null): string {
    return team ? team.name : 'No Team';
  }

  getAge(birthdate: number): any {
    if (birthdate === null) {
      return birthdate;
    }
    const diffInMilliseconds = Date.now() - birthdate;
    const ageDate = new Date(diffInMilliseconds);
    return Math.abs(ageDate.getUTCFullYear() - 1970).toString() + ' yrs';
  }

  getGender(g: 'M' | 'F'): string {
    if (!g) {
      return null;
    }
    return g === 'M' ? 'Male' : 'Female';
  }

  getStrongFoot(Str: 'L' | 'R'): string {
    if (!Str) {
      return null;
    }
    return Str === 'L' ? 'Left' : 'Right';
  }

  getLocation(city: string | null | undefined, state: string | null | undefined): string {
    if (city == null) {
      return state;
    } else if (state == null) {
      return city;
    } else {
      return `${city}, ${state}`;
    }
  }

  getHeight(height: number): string | undefined {
    return height ? `${height.toString()} cms` : null;
  }

  getWeight(weight: number): string | undefined {
    return weight ? `${weight.toString()} kgs` : null;
  }

  onEnlargePhoto(imageUrl: string): any {
    this.enlargeService.onOpenPhoto(imageUrl);
  }

  getHeading(): string {
    return this.profile === 'player' ? 'basic info' : 'freestyler info';
  }

  onOpenAccountSettings(): void {
    this.router.navigate(['/dashboard', 'account', 'profile']);
  }

  onUploadPhoto(): void {
    const dialogRef = this.dialog
      .open(UploadphotoComponent, {
        panelClass: 'large-dialogs',
        data: this.profilePhoto,
        disableClose: true,
      })
      .afterClosed()
      .subscribe(() => location.reload());
  }

  onShareProfile(): void {
    const uid = localStorage.getItem('uid');
    const shareStatus = JSON.parse(localStorage.getItem(uid));
    if (!shareStatus) {
      localStorage.setItem(uid, JSON.stringify({ isProfileShared: true }));
    }
    const data = new ShareData();
    data.share_url = `/p/${uid}`;
    data.share_title = this.playerName;
    this.socialShareService.onShare(data);
  }
}
