import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { RouteLinks } from '../shared/Constants/ROUTE_LINKS';

@Component({
  selector: 'app-play',
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.css'],
})
export class PlayComponent implements OnInit, OnDestroy {
  playLinks: string[] = RouteLinks.PLAY;
  routeSubscription: Subscription;
  activeLink = '';
  constructor(private router: Router) {
    this.routeSubscription = this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.activeLink = event.url.slice('/play/'.length);
      }
    });
  }
  ngOnInit(): void {}
  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
  }
}
