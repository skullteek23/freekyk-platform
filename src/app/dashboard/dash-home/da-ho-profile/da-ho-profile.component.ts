import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { SocialMediaLinks } from 'src/app/shared/interfaces/user.model';
import { UploadphotoComponent } from '../../dialogs/uploadphoto/uploadphoto.component';
import { DashState } from '../../store/dash.reducer';
import firebase from 'firebase/app';
import { SocialShareService } from 'src/app/services/social-share.service';
import { ShareData } from 'src/app/shared/interfaces/others.model';
import { LOREM_IPSUM_SHORT } from 'src/app/shared/Constants/LOREM_IPSUM';
import { EnlargeService } from 'src/app/services/enlarge.service';
@Component({
  selector: 'app-da-ho-profile',
  templateUrl: './da-ho-profile.component.html',
  styleUrls: ['./da-ho-profile.component.css'],
})
export class DaHoProfileComponent implements OnInit {
  @Input('profile') profileType: 'player' | 'freestyler' = 'player';
  playerName: string = 'Your Name';
  isLoading: boolean = true;
  defaultString = 'Add this info';
  mainProperties: {};
  smLinks: SocialMediaLinks;
  profilePhoto: string;
  nickname: string;
  subs: Subscription;
  subs2: Subscription;
  constructor(
    private enlServ: EnlargeService,
    private dialog: MatDialog,
    private router: Router,
    private store: Store<{
      dash: DashState;
    }>,
    private shareServ: SocialShareService
  ) {}
  ngOnInit(): void {
    this.store
      .select('dash')
      .pipe(
        tap((val) => {
          if (
            val.playerBasicInfo.name != null &&
            this.profileType == 'player'
          ) {
            this.isLoading = false;
          } else if (
            val.fsInfo.name != null &&
            this.profileType == 'freestyler'
          ) {
            this.isLoading = false;
          }
        }),
        map((info) => {
          this.playerName = info.playerBasicInfo.name;
          this.profilePhoto = info.playerMoreInfo.imgpath_lg;
          this.nickname = info.playerMoreInfo.nickname;
          this.smLinks = info.socials;
          if (this.profileType == 'player') {
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
              Country: info.fsInfo.locCountry,
              bio: info.fsInfo.bio?.slice(0, 30).concat('...'),
            };
          }
        })
      )
      .subscribe((data) => {
        this.mainProperties = data;
      });
  }

  getTeam(team: { name: string; id: string; capId: string } | null) {
    if (team == null) return 'No Team';
    return team.name;
  }
  getAge(birthdate: firebase.firestore.Timestamp | null) {
    if (birthdate == null) return null;
    var diff_ms = Date.now() - birthdate.seconds * 1000;
    var age_dt = new Date(diff_ms);
    return Math.abs(age_dt.getUTCFullYear() - 1970).toString() + ' yrs';
  }
  getGender(g: 'M' | 'F') {
    if (!g) return null;
    return g == 'M' ? 'Male' : 'Female';
  }
  getStrongFoot(Str: 'L' | 'R') {
    if (!Str) return null;
    return Str == 'L' ? 'Left' : 'Right';
  }
  getLocation(
    city: string | null | undefined,
    state: string | null | undefined
  ): undefined | string {
    if (city == null) return state;
    else if (state == null) return city;
    else return city + ', ' + state;
  }
  getHeight(height: number): string | undefined {
    if (height) return height.toString() + ' cms';
    return null;
  }
  getWeight(weight: number): string | undefined {
    if (weight) return weight.toString() + ' kgs';
    return null;
  }
  onEnlargePhoto(imageUrl: string) {
    this.enlServ.onOpenPhoto(imageUrl);
  }
  getHeading() {
    if (this.profileType == 'player') return 'basic info';
    return 'freestyler info';
  }
  onOpenAccountSettings() {
    this.router.navigate(['/dashboard', 'account', 'profile']);
  }
  onUploadPhoto() {
    const dialogRef = this.dialog.open(UploadphotoComponent, {
      panelClass: 'large-dialogs',
    });
  }
  onShareProfile() {
    const shareData: ShareData = {
      share_imgpath: this.playerName,
      share_desc: LOREM_IPSUM_SHORT,
      share_title: this.profilePhoto,
      share_url:
        `https://freekyk8--h-qcd2k7n4.web.app/${
          this.profileType == 'freestyler' ? 'f/' : 'p/'
        }` + localStorage.getItem('uid'),
    };

    this.shareServ.onShare(shareData);
  }
}
