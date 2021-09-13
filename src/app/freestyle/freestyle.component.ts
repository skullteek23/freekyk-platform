import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { RouteLinks } from '../shared/Constants/ROUTE_LINKS';

@Component({
  selector: 'app-freestyle',
  templateUrl: './freestyle.component.html',
  styleUrls: ['./freestyle.component.css'],
})
export class FreestyleComponent implements OnInit, OnDestroy {
  fsLinks: string[] = RouteLinks.FREESTYLE;
  routeSubscription: Subscription;
  activeLink: string = 'home';
  constructor(private router: Router) {
    this.routeSubscription = this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.activeLink = event.url.slice('/freestyle/'.length);
      }
    });
  }
  ngOnInit(): void {}
  ngOnDestroy() {
    this.routeSubscription.unsubscribe();
  }
}
