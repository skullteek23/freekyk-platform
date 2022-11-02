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
  readonly mainContent = PLAY_PAGE.banner;
  playLinks: string[] = RouteLinks.PLAY;
  routeSubscription: Subscription;
  activeLink = '';
  constructor(private router: Router) {
    if (window.location.href.endsWith('play')) {
      this.router.navigate(['/play/home']);
    }
    this.routeSubscription = this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.activeLink = event.url.slice('/play/'.length);
      }
    });
  }
  ngOnInit(): void { }
  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
  }
}
