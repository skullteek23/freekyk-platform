import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { EnlargeService } from 'src/app/services/enlarge.service';
import { TeamService } from 'src/app/services/team.service';
import { SocialMediaLinks } from '@shared/interfaces/user.model';
import { AppState } from 'src/app/store/app.reducer';

@Component({
  selector: 'app-da-te-profile',
  templateUrl: './da-te-profile.component.html',
  styleUrls: ['./da-te-profile.component.scss'],
  providers: [DatePipe],
})
export class DaTeProfileComponent implements OnInit, OnDestroy {
  isLoading = true;
  tName: string;
  defaultString = '-';
  mainProperties: {};
  smLinks: SocialMediaLinks | null;
  logoUrl: string;
  photoUrl: string;
  subscriptions = new Subscription();
  constructor(
    private enlServ: EnlargeService,
    private teServ: TeamService,
    private datePipe: DatePipe,
    private store: Store<AppState>,
    private router: Router
  ) { }
  ngOnInit(): void {
    this.subscriptions.add(
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
              'Created On': this.getCreationDate(info.moreInfo.tdateCreated),
              'age category': this.getAgeCategory(info.moreInfo.tageCat),
              captain: info.moreInfo.captainName,
              location: this.getLocation(
                info.basicInfo?.locCity,
                info.basicInfo?.locState
              ),
              'team slogan': info.moreInfo.tslogan,
              description: info.moreInfo?.tdesc
                ? info.moreInfo?.tdesc
                : null,
            };
          })
        )
        .subscribe((data) => {
          this.mainProperties = data;
        })
    );
  }
  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  getCreationDate(date: any): string {
    if (date && date.hasOwnProperty('seconds')) {
      return date ? this.datePipe.transform(date['seconds'] * 1000, 'mediumDate') : null;
    } else {
      return date ? this.datePipe.transform(date, 'mediumDate') : null;
    }
  }
  getAgeCategory(category: number): string {
    return category ? `U-${category.toString()}` : null;
  }
  getLocation(
    city: string | null | undefined,
    state: string | null | undefined
  ): string {
    if (city == null) {
      return state;
    } else if (state == null) {
      return city;
    } else {
      return `${city}, ${state}`;
    }
  }
  onEnlargePhoto(imageUrl: string): void {
    this.enlServ.onOpenPhoto(imageUrl);
  }
  onNavigateToTeamPage(): void {
    if (this.tName) {
      this.router.navigate(['/t', this.tName]);
    }
  }
  onOpenTeamSettings(): void {
    this.teServ.onOpenTeamSettingsDialog();
  }
}
