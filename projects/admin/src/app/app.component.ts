import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'admin';
  cols: number;
  watcher = new Subscription();
  links: any[] = [
    { name: 'seasons', route: 'seasons' },
    { name: 'grounds', route: 'grounds' }
  ];
  activeLink = 'seasons';
  constructor(private mediaObs: MediaObserver, private router: Router) {
    this.watcher.add(this.mediaObs
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
    this.watcher.add(this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.activeLink = event.url.slice('/'.length);
      }
    }))
  }
  ngOnInit(): void {
    this.router.navigate(['/seasons']);
  }
  ngOnDestroy(): void {
    if (this.watcher) {
      this.watcher.unsubscribe();
    }
  }
}
