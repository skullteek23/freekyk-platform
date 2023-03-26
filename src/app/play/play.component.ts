import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { RouteLinks } from '@shared/Constants/ROUTE_LINKS';
import { PLAY_PAGE } from '@shared/web-content/WEBSITE_CONTENT';
import { ListOption } from '@shared/interfaces/others.model';
import { MatDialog } from '@angular/material/dialog';
import { LiveSeasonComponent } from '@app/shared/dialogs/live-season/live-season.component';
import { SeasonBasicInfo } from '@shared/interfaces/season.model';
import { ApiGetService } from '@shared/services/api.service';

@Component({
  selector: 'app-play',
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.scss'],
})
export class PlayComponent implements OnInit, OnDestroy {

  readonly SCROLL_HEIGHT = 420;
  readonly mainContent = PLAY_PAGE.banner;

  playLinks: ListOption[] = RouteLinks.PLAY;
  subscriptions = new Subscription();
  activeLink = '';
  seasonsList: SeasonBasicInfo[] = [];

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private apiService: ApiGetService
  ) { }

  ngOnInit(): void {
    if (window.location.href.endsWith('play')) {
      this.router.navigate(['/play/home']);
    }
    this.subscriptions.add(
      this.router.events.subscribe((event: any) => {
        if (event instanceof NavigationEnd) {
          this.activeLink = event.url.slice('/play/'.length);
          if (window.innerWidth > 600) {
            window.scrollTo(0, this.SCROLL_HEIGHT);
          } else {
            window.scrollTo(0, 0);
          }
        }
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getLiveSeasons() {
    this.apiService.getLiveSeasons()
      .subscribe({
        next: (response) => {
          this.seasonsList = response;
        },
        error: () => {
          this.seasonsList = [];
        }
      });
  }

  openLiveSeason(data: SeasonBasicInfo) {
    this.dialog.open(LiveSeasonComponent, {
      panelClass: 'fk-dialogs',
      data
    });
  }
}
