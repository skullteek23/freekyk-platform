import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { RouteLinks } from '@shared/Constants/ROUTE_LINKS';
import { PLAY_PAGE } from '@shared/Constants/WEBSITE_CONTENT';

@Component({
  selector: 'app-play',
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.scss'],
})
export class PlayComponent implements OnInit, OnDestroy {

  readonly SCROLL_HEIGHT = 420;
  readonly mainContent = PLAY_PAGE.banner;

  playLinks: string[] = RouteLinks.PLAY;
  subscriptions = new Subscription();
  activeLink = '';

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
    if (window.location.href.endsWith('play')) {
      this.router.navigate(['/play/home']);
    }
    this.subscriptions.add(
      this.router.events.subscribe((event: any) => {
        if (event instanceof NavigationEnd) {
          this.activeLink = event.url.slice('/play/'.length);
          window.scrollTo(0, this.SCROLL_HEIGHT);
        }
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
