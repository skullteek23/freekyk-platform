import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, pairwise, tap } from 'rxjs/operators';

@Component({
  selector: 'app-dash-account',
  templateUrl: './dash-account.component.html',
  styleUrls: ['./dash-account.component.css'],
})
export class DashAccountComponent implements OnInit, OnDestroy {
  activeLink: string = '';
  accountLinks: string[] = [];
  routeSubscription: Subscription;
  constructor(private router: Router) {}
  ngOnInit(): void {
    this.accountLinks = [
      'profile',
      'notifications',
      'addresses',
      'orders',
      'tickets',
    ];
    this.routeSubscription = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.activeLink = event.url.slice('/dashboard/account/'.length);
      });
  }
  ngOnDestroy() {
    this.routeSubscription.unsubscribe();
  }
}
