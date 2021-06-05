import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { tap, map } from 'rxjs/operators';
import { EnlargeService } from 'src/app/services/enlarge.service';
import { SocialShareService } from 'src/app/services/social-share.service';
import { TeamService } from 'src/app/services/team.service';
import { SocialMediaLinks } from 'src/app/shared/interfaces/user.model';
import { AppState } from 'src/app/store/app.reducer';

@Component({
  selector: 'app-da-te-profile',
  templateUrl: './da-te-profile.component.html',
  styleUrls: ['./da-te-profile.component.css'],
  providers: [DatePipe],
})
export class DaTeProfileComponent implements OnInit {
  isLoading: boolean = true;
  tName: string;
  defaultString = 'Add this info';
  mainProperties: {};
  smLinks: SocialMediaLinks | null;
  logoUrl: string;
  photoUrl: string;
  constructor(
    private enlServ: EnlargeService,
    private teServ: TeamService,
    private datePipe: DatePipe,
    private store: Store<AppState>
  ) {
    this.store
      .select('team')
      .pipe(
        tap(() => (this.isLoading = false)),
        map((info) => {
          this.tName = info.basicInfo.tname;
          this.photoUrl = info.basicInfo.imgpath;
          this.logoUrl = info.basicInfo.imgpath_logo;
          this.photoUrl = info.basicInfo.imgpath;
          this.smLinks = info.moreInfo.tSocials;
          return {
            'Created On': this.getCreationDate(
              info.moreInfo.tdateCreated?.toDate()
            ),
            'age category': this.getAgeCategory(info.moreInfo.tageCat),
            captain: info.moreInfo.captainName,
            location: this.getLocation(
              info.basicInfo?.locCity,
              info.basicInfo?.locState
            ),
            'team slogan': info.moreInfo.tslogan,
            description: info.moreInfo?.tdesc
              ? info.moreInfo?.tdesc?.slice(0, 30) + '...'
              : null,
          };
        })
      )
      .subscribe((data) => {
        this.mainProperties = data;
      });
  }
  ngOnInit(): void {}

  getCreationDate(date: Date) {
    if (date == null) return null;
    return this.datePipe.transform(date, 'mediumDate');
  }
  getAgeCategory(category: number) {
    if (!category) return null;
    return 'U-' + category.toString();
  }
  getLocation(
    city: string | null | undefined,
    state: string | null | undefined
  ): undefined | string {
    if (city == null) return state;
    else if (state == null) return city;
    else return city + ', ' + state;
  }
  onEnlargePhoto(imageUrl: string) {
    this.enlServ.onOpenPhoto(imageUrl);
  }
  onOpenTeamSettings() {
    this.teServ.onOpenTeamSettingsDialog();
  }
}
