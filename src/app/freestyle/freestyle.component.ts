import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { RouteLinks } from '@shared/Constants/ROUTE_LINKS';
import { FREESTYLE_PAGE } from '@shared/web-content/WEBSITE_CONTENT';
import { ListOption } from '@shared/interfaces/others.model';

@Component({
  selector: 'app-freestyle',
  templateUrl: './freestyle.component.html',
  styleUrls: ['./freestyle.component.scss'],
})
export class FreestyleComponent implements OnInit, OnDestroy {

  readonly fsBannerContent = FREESTYLE_PAGE.banner;

  fsLinks: ListOption[] = RouteLinks.FREESTYLE;
  routeSubscription: Subscription;
  activeLink = 'home';

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
    if (window.location.href.endsWith('freestyle')) {
      this.router.navigate(['/freestyle/home']);
    }
    this.routeSubscription = this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/freestyle') {
          this.router.navigate(['freestyle/home']);
        }
        this.activeLink = event.url.slice('/freestyle/'.length);
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
  }
}
