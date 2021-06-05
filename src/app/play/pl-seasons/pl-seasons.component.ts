import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { Meta, Title } from '@angular/platform-browser';
import { Observable, Subscription } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { SocialShareService } from 'src/app/services/social-share.service';
import {
  LOREM_IPSUM_LONG,
  LOREM_IPSUM_SHORT,
} from 'src/app/shared/Constants/CONSTANTS';
import { ShareData } from 'src/app/shared/interfaces/others.model';
import { SeasonBasicInfo } from 'src/app/shared/interfaces/season.model';

@Component({
  selector: 'app-pl-seasons',
  templateUrl: './pl-seasons.component.html',
  styleUrls: ['./pl-seasons.component.css'],
})
export class PlSeasonsComponent implements OnInit, OnDestroy {
  isLoading: boolean = true;
  noSeasons: boolean = false;
  seasons$: Observable<SeasonBasicInfo[]>;
  seasonFilters = ['Premium', 'Location', 'Upcoming', 'Containing Tournaments'];
  watcher: Subscription;
  columns: any;
  constructor(
    private ngFire: AngularFirestore,
    private mediaObs: MediaObserver,
    private shareServ: SocialShareService,
    private title: Title,
    private meta: Meta
  ) {
    this.watcher = this.mediaObs
      .asObservable()
      .pipe(
        filter((changes: MediaChange[]) => changes.length > 0),
        map((changes: MediaChange[]) => changes[0])
      )
      .subscribe((change: MediaChange) => {
        if (change.mqAlias === 'xs') {
          this.columns = 1;
        } else if (change.mqAlias === 'sm') {
          this.columns = 2;
        } else if (change.mqAlias === 'md') {
          this.columns = 3;
        } else {
          this.columns = 4;
        }
      });
  }
  ngOnInit(): void {
    this.getSeasons();
  }
  ngOnDestroy() {
    this.watcher.unsubscribe();
  }
  getSeasons() {
    this.seasons$ = this.ngFire
      .collection('seasons')
      .get()
      .pipe(
        tap((val) => {
          this.noSeasons = val.empty;
          this.isLoading = false;
        }),
        map((resp) => resp.docs.map((doc) => <SeasonBasicInfo>doc.data()))
      );
  }
  onShare(season: SeasonBasicInfo) {
    const ShareData: ShareData = {
      share_title: season.name,
      share_desc: LOREM_IPSUM_SHORT,
      share_url: 'https://freekyk8--h-qcd2k7n4.web.app/' + 's/' + season.name,
      share_imgpath: season.imgpath,
    };
    this.shareServ.onShare(ShareData);
  }
}
