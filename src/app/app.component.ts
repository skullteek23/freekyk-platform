import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { LoadingService } from './services/loading.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {

  title = 'football-platform-v1';
  menuOpen = false;
  dashOpen = false;
  routeSubscription: Subscription = new Subscription();
  isLoaderShown = false;

  constructor(
    private router: Router,
    private loadingService: LoadingService
  ) { }

  ngOnInit(): void {
    this.routeSubscription = this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        // if (event instanceof NavigationEnd && !event.url.includes('/dashboard/home')) {
        this.dashOpen = event.url.includes('dashboard');
        window.scrollTo(0, 0);
      }
    });
    this.loadingService._loadingStatusChange.subscribe(response => {
      this.isLoaderShown = response;
    })
  }

  onOpenMenu(eventValue: any): any {
    this.menuOpen = eventValue;
  }

  ngOnDestroy(): any {
    this.routeSubscription.unsubscribe();
    localStorage.removeItem('uid');
  }

}
