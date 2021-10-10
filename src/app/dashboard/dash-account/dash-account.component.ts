import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { RouteLinks } from 'src/app/shared/Constants/ROUTE_LINKS';
@Component({
  selector: 'app-dash-account',
  templateUrl: './dash-account.component.html',
  styleUrls: ['./dash-account.component.css'],
})
export class DashAccountComponent implements OnInit, OnDestroy {
  activeLink = '';
  accountLinks: string[] = [];
  subscriptions = new Subscription();
  constructor(private router: Router) {}
  ngOnInit(): void {
    this.accountLinks = RouteLinks.DASHBOARD_ACCOUNT;
    this.subscriptions.add(
      this.router.events
        .pipe(filter((e) => e instanceof NavigationEnd))
        .subscribe((event: any) => {
          this.activeLink = event.url.slice('/dashboard/account/'.length);
        })
    );
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
