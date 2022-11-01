import { Component, OnDestroy } from '@angular/core';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-main-shell',
  templateUrl: './main-shell.component.html',
  styleUrls: ['./main-shell.component.css']
})
export class MainShellComponent implements OnDestroy {
  activeLink = '';
  cols: number;
  links: any[] = [
    { name: 'seasons', route: '/seasons/list' },
    { name: 'grounds', route: '/grounds' }
  ];
  subscriptions = new Subscription();

  constructor(private mediaObs: MediaObserver, private router: Router) {
    this.subscriptions.add(this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        const route = event.url.split('/');
        if (route.length === 2 && route[1] === '') {
          this.router.navigate(['/seasons/list']);
        } else {
          this.activeLink = route[1];
        }
      }
    }));
    this.subscriptions.add(this.mediaObs
      .asObservable()
      .pipe(
        filter((changes: MediaChange[]) => changes.length > 0),
        map((changes: MediaChange[]) => changes[0])
      )
      .subscribe((change: MediaChange) => {
        if (change.mqAlias === 'xs') {
          this.cols = 1;
        } else if (change.mqAlias === 'sm') {
          this.cols = 2;
        } else {
          this.cols = 3;
        }
      }));
  }
  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  goHome(): void {
    this.router.navigate(['/seasons/list']);
  }
}
